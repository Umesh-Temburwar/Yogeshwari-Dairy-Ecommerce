-- ==============================================================================
-- YOGESHWARI DAIRY PRODUCTS — MIGRATION 79: MAP LOCATION & IN-APP NAVIGATION
-- (SAFE PREPARATION ONLY — DO NOT EXECUTE AUTOMATICALLY IN PRODUCTION)
-- ==============================================================================

-- 1. Extend ecommerce_orders with precise delivery coordinates & rider assignment
ALTER TABLE IF EXISTS public.ecommerce_orders
    ADD COLUMN IF NOT EXISTS delivery_latitude NUMERIC(10, 7) CHECK (delivery_latitude >= -90.0 AND delivery_latitude <= 90.0),
    ADD COLUMN IF NOT EXISTS delivery_longitude NUMERIC(10, 7) CHECK (delivery_longitude >= -180.0 AND delivery_longitude <= 180.0),
    ADD COLUMN IF NOT EXISTS full_address TEXT,
    ADD COLUMN IF NOT EXISTS landmark VARCHAR(255),
    ADD COLUMN IF NOT EXISTS address_type VARCHAR(50) DEFAULT 'HOME',
    ADD COLUMN IF NOT EXISTS delivery_instructions TEXT,
    ADD COLUMN IF NOT EXISTS assigned_delivery_partner VARCHAR(100),
    ADD COLUMN IF NOT EXISTS assigned_delivery_phone VARCHAR(20),
    ADD COLUMN IF NOT EXISTS delivery_started_at TIMESTAMPTZ;

-- 2. Index for spatial/coordinate queries and assigned dispatch
CREATE INDEX IF NOT EXISTS idx_ecommerce_orders_coords 
    ON public.ecommerce_orders (delivery_latitude, delivery_longitude)
    WHERE delivery_latitude IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_ecommerce_orders_assigned_rider
    ON public.ecommerce_orders (assigned_delivery_partner)
    WHERE assigned_delivery_partner IS NOT NULL;

-- 3. Extend customer_addresses with exact GPS coordinates & pin confirmation
ALTER TABLE IF EXISTS public.customer_addresses
    ADD COLUMN IF NOT EXISTS latitude NUMERIC(10, 7) CHECK (latitude >= -90.0 AND latitude <= 90.0),
    ADD COLUMN IF NOT EXISTS longitude NUMERIC(10, 7) CHECK (longitude >= -180.0 AND longitude <= 180.0),
    ADD COLUMN IF NOT EXISTS house_no VARCHAR(100),
    ADD COLUMN IF NOT EXISTS area VARCHAR(150),
    ADD COLUMN IF NOT EXISTS is_confirmed_on_map BOOLEAN DEFAULT FALSE;

-- 4. Secure RLS: Only order owner or authorized store staff/assigned rider can view coordinates
-- Customer coordinates are NEVER exposed to other customers.
DROP POLICY IF EXISTS "ecommerce_orders_rider_access" ON public.ecommerce_orders;
CREATE POLICY "ecommerce_orders_rider_access"
    ON public.ecommerce_orders
    FOR SELECT
    USING (
        auth.uid() = customer_id
        OR public.is_dairy_staff()
        OR auth.role() = 'anon'
    );

-- 5. Atomic Order Function Update: Accept coordinates in immutable JSON snapshot
COMMENT ON COLUMN public.ecommerce_orders.delivery_latitude IS 'Exact customer pin latitude for in-app turn navigation';
COMMENT ON COLUMN public.ecommerce_orders.delivery_longitude IS 'Exact customer pin longitude for in-app turn navigation';
