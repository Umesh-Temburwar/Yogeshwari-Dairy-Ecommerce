-- ==============================================================================
-- YOGESHWARI DAIRY PRODUCTS — MIGRATION 80: FIX ECOMMERCE ORDERS & BATCH STOCK
-- Execute this script once in Supabase SQL Editor.
-- ==============================================================================

-- 1. Enable RLS Insert Policies for Ecommerce Orders
ALTER TABLE IF EXISTS public.ecommerce_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ecommerce_order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ecommerce_orders_insert" ON public.ecommerce_orders;
CREATE POLICY "ecommerce_orders_insert"
    ON public.ecommerce_orders FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "ecommerce_order_items_insert" ON public.ecommerce_order_items;
CREATE POLICY "ecommerce_order_items_insert"
    ON public.ecommerce_order_items FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "ecommerce_orders_select" ON public.ecommerce_orders;
CREATE POLICY "ecommerce_orders_select"
    ON public.ecommerce_orders FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "ecommerce_order_items_select" ON public.ecommerce_order_items;
CREATE POLICY "ecommerce_order_items_select"
    ON public.ecommerce_order_items FOR SELECT
    USING (true);

-- 2. Seed active unexpired batches for Parle-G, biscuits & shop products
INSERT INTO public.batches (
    product_id, batch_no, mfg_date, expiry_date, qty_received, qty_remaining, purchase_price, selling_price, status
)
SELECT 
    p.id,
    'LOT-SHOP-' || SUBSTRING(p.id::text, 1, 8),
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '180 days',
    p.stock_quantity,
    p.stock_quantity,
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

-- 3. Drop all previous overloaded function versions cleanly
DROP FUNCTION IF EXISTS public.fn_create_ecommerce_order_atomic CASCADE;

-- 4. Recreate Atomic Order Function with Matching Signature and Resilient Shop Stock
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
    v_batch RECORD;
    v_batch_stock NUMERIC;
    v_total_stock NUMERIC;
    v_active_res NUMERIC;
    v_available_stock NUMERIC;
    v_order_item_id UUID;
    v_qty_needed NUMERIC;
    v_take_qty NUMERIC;
    v_auto_batch_id UUID;
    v_lat NUMERIC;
    v_lng NUMERIC;
    v_full_addr TEXT;
    v_landmark TEXT;
    v_addr_type TEXT;
    v_instructions TEXT;
BEGIN
    -- Idempotency Check: Prevent duplicate charge/order on re-transmission
    SELECT id, order_no, order_status, total_amount
    INTO v_existing_order
    FROM public.ecommerce_orders
    WHERE idempotency_key = p_idempotency_key
       OR id = p_order_id
       OR order_no = p_order_no;

    IF FOUND THEN
        RETURN jsonb_build_object(
            'success', true,
            'is_idempotent_replay', true,
            'order_id', v_existing_order.id,
            'order_no', v_existing_order.order_no,
            'order_status', v_existing_order.order_status,
            'total_amount', v_existing_order.total_amount,
            'message', 'Order already placed previously.'
        );
    END IF;

    -- Extract delivery map details from JSON
    BEGIN
        v_lat := (p_delivery_address->>'latitude')::numeric;
    EXCEPTION WHEN OTHERS THEN v_lat := NULL; END;

    BEGIN
        v_lng := (p_delivery_address->>'longitude')::numeric;
    EXCEPTION WHEN OTHERS THEN v_lng := NULL; END;

    v_landmark := COALESCE(p_delivery_address->>'landmark', '');
    v_addr_type := COALESCE(p_delivery_address->>'label', p_delivery_address->>'address_type', 'HOME');
    v_instructions := COALESCE(p_delivery_address->>'deliveryInstructions', p_delivery_address->>'delivery_instructions', '');
    v_full_addr := COALESCE(p_delivery_address->>'houseNo', '') || 
                   CASE WHEN p_delivery_address->>'building' IS NOT NULL THEN ', ' || (p_delivery_address->>'building') ELSE '' END ||
                   CASE WHEN p_delivery_address->>'street' IS NOT NULL THEN ', ' || (p_delivery_address->>'street') ELSE '' END ||
                   CASE WHEN p_delivery_address->>'area' IS NOT NULL THEN ', ' || (p_delivery_address->>'area') ELSE '' END ||
                   CASE WHEN p_delivery_address->>'city' IS NOT NULL THEN ', ' || (p_delivery_address->>'city') ELSE '' END ||
                   CASE WHEN p_delivery_address->>'pincode' IS NOT NULL THEN ' - ' || (p_delivery_address->>'pincode') ELSE '' END;

    -- Concurrency & Stock Validation
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
        SELECT id, name, stock_quantity, purchase_price, is_active, is_ecommerce_active
        INTO v_prod
        FROM public.products
        WHERE id = v_item.product_id
        FOR UPDATE;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Product % does not exist in store catalogue.', v_item.product_name;
        END IF;

        IF NOT v_prod.is_active THEN
            RAISE EXCEPTION 'Product % is currently not available for purchase.', v_prod.name;
        END IF;

        -- Batch stock
        SELECT COALESCE(SUM(qty_remaining), 0) INTO v_batch_stock
        FROM public.batches
        WHERE product_id = v_item.product_id
          AND qty_remaining > 0
          AND expiry_date >= CURRENT_DATE;

        -- Total physical stock in store: batch stock OR physical stock_quantity
        v_total_stock := GREATEST(v_batch_stock, COALESCE(v_prod.stock_quantity, 0));

        -- Check other active reservations
        SELECT COALESCE(SUM(quantity), 0) INTO v_active_res
        FROM public.stock_reservations
        WHERE product_id = v_item.product_id
          AND status = 'ACTIVE'
          AND expires_at > NOW()
          AND (p_cart_session_id IS NULL OR cart_session_id <> p_cart_session_id);

        v_available_stock := GREATEST(0, (v_total_stock - v_active_res));

        IF v_available_stock < v_item.quantity THEN
            RAISE EXCEPTION 'INSUFFICIENT_STOCK: Requested % units of %, but only % units are available.', 
                v_item.quantity, v_prod.name, v_available_stock;
        END IF;
    END LOOP;

    -- Insert Master E-Commerce Order (with Map & Navigation fields)
    INSERT INTO public.ecommerce_orders (
        id, order_no, customer_id, customer_name, customer_phone,
        customer_email, delivery_address, order_status, payment_method,
        payment_status, payment_reference, subtotal, delivery_fee,
        discount_amount, total_amount, idempotency_key,
        delivery_latitude, delivery_longitude, full_address, landmark,
        address_type, delivery_instructions, estimated_delivery_time,
        created_at, updated_at
    ) VALUES (
        p_order_id, p_order_no, p_customer_id, p_customer_name, p_customer_phone,
        p_customer_email, p_delivery_address, 'PLACED', p_payment_method,
        'PENDING', p_payment_reference, p_subtotal, p_delivery_fee,
        p_discount_amount, p_total_amount, p_idempotency_key,
        v_lat, v_lng, v_full_addr, v_landmark,
        v_addr_type, v_instructions, '20-40 mins',
        NOW(), NOW()
    );

    -- Insert Items and FEFO Allocation
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

        v_qty_needed := v_item.quantity;

        -- Deduct from existing unexpired batches first
        FOR v_batch IN
            SELECT id, batch_no, expiry_date, qty_remaining
            FROM public.batches
            WHERE product_id = v_item.product_id
              AND qty_remaining > 0
              AND expiry_date >= CURRENT_DATE
            ORDER BY expiry_date ASC, created_at ASC
            FOR UPDATE
        LOOP
            IF v_qty_needed <= 0 THEN EXIT; END IF;
            v_take_qty := LEAST(v_batch.qty_remaining, v_qty_needed);
            v_qty_needed := v_qty_needed - v_take_qty;

            UPDATE public.batches
            SET qty_remaining = ROUND((qty_remaining - v_take_qty)::numeric, 2),
                updated_at = NOW()
            WHERE id = v_batch.id;

            INSERT INTO public.ecommerce_order_item_allocations (
                order_item_id, order_id, product_id, batch_id, batch_no, expiry_date, quantity
            ) VALUES (
                v_order_item_id, p_order_id, v_item.product_id, v_batch.id, v_batch.batch_no,
                v_batch.expiry_date, v_take_qty
            );
        END LOOP;

        -- If still needed, allocate from general shop stock
        IF v_qty_needed > 0 THEN
            INSERT INTO public.batches (
                product_id, batch_no, mfg_date, expiry_date, qty_received, qty_remaining, purchase_price, selling_price, status
            ) VALUES (
                v_item.product_id, 'LOT-SHOP-' || TO_CHAR(NOW(), 'YYYYMMDD'), CURRENT_DATE, CURRENT_DATE + INTERVAL '180 days',
                v_qty_needed, 0, 0, v_item.unit_price, 'ACTIVE'
            ) RETURNING id INTO v_auto_batch_id;

            INSERT INTO public.ecommerce_order_item_allocations (
                order_item_id, order_id, product_id, batch_id, batch_no, expiry_date, quantity
            ) VALUES (
                v_order_item_id, p_order_id, v_item.product_id, v_auto_batch_id, 'LOT-SHOP-' || TO_CHAR(NOW(), 'YYYYMMDD'),
                CURRENT_DATE + INTERVAL '180 days', v_qty_needed
            );
            v_qty_needed := 0;
        END IF;

        UPDATE public.products
        SET stock_quantity = GREATEST(0, ROUND((stock_quantity - v_item.quantity)::numeric, 2)),
            updated_at = NOW()
        WHERE id = v_item.product_id;
    END LOOP;

    RETURN jsonb_build_object(
        'success', true,
        'order_id', p_order_id,
        'order_no', p_order_no,
        'order_status', 'PLACED',
        'total_amount', p_total_amount,
        'message', 'E-commerce order created and inventory allocated successfully'
    );
END;
$$;

-- Grant execution to anon, authenticated, and service_role
GRANT EXECUTE ON FUNCTION public.fn_create_ecommerce_order_atomic(
    UUID, TEXT, UUID, UUID, TEXT, TEXT, TEXT, JSONB, TEXT, TEXT, NUMERIC, NUMERIC, NUMERIC, NUMERIC, JSONB, TEXT
) TO anon, authenticated, service_role;
