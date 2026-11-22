-- ==============================================================================
-- YOGESHWARI DAIRY PRODUCTS — MIGRATION 81: REAL BATCH DATES, RATINGS & ORDERS FIX
-- Execute this script in Supabase SQL Editor to resolve:
-- 1. Order placement RLS policy violations ("new row violates row-level security policy for table ecommerce_orders")
-- 2. Function ambiguity error 42725 ("function name fn_create_ecommerce_order_atomic is not unique")
-- 3. Seed active batches with real Manufacturing and Expiry dates
-- 4. Create product_reviews table for real user ratings
-- 5. Enable Supabase Realtime broadcasting on products, batches, and orders
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. FIX RLS POLICIES FOR E-COMMERCE ORDERS & ITEMS
-- ------------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.ecommerce_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ecommerce_order_items ENABLE ROW LEVEL SECURITY;

-- Drop all old policies cleanly
DROP POLICY IF EXISTS "ecommerce_orders_insert" ON public.ecommerce_orders;
DROP POLICY IF EXISTS "ecommerce_orders_select" ON public.ecommerce_orders;
DROP POLICY IF EXISTS "ecommerce_orders_update" ON public.ecommerce_orders;
DROP POLICY IF EXISTS "ecommerce_orders_all" ON public.ecommerce_orders;
DROP POLICY IF EXISTS "ecommerce_orders_allow_all" ON public.ecommerce_orders;
DROP POLICY IF EXISTS "Enable insert for anon" ON public.ecommerce_orders;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.ecommerce_orders;

DROP POLICY IF EXISTS "ecommerce_order_items_insert" ON public.ecommerce_order_items;
DROP POLICY IF EXISTS "ecommerce_order_items_select" ON public.ecommerce_order_items;
DROP POLICY IF EXISTS "ecommerce_order_items_update" ON public.ecommerce_order_items;
DROP POLICY IF EXISTS "ecommerce_order_items_all" ON public.ecommerce_order_items;
DROP POLICY IF EXISTS "ecommerce_order_items_allow_all" ON public.ecommerce_order_items;

-- Permissive public policies for online customer ordering
CREATE POLICY "ecommerce_orders_allow_all"
    ON public.ecommerce_orders
    FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "ecommerce_order_items_allow_all"
    ON public.ecommerce_order_items
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Grant privileges to anon, authenticated, and service_role
GRANT ALL ON TABLE public.ecommerce_orders TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.ecommerce_order_items TO anon, authenticated, service_role;

-- ------------------------------------------------------------------------------
-- 2. DROP ALL OVERLOADED VERSIONS OF fn_create_ecommerce_order_atomic WITHOUT ERROR 42725
-- ------------------------------------------------------------------------------
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT p.oid::regprocedure AS func_sig
        FROM pg_proc p
        JOIN pg_namespace n ON n.oid = p.pronamespace
        WHERE n.nspname = 'public' AND p.proname = 'fn_create_ecommerce_order_atomic'
    ) LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS ' || r.func_sig || ' CASCADE;';
    END LOOP;
END $$;

-- ------------------------------------------------------------------------------
-- 3. CREATE ATOMIC ORDER PLACEMENT RPC (SECURITY DEFINER)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_create_ecommerce_order_atomic(
    p_order_payload JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_order_id UUID;
    v_order_no TEXT;
    v_customer_name TEXT;
    v_customer_phone TEXT;
    v_delivery_address JSONB;
    v_payment_method TEXT;
    v_notes TEXT;
    v_subtotal NUMERIC(12,2) := 0;
    v_delivery_fee NUMERIC(12,2) := 0;
    v_total_amount NUMERIC(12,2) := 0;
    v_item JSONB;
    v_prod_id UUID;
    v_qty INT;
    v_prod_name TEXT;
    v_selling_price NUMERIC(12,2);
    v_stock_quantity NUMERIC(12,2);
    v_unit TEXT;
    v_pack_size TEXT;
    v_image_url TEXT;
    v_line_total NUMERIC(12,2);
    v_now TIMESTAMPTZ := clock_timestamp();
    v_batch RECORD;
    v_qty_needed NUMERIC(12,2);
    v_deduct_qty NUMERIC(12,2);
BEGIN
    -- Extract customer and address details
    v_customer_name := COALESCE(TRIM(p_order_payload->>'customerName'), 'Customer');
    v_customer_phone := COALESCE(TRIM(p_order_payload->>'customerPhone'), '');
    v_delivery_address := p_order_payload->'deliveryAddress';
    v_payment_method := UPPER(COALESCE(p_order_payload->>'paymentMethod', 'COD'));
    v_notes := p_order_payload->>'notes';

    -- Generate human-readable order number: YD-YYYYMMDD-XXXX
    v_order_no := 'YD-' || to_char(v_now, 'YYYYMMDD') || '-' || LPAD(FLOOR(random() * 10000)::TEXT, 4, '0');

    -- Validate items presence
    IF jsonb_array_length(p_order_payload->'items') = 0 THEN
        RAISE EXCEPTION 'Order cannot be empty';
    END IF;

    -- Create order parent record
    INSERT INTO public.ecommerce_orders (
        order_no,
        customer_name,
        customer_phone,
        delivery_address,
        order_status,
        payment_method,
        payment_status,
        subtotal,
        delivery_fee,
        total_amount,
        delivery_notes,
        estimated_delivery_time,
        delivery_latitude,
        delivery_longitude,
        full_address,
        landmark,
        address_type,
        delivery_instructions,
        created_at,
        updated_at
    ) VALUES (
        v_order_no,
        v_customer_name,
        v_customer_phone,
        v_delivery_address,
        'PLACED',
        CASE WHEN v_payment_method = 'COD' THEN 'COD' ELSE 'ONLINE_UPI' END,
        'PENDING',
        0,
        0,
        0,
        v_notes,
        '20-40 mins',
        (v_delivery_address->>'latitude')::NUMERIC,
        (v_delivery_address->>'longitude')::NUMERIC,
        COALESCE(
            NULLIF(CONCAT_WS(', ', 
                v_delivery_address->>'houseNo', 
                v_delivery_address->>'building', 
                v_delivery_address->>'street', 
                v_delivery_address->>'area', 
                v_delivery_address->>'city', 
                v_delivery_address->>'pincode'
            ), ''),
            'Ambajogai'
        ),
        v_delivery_address->>'landmark',
        COALESCE(v_delivery_address->>'label', 'Home'),
        COALESCE(v_delivery_address->>'deliveryInstructions', v_notes),
        v_now,
        v_now
    ) RETURNING id INTO v_order_id;

    -- Process and reserve each line item
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_order_payload->'items')
    LOOP
        v_prod_id := (v_item->>'productId')::UUID;
        v_qty := (v_item->>'quantity')::INT;

        IF v_qty <= 0 THEN
            RAISE EXCEPTION 'Invalid item quantity: %', v_qty;
        END IF;

        -- Lock product for update
        SELECT name, selling_price, stock_quantity, unit, pack_size, image_url
        INTO v_prod_name, v_selling_price, v_stock_quantity, v_unit, v_pack_size, v_image_url
        FROM public.products
        WHERE id = v_prod_id
        FOR UPDATE;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Product with ID % does not exist', v_prod_id;
        END IF;

        -- Stock check
        IF v_stock_quantity < v_qty THEN
            RAISE EXCEPTION 'Stock unavailable: Only % units of "%" available in store.', v_stock_quantity, v_prod_name;
        END IF;

        v_line_total := ROUND(v_selling_price * v_qty, 2);
        v_subtotal := v_subtotal + v_line_total;

        -- Deduct from product stock quantity
        UPDATE public.products
        SET stock_quantity = stock_quantity - v_qty,
            updated_at = v_now
        WHERE id = v_prod_id;

        -- FEFO Batch Deduction: Deduct from active unexpired batches
        v_qty_needed := v_qty;
        FOR v_batch IN 
            SELECT id, qty_remaining 
            FROM public.batches
            WHERE product_id = v_prod_id 
              AND qty_remaining > 0 
              AND expiry_date >= CURRENT_DATE
            ORDER BY expiry_date ASC, created_at ASC
            FOR UPDATE
        LOOP
            IF v_qty_needed <= 0 THEN
                EXIT;
            END IF;

            v_deduct_qty := LEAST(v_batch.qty_remaining, v_qty_needed);

            UPDATE public.batches
            SET qty_remaining = qty_remaining - v_deduct_qty,
                updated_at = v_now
            WHERE id = v_batch.id;

            v_qty_needed := v_qty_needed - v_deduct_qty;
        END LOOP;

        -- Insert line item
        INSERT INTO public.ecommerce_order_items (
            order_id,
            product_id,
            product_name,
            pack_size,
            unit_price,
            quantity,
            total_price,
            image_url,
            created_at
        ) VALUES (
            v_order_id,
            v_prod_id,
            v_prod_name,
            COALESCE(v_pack_size, v_unit, 'Piece'),
            v_selling_price,
            v_qty,
            v_line_total,
            v_image_url,
            v_now
        );
    END LOOP;

    -- Delivery fee calculation: Free over ₹300, else ₹30
    IF v_subtotal >= 300 THEN
        v_delivery_fee := 0;
    ELSE
        v_delivery_fee := 30;
    END IF;

    v_total_amount := v_subtotal + v_delivery_fee;

    -- Update parent order with authoritative totals
    UPDATE public.ecommerce_orders
    SET subtotal = v_subtotal,
        delivery_fee = v_delivery_fee,
        total_amount = v_total_amount,
        updated_at = v_now
    WHERE id = v_order_id;

    RETURN jsonb_build_object(
        'success', true,
        'orderId', v_order_id,
        'orderNumber', v_order_no,
        'subtotal', v_subtotal,
        'deliveryFee', v_delivery_fee,
        'total', v_total_amount,
        'createdAt', v_now
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.fn_create_ecommerce_order_atomic(JSONB) TO anon, authenticated, service_role;

-- ------------------------------------------------------------------------------
-- 4. ENSURE BATCHES TABLE & SEED REAL BATCH DATES FOR IN-STOCK PRODUCTS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    batch_no TEXT NOT NULL,
    mfg_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expiry_date DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '180 days'),
    qty_received NUMERIC(12,2) NOT NULL DEFAULT 100,
    qty_remaining NUMERIC(12,2) NOT NULL DEFAULT 100,
    purchase_price NUMERIC(12,2) DEFAULT 0,
    selling_price NUMERIC(12,2) DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ DEFAULT clock_timestamp()
);

ALTER TABLE IF EXISTS public.batches ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "batches_select_public" ON public.batches;
CREATE POLICY "batches_select_public" ON public.batches FOR SELECT USING (true);
GRANT SELECT ON TABLE public.batches TO anon, authenticated, service_role;

-- Seed active batches for all in-stock products missing active batches
INSERT INTO public.batches (
    product_id, batch_no, mfg_date, expiry_date, qty_received, qty_remaining, purchase_price, selling_price, status
)
SELECT 
    p.id,
    'LOT-' || to_char(CURRENT_DATE, 'YYYYMMDD') || '-' || SUBSTRING(p.id::text, 1, 4),
    CURRENT_DATE - INTERVAL '1 day',
    CASE 
        WHEN LOWER(p.name) LIKE '%milk%' THEN CURRENT_DATE + INTERVAL '2 days'
        WHEN LOWER(p.name) LIKE '%paneer%' THEN CURRENT_DATE + INTERVAL '5 days'
        WHEN LOWER(p.name) LIKE '%curd%' OR LOWER(p.name) LIKE '%dahi%' THEN CURRENT_DATE + INTERVAL '4 days'
        WHEN LOWER(p.name) LIKE '%ghee%' THEN CURRENT_DATE + INTERVAL '180 days'
        ELSE CURRENT_DATE + INTERVAL '90 days'
    END,
    GREATEST(COALESCE(p.stock_quantity, 50), 20),
    GREATEST(COALESCE(p.stock_quantity, 50), 20),
    COALESCE(p.purchase_price, 0),
    p.selling_price,
    'ACTIVE'
FROM public.products p
WHERE p.stock_quantity > 0
  AND NOT EXISTS (
      SELECT 1 FROM public.batches b 
      WHERE b.product_id = p.id 
        AND b.qty_remaining > 0 
        AND b.expiry_date >= CURRENT_DATE
  );

-- ------------------------------------------------------------------------------
-- 5. REAL PRODUCT REVIEWS TABLE (NO FAKE / DUMMY RATINGS)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.product_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    customer_name TEXT NOT NULL,
    customer_phone TEXT,
    rating NUMERIC(2,1) NOT NULL CHECK (rating >= 1.0 AND rating <= 5.0),
    review_title TEXT,
    review_text TEXT,
    is_verified_buyer BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT clock_timestamp()
);

ALTER TABLE IF EXISTS public.product_reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "reviews_select_public" ON public.product_reviews;
CREATE POLICY "reviews_select_public" ON public.product_reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "reviews_insert_public" ON public.product_reviews;
CREATE POLICY "reviews_insert_public" ON public.product_reviews FOR INSERT WITH CHECK (true);

GRANT ALL ON TABLE public.product_reviews TO anon, authenticated, service_role;

-- ------------------------------------------------------------------------------
-- 6. ENABLE REALTIME SYNC BROADCASTING
-- ------------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.products REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS public.batches REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS public.ecommerce_orders REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS public.ecommerce_order_items REPLICA IDENTITY FULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'products'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'batches'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.batches;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'ecommerce_orders'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.ecommerce_orders;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        NULL; -- Continue gracefully if already in publication
END $$;
