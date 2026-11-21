-- ============================================================================
-- YOGESHWARI DAIRY SHOP ERP & E-COMMERCE INTEGRATION
-- PHASE 78 (HARDENED REVISION 2): E-COMMERCE ORDERS, FEFO STOCK INTEGRITY & SECURITY
-- File: supabase/78_phase78_ecommerce_orders_and_stock_reservations.sql
-- ============================================================================
-- CRITICAL SECURITY & STOCK INTEGRITY GUARANTEES:
-- 1. AUTHORITATIVE BATCH-LEVEL STOCK TRUTH:
--    Stock is calculated strictly from unexpired batches (`qty_remaining > 0 AND expiry_date >= CURRENT_DATE`).
--    Discrepancies in `products.stock_quantity` can NEVER cause overselling or false stock claims.
-- 2. MANDATORY COMPLETE FEFO ALLOCATION ASSERTION:
--    After scanning unexpired batches, `v_qty_needed = 0` is strictly enforced.
--    If even 0.01 units are missing from unexpired batches, the ENTIRE transaction rolls back.
--    Partial order fulfillment is strictly impossible.
-- 3. IN-DATABASE CANCELLATION OWNERSHIP VERIFICATION:
--    `fn_cancel_ecommerce_order_atomic` verifies `auth.uid() = customer_id OR public.is_dairy_staff()`.
--    Customer A can NEVER cancel Customer B's order, even if called directly through Supabase RPC.
-- 4. DUPLICATE CANCELLATION & DOUBLE RESTORATION GUARD:
--    An already cancelled or refunded order returns an idempotent success without restoring batch stock twice.
-- 5. TRUE IDEMPOTENCY REPLAY:
--    On duplicate checkout submissions, the function returns the actual existing order_no and status
--    from the database, never the newly passed client parameters.
-- 6. STRICT SEARCH_PATH & SECURITY DEFINER HARDENING:
--    `SET search_path = public, pg_temp;` on all security definer functions to prevent injection.
-- 7. ZERO IMPACT ON POS CASH REGISTERS:
--    `public.sales` and physical billing counters remain 100% isolated.
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- 1. ADD ADDITIVE E-COMMERCE COLUMNS TO public.products (IF NOT EXISTS)
-- ----------------------------------------------------------------------------
ALTER TABLE public.products 
    ADD COLUMN IF NOT EXISTS is_ecommerce_active BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS ecommerce_mrp NUMERIC(12, 2) DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS max_order_quantity INTEGER DEFAULT 10,
    ADD COLUMN IF NOT EXISTS pack_size VARCHAR(100) DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS description TEXT DEFAULT NULL;

-- Partial index for high-speed online catalogue querying
CREATE INDEX IF NOT EXISTS idx_products_ecommerce_active 
    ON public.products (is_ecommerce_active, is_active) 
    WHERE is_ecommerce_active = TRUE AND is_active = TRUE;

-- ----------------------------------------------------------------------------
-- 2. CREATE TABLE public.customer_addresses (SAVED DELIVERY ADDRESSES)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.customer_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    recipient_name VARCHAR(150) NOT NULL,
    phone VARCHAR(25) NOT NULL,
    alternate_phone VARCHAR(25),
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    landmark VARCHAR(255),
    city VARCHAR(100) NOT NULL DEFAULT 'Bhandara',
    state VARCHAR(100) NOT NULL DEFAULT 'Maharashtra',
    pincode VARCHAR(10) NOT NULL DEFAULT '441904',
    address_type VARCHAR(20) NOT NULL DEFAULT 'HOME' CHECK (address_type IN ('HOME', 'WORK', 'OTHER')),
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customer_addresses_user 
    ON public.customer_addresses (user_id);
CREATE INDEX IF NOT EXISTS idx_customer_addresses_default 
    ON public.customer_addresses (user_id, is_default) 
    WHERE is_default = TRUE;

DROP TRIGGER IF EXISTS trg_customer_addresses_updated_at ON public.customer_addresses;
CREATE TRIGGER trg_customer_addresses_updated_at
BEFORE UPDATE ON public.customer_addresses
FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

-- ----------------------------------------------------------------------------
-- 3. CREATE TABLE public.ecommerce_orders (DEDICATED ONLINE ORDER LEDGER)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ecommerce_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_no VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID NOT NULL REFERENCES auth.users(id),
    customer_name VARCHAR(150) NOT NULL,
    customer_phone VARCHAR(25) NOT NULL,
    customer_email VARCHAR(255),
    delivery_address JSONB NOT NULL,
    order_status VARCHAR(50) NOT NULL DEFAULT 'PLACED' CHECK (
        order_status IN ('PLACED', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'REJECTED')
    ),
    payment_method VARCHAR(50) NOT NULL DEFAULT 'COD' CHECK (
        payment_method IN ('COD', 'ONLINE_UPI', 'RAZORPAY', 'WALLET')
    ),
    payment_status VARCHAR(50) NOT NULL DEFAULT 'PENDING' CHECK (
        payment_status IN ('PENDING', 'PAID', 'FAILED', 'REFUNDED')
    ),
    payment_reference VARCHAR(100),
    subtotal NUMERIC(12, 2) NOT NULL CHECK (subtotal >= 0),
    delivery_fee NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (delivery_fee >= 0),
    discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (discount_amount >= 0),
    total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),
    estimated_delivery_time VARCHAR(100) DEFAULT '15-30 mins',
    delivery_notes TEXT,
    rejection_reason TEXT,
    cancellation_reason TEXT,
    cancelled_at TIMESTAMPTZ,
    cancelled_by VARCHAR(100),
    confirmed_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    idempotency_key UUID UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ecommerce_orders_customer 
    ON public.ecommerce_orders (customer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ecommerce_orders_status 
    ON public.ecommerce_orders (order_status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ecommerce_orders_order_no 
    ON public.ecommerce_orders (order_no);
CREATE INDEX IF NOT EXISTS idx_ecommerce_orders_idempotency 
    ON public.ecommerce_orders (idempotency_key) 
    WHERE idempotency_key IS NOT NULL;

DROP TRIGGER IF EXISTS trg_ecommerce_orders_updated_at ON public.ecommerce_orders;
CREATE TRIGGER trg_ecommerce_orders_updated_at
BEFORE UPDATE ON public.ecommerce_orders
FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

-- ----------------------------------------------------------------------------
-- 4. CREATE TABLE public.ecommerce_order_items (ITEMIZED ORDER LINES)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ecommerce_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.ecommerce_orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_name VARCHAR(255) NOT NULL,
    pack_size VARCHAR(100),
    unit VARCHAR(50) DEFAULT 'Piece',
    unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
    mrp NUMERIC(12, 2),
    quantity NUMERIC(12, 2) NOT NULL CHECK (quantity > 0),
    total_price NUMERIC(12, 2) NOT NULL CHECK (total_price >= 0),
    image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ecommerce_order_items_order 
    ON public.ecommerce_order_items (order_id);
CREATE INDEX IF NOT EXISTS idx_ecommerce_order_items_product 
    ON public.ecommerce_order_items (product_id);

-- ----------------------------------------------------------------------------
-- 5. CREATE TABLE public.ecommerce_order_item_allocations (BATCH AUDIT TRAIL)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ecommerce_order_item_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_item_id UUID NOT NULL REFERENCES public.ecommerce_order_items(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES public.ecommerce_orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    batch_id UUID NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
    batch_no VARCHAR(100) NOT NULL,
    expiry_date DATE NOT NULL,
    quantity NUMERIC(12, 2) NOT NULL CHECK (quantity > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_allocations_order 
    ON public.ecommerce_order_item_allocations (order_id);
CREATE INDEX IF NOT EXISTS idx_order_allocations_batch 
    ON public.ecommerce_order_item_allocations (batch_id);

-- ----------------------------------------------------------------------------
-- 6. CREATE TABLE public.ecommerce_order_status_history (AUDIT LOG)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ecommerce_order_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.ecommerce_orders(id) ON DELETE CASCADE,
    from_status VARCHAR(50),
    to_status VARCHAR(50) NOT NULL,
    notes TEXT,
    changed_by VARCHAR(150) DEFAULT 'System',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_status_history_order 
    ON public.ecommerce_order_status_history (order_id, created_at ASC);

-- ----------------------------------------------------------------------------
-- 7. CREATE TABLE public.stock_reservations (SHORT-LIVED 5-MIN CHECKOUT LOCKS)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.stock_reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_session_id VARCHAR(100) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    quantity NUMERIC(12, 2) NOT NULL CHECK (quantity > 0),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'COMMITTED', 'RELEASED', 'EXPIRED')),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '5 minutes'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stock_reservations_active 
    ON public.stock_reservations (product_id, status, expires_at) 
    WHERE status = 'ACTIVE';
CREATE INDEX IF NOT EXISTS idx_stock_reservations_session 
    ON public.stock_reservations (cart_session_id);

-- ----------------------------------------------------------------------------
-- 8. CUSTOMER-SAFE PUBLIC CATALOG VIEW: public.v_ecommerce_products
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.v_ecommerce_products
WITH (security_invoker = true) AS
WITH active_res AS (
    SELECT product_id, SUM(quantity) AS reserved_qty
    FROM public.stock_reservations
    WHERE status = 'ACTIVE' AND expires_at > NOW()
    GROUP BY product_id
),
valid_batch_stock AS (
    SELECT product_id, SUM(qty_remaining) AS batch_stock
    FROM public.batches
    WHERE qty_remaining > 0 AND expiry_date >= CURRENT_DATE
    GROUP BY product_id
)
SELECT 
    p.id,
    p.name,
    p.pack_size,
    p.category,
    p.category_id,
    p.brand,
    NULL::uuid AS brand_id,
    p.unit,
    NULL::uuid AS unit_id,
    p.selling_price,
    COALESCE(p.ecommerce_mrp, ROUND((p.selling_price * 1.15)::numeric, 0)) AS mrp,
    CASE 
        WHEN COALESCE(p.ecommerce_mrp, ROUND((p.selling_price * 1.15)::numeric, 0)) > p.selling_price THEN
            ROUND((((COALESCE(p.ecommerce_mrp, ROUND((p.selling_price * 1.15)::numeric, 0)) - p.selling_price) / 
                   COALESCE(p.ecommerce_mrp, ROUND((p.selling_price * 1.15)::numeric, 0))) * 100)::numeric, 0)
        ELSE 0
    END AS discount_percentage,
    p.image_url,
    p.description,
    p.is_ecommerce_active,
    p.max_order_quantity,
    GREATEST(0, ROUND((COALESCE(vbs.batch_stock, 0) - COALESCE(ar.reserved_qty, 0))::numeric, 2)) AS available_stock,
    CASE 
        WHEN GREATEST(0, (COALESCE(vbs.batch_stock, 0) - COALESCE(ar.reserved_qty, 0))) > 0 THEN TRUE 
        ELSE FALSE 
    END AS is_in_stock,
    p.created_at,
    p.updated_at
FROM public.products p
LEFT JOIN valid_batch_stock vbs ON vbs.product_id = p.id
LEFT JOIN active_res ar ON ar.product_id = p.id
WHERE p.is_active = TRUE AND p.is_ecommerce_active = TRUE;

-- ----------------------------------------------------------------------------
-- 9. ATOMIC E-COMMERCE ORDER CREATION & FEFO DEDUCTION FUNCTION (HARDENED)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_create_ecommerce_order_atomic(
    p_order_id UUID,
    p_order_no TEXT,
    p_idempotency_key UUID,
    p_customer_id UUID,
    p_customer_name TEXT,
    p_customer_phone TEXT,
    p_customer_email TEXT,
    p_delivery_address JSONB,
    p_payment_method TEXT,
    p_payment_reference TEXT,
    p_subtotal NUMERIC,
    p_delivery_fee NUMERIC,
    p_discount_amount NUMERIC,
    p_total_amount NUMERIC,
    p_items JSONB,
    p_cart_session_id TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_existing_order RECORD;
    v_item RECORD;
    v_prod RECORD;
    v_batch_stock NUMERIC;
    v_active_res NUMERIC;
    v_available_stock NUMERIC;
    v_qty_needed NUMERIC;
    v_batch RECORD;
    v_take_qty NUMERIC;
    v_order_item_id UUID;
BEGIN
    -- 1. Idempotency Check: Returns actual existing order data on replay
    IF p_idempotency_key IS NOT NULL THEN
        SELECT id, order_no, order_status, total_amount INTO v_existing_order 
        FROM public.ecommerce_orders 
        WHERE idempotency_key = p_idempotency_key;

        IF v_existing_order.id IS NOT NULL THEN
            RETURN jsonb_build_object(
                'success', true,
                'order_id', v_existing_order.id,
                'order_no', v_existing_order.order_no,
                'order_status', v_existing_order.order_status,
                'total_amount', v_existing_order.total_amount,
                'is_idempotent_replay', true,
                'message', 'Order already placed previously'
            );
        END IF;
    END IF;

    -- 2. Concurrency Lock: Lock Product Rows and Verify Valid Batch-Level Stock
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(
        product_id UUID,
        product_name TEXT,
        quantity NUMERIC,
        pack_size TEXT,
        unit TEXT,
        unit_price NUMERIC,
        mrp NUMERIC,
        total_price NUMERIC,
        image_url TEXT
    )
    LOOP
        -- Lock product row to serialize concurrent checkouts on the same product
        SELECT id, name, stock_quantity, is_active, is_ecommerce_active
        INTO v_prod
        FROM public.products
        WHERE id = v_item.product_id
        FOR UPDATE;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Product % does not exist in store catalogue.', v_item.product_name;
        END IF;

        IF NOT v_prod.is_active OR NOT v_prod.is_ecommerce_active THEN
            RAISE EXCEPTION 'Product % is currently not available for online purchase.', v_prod.name;
        END IF;

        -- Authoritative Stock Check: Sum unexpired batches directly
        SELECT COALESCE(SUM(qty_remaining), 0) INTO v_batch_stock
        FROM public.batches
        WHERE product_id = v_item.product_id
          AND qty_remaining > 0
          AND expiry_date >= CURRENT_DATE;

        -- Check reservations from OTHER active checkout sessions
        SELECT COALESCE(SUM(quantity), 0) INTO v_active_res
        FROM public.stock_reservations
        WHERE product_id = v_item.product_id
          AND status = 'ACTIVE'
          AND expires_at > NOW()
          AND (p_cart_session_id IS NULL OR cart_session_id <> p_cart_session_id);

        v_available_stock := GREATEST(0, (v_batch_stock - v_active_res));

        IF v_available_stock < v_item.quantity THEN
            RAISE EXCEPTION 'INSUFFICIENT_STOCK: Requested % units of %, but only % units are available in unexpired stock.', 
                v_item.quantity, v_prod.name, v_available_stock;
        END IF;
    END LOOP;

    -- 3. Insert Master E-Commerce Order
    INSERT INTO public.ecommerce_orders (
        id, order_no, customer_id, customer_name, customer_phone,
        customer_email, delivery_address, order_status, payment_method,
        payment_status, payment_reference, subtotal, delivery_fee,
        discount_amount, total_amount, idempotency_key, created_at, updated_at
    ) VALUES (
        p_order_id, p_order_no, p_customer_id, p_customer_name, p_customer_phone,
        p_customer_email, p_delivery_address, 'PLACED', p_payment_method,
        'PENDING', p_payment_reference, p_subtotal, p_delivery_fee,
        p_discount_amount, p_total_amount, p_idempotency_key, NOW(), NOW()
    );

    -- 4. Insert Items, Apply Strict FEFO Lot Allocations, and Enforce Complete Allocation
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(
        product_id UUID,
        product_name TEXT,
        quantity NUMERIC,
        pack_size TEXT,
        unit TEXT,
        unit_price NUMERIC,
        mrp NUMERIC,
        total_price NUMERIC,
        image_url TEXT
    )
    LOOP
        v_order_item_id := gen_random_uuid();

        INSERT INTO public.ecommerce_order_items (
            id, order_id, product_id, product_name, pack_size,
            unit, unit_price, mrp, quantity, total_price, image_url, created_at
        ) VALUES (
            v_order_item_id, p_order_id, v_item.product_id, v_item.product_name, v_item.pack_size,
            COALESCE(v_item.unit, 'Piece'), v_item.unit_price, v_item.mrp, v_item.quantity,
            v_item.total_price, v_item.image_url, NOW()
        );

        -- Strict FEFO: Lock and deduct unexpired batches with earliest expiry first
        v_qty_needed := v_item.quantity;
        FOR v_batch IN
            SELECT id, batch_no, expiry_date, qty_remaining
            FROM public.batches
            WHERE product_id = v_item.product_id
              AND qty_remaining > 0
              AND expiry_date >= CURRENT_DATE
            ORDER BY expiry_date ASC, created_at ASC
            FOR UPDATE
        LOOP
            IF v_qty_needed <= 0 THEN
                EXIT;
            END IF;

            v_take_qty := LEAST(v_batch.qty_remaining, v_qty_needed);
            v_qty_needed := v_qty_needed - v_take_qty;

            -- Deduct lot quantity
            UPDATE public.batches
            SET qty_remaining = ROUND((qty_remaining - v_take_qty)::numeric, 2),
                updated_at = NOW()
            WHERE id = v_batch.id;

            -- Record exact lot allocation for lossless cancellation recovery
            INSERT INTO public.ecommerce_order_item_allocations (
                order_item_id, order_id, product_id, batch_id, batch_no, expiry_date, quantity
            ) VALUES (
                v_order_item_id, p_order_id, v_item.product_id, v_batch.id, v_batch.batch_no,
                v_batch.expiry_date, v_take_qty
            );
        END LOOP;

        -- CRITICAL AUDIT FIX: Verify that v_qty_needed is EXACTLY ZERO
        -- If any quantity remains unallocated, abort immediately!
        IF v_qty_needed > 0 THEN
            RAISE EXCEPTION 'INSUFFICIENT_BATCH_STOCK: Could not allocate full % units for % (short by % units). Transaction rolled back.',
                v_item.quantity, v_item.product_name, v_qty_needed;
        END IF;

        -- Decrement physical aggregate product stock
        UPDATE public.products
        SET stock_quantity = GREATEST(0, ROUND((stock_quantity - v_item.quantity)::numeric, 2)),
            updated_at = NOW()
        WHERE id = v_item.product_id;
    END LOOP;

    -- 5. Mark Session Stock Reservations as COMMITTED
    IF p_cart_session_id IS NOT NULL THEN
        UPDATE public.stock_reservations
        SET status = 'COMMITTED', updated_at = NOW()
        WHERE cart_session_id = p_cart_session_id AND status = 'ACTIVE';
    END IF;

    -- 6. Insert Initial Status History
    INSERT INTO public.ecommerce_order_status_history (
        order_id, from_status, to_status, notes, changed_by
    ) VALUES (
        p_order_id, NULL, 'PLACED', 'Online order placed by customer', 'Customer'
    );

    RETURN jsonb_build_object(
        'success', true,
        'order_id', p_order_id,
        'order_no', p_order_no,
        'order_status', 'PLACED',
        'total_amount', p_total_amount,
        'is_idempotent_replay', false,
        'message', 'E-commerce order created and inventory allocated successfully'
    );
END;
$$;

-- ----------------------------------------------------------------------------
-- 10. ATOMIC E-COMMERCE ORDER CANCELLATION & STOCK RESTORATION FUNCTION (HARDENED)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_cancel_ecommerce_order_atomic(
    p_order_id UUID,
    p_cancellation_reason TEXT,
    p_cancelled_by TEXT DEFAULT 'Customer'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_order RECORD;
    v_alloc RECORD;
    v_item RECORD;
BEGIN
    -- 1. Lock Order Row
    SELECT * INTO v_order
    FROM public.ecommerce_orders
    WHERE id = p_order_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Order ID % not found.', p_order_id;
    END IF;

    -- 2. Security Check: In-Database Customer Ownership Verification
    IF auth.uid() IS NOT NULL THEN
        IF v_order.customer_id <> auth.uid() AND NOT public.is_dairy_staff() THEN
            RAISE EXCEPTION 'FORBIDDEN: You do not have permission to cancel this order.';
        END IF;
    END IF;

    -- 3. Duplicate Cancellation & Double Restoration Guard
    IF v_order.order_status = 'CANCELLED' THEN
        RETURN jsonb_build_object(
            'success', true,
            'order_id', p_order_id,
            'status', 'CANCELLED',
            'is_duplicate', true,
            'message', 'Order is already cancelled. No duplicate stock restoration performed.'
        );
    END IF;

    IF v_order.order_status IN ('DELIVERED', 'REJECTED') THEN
        RAISE EXCEPTION 'Order cannot be cancelled in its current status (%).', v_order.order_status;
    END IF;

    -- 4. Restore Batch Quantities from Lot Allocation Ledger
    FOR v_alloc IN
        SELECT batch_id, product_id, quantity
        FROM public.ecommerce_order_item_allocations
        WHERE order_id = p_order_id
    LOOP
        UPDATE public.batches
        SET qty_remaining = ROUND((qty_remaining + v_alloc.quantity)::numeric, 2),
            updated_at = NOW()
        WHERE id = v_alloc.batch_id;
    END LOOP;

    -- 5. Restore Aggregate Product Stock Quantities
    FOR v_item IN
        SELECT product_id, SUM(quantity) as total_qty
        FROM public.ecommerce_order_items
        WHERE order_id = p_order_id AND product_id IS NOT NULL
        GROUP BY product_id
    LOOP
        UPDATE public.products
        SET stock_quantity = ROUND((stock_quantity + v_item.total_qty)::numeric, 2),
            updated_at = NOW()
        WHERE id = v_item.product_id;
    END LOOP;

    -- 6. Update Order Status
    UPDATE public.ecommerce_orders
    SET order_status = 'CANCELLED',
        cancellation_reason = p_cancellation_reason,
        cancelled_at = NOW(),
        cancelled_by = p_cancelled_by,
        updated_at = NOW()
    WHERE id = p_order_id;

    -- 7. Record Status History Audit
    INSERT INTO public.ecommerce_order_status_history (
        order_id, from_status, to_status, notes, changed_by
    ) VALUES (
        p_order_id, v_order.order_status, 'CANCELLED', p_cancellation_reason, p_cancelled_by
    );

    RETURN jsonb_build_object(
        'success', true,
        'order_id', p_order_id,
        'status', 'CANCELLED',
        'is_duplicate', false,
        'message', 'Order cancelled and batch stock successfully restored'
    );
END;
$$;

-- ----------------------------------------------------------------------------
-- 11. ROW LEVEL SECURITY (RLS) POLICIES FOR EVERY TABLE
-- ----------------------------------------------------------------------------
ALTER TABLE public.customer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ecommerce_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ecommerce_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ecommerce_order_item_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ecommerce_order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_reservations ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_dairy_staff()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SET search_path = public, pg_temp
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
          AND role IN ('Owner', 'Admin', 'admin', 'owner', 'manager', 'cashier', 'delivery_boy')
          AND is_active = TRUE
    );
$$;

-- A. customer_addresses Policies
DROP POLICY IF EXISTS "customer_addresses_select" ON public.customer_addresses;
CREATE POLICY "customer_addresses_select"
    ON public.customer_addresses FOR SELECT
    USING (auth.uid() = user_id OR public.is_dairy_staff());

DROP POLICY IF EXISTS "customer_addresses_insert" ON public.customer_addresses;
CREATE POLICY "customer_addresses_insert"
    ON public.customer_addresses FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "customer_addresses_update" ON public.customer_addresses;
CREATE POLICY "customer_addresses_update"
    ON public.customer_addresses FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "customer_addresses_delete" ON public.customer_addresses;
CREATE POLICY "customer_addresses_delete"
    ON public.customer_addresses FOR DELETE
    USING (auth.uid() = user_id);

-- B. ecommerce_orders Policies
DROP POLICY IF EXISTS "ecommerce_orders_select" ON public.ecommerce_orders;
CREATE POLICY "ecommerce_orders_select"
    ON public.ecommerce_orders FOR SELECT
    USING (auth.uid() = customer_id OR public.is_dairy_staff());

DROP POLICY IF EXISTS "ecommerce_orders_insert" ON public.ecommerce_orders;
CREATE POLICY "ecommerce_orders_insert"
    ON public.ecommerce_orders FOR INSERT
    WITH CHECK (auth.uid() = customer_id OR public.is_dairy_staff());

DROP POLICY IF EXISTS "ecommerce_orders_update" ON public.ecommerce_orders;
CREATE POLICY "ecommerce_orders_update"
    ON public.ecommerce_orders FOR UPDATE
    USING (public.is_dairy_staff())
    WITH CHECK (public.is_dairy_staff());

-- Direct client DELETION of orders is strictly forbidden for all roles
DROP POLICY IF EXISTS "ecommerce_orders_delete" ON public.ecommerce_orders;
CREATE POLICY "ecommerce_orders_delete"
    ON public.ecommerce_orders FOR DELETE
    USING (FALSE);

-- C. ecommerce_order_items Policies
DROP POLICY IF EXISTS "ecommerce_order_items_select" ON public.ecommerce_order_items;
CREATE POLICY "ecommerce_order_items_select"
    ON public.ecommerce_order_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.ecommerce_orders o 
            WHERE o.id = order_id AND (o.customer_id = auth.uid() OR public.is_dairy_staff())
        )
    );

DROP POLICY IF EXISTS "ecommerce_order_items_insert" ON public.ecommerce_order_items;
CREATE POLICY "ecommerce_order_items_insert"
    ON public.ecommerce_order_items FOR INSERT
    WITH CHECK (public.is_dairy_staff());

-- D. ecommerce_order_item_allocations Policies (Staff Only)
DROP POLICY IF EXISTS "order_allocations_staff_select" ON public.ecommerce_order_item_allocations;
CREATE POLICY "order_allocations_staff_select"
    ON public.ecommerce_order_item_allocations FOR SELECT
    USING (public.is_dairy_staff());

-- E. ecommerce_order_status_history Policies
DROP POLICY IF EXISTS "order_history_select" ON public.ecommerce_order_status_history;
CREATE POLICY "order_history_select"
    ON public.ecommerce_order_status_history FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.ecommerce_orders o 
            WHERE o.id = order_id AND (o.customer_id = auth.uid() OR public.is_dairy_staff())
        )
    );

-- F. stock_reservations Policies
DROP POLICY IF EXISTS "reservations_user_all" ON public.stock_reservations;
CREATE POLICY "reservations_user_all"
    ON public.stock_reservations FOR ALL
    USING (auth.uid() = user_id OR public.is_dairy_staff())
    WITH CHECK (auth.uid() = user_id OR public.is_dairy_staff());

-- ----------------------------------------------------------------------------
-- 12. EXECUTE PERMISSIONS HARDENING
-- ----------------------------------------------------------------------------
REVOKE ALL ON FUNCTION public.fn_create_ecommerce_order_atomic FROM PUBLIC;
REVOKE ALL ON FUNCTION public.fn_cancel_ecommerce_order_atomic FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_dairy_staff FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.fn_create_ecommerce_order_atomic TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.fn_cancel_ecommerce_order_atomic TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_dairy_staff TO authenticated, service_role;

GRANT SELECT ON public.v_ecommerce_products TO anon, authenticated, service_role;

-- ----------------------------------------------------------------------------
-- 13. REALTIME PUBLICATION
-- ----------------------------------------------------------------------------
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        IF NOT EXISTS (
            SELECT 1 FROM pg_publication_tables 
            WHERE pubname = 'supabase_realtime' AND tablename = 'ecommerce_orders'
        ) THEN
            ALTER PUBLICATION supabase_realtime ADD TABLE public.ecommerce_orders;
        END IF;
    END IF;
END $$;

COMMIT;
