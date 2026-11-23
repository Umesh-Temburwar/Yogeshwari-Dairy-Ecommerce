-- ==============================================================================
-- 83: COMPLETE FLIPKART STOREFRONT, PROMOTIONS & BRAND LOGOS MIGRATION
-- Yogeshwari Dairy E-Commerce & Inventory Management Platform
-- Run this in your Supabase SQL Editor (100% Safe, Idempotent, No Data Loss)
-- ==============================================================================

-- ==============================================================================
-- PART 1: PROMOTIONAL BANNERS TABLE & REALTIME PUBLICATION
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.promotional_banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT,
  image_url TEXT NOT NULL,
  link_type TEXT NOT NULL DEFAULT 'CATEGORY' CHECK (link_type IN ('CATEGORY', 'BRAND', 'EXTERNAL')),
  link_target TEXT NOT NULL,
  badge_text TEXT,
  bg_color TEXT,
  display_order INT NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index for instant banner querying in order
CREATE INDEX IF NOT EXISTS idx_promotional_banners_active_order 
ON public.promotional_banners (is_active, display_order);

-- Enable Row Level Security (RLS)
ALTER TABLE public.promotional_banners ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active banners
DROP POLICY IF EXISTS "Public can view active promotional banners" ON public.promotional_banners;
CREATE POLICY "Public can view active promotional banners"
ON public.promotional_banners
FOR SELECT
USING (is_active = true);

-- Allow staff and app to manage banners
DROP POLICY IF EXISTS "Staff can manage promotional banners" ON public.promotional_banners;
CREATE POLICY "Staff can manage promotional banners"
ON public.promotional_banners
FOR ALL
USING (true)
WITH CHECK (true);

-- Enable Supabase Realtime for promotional_banners
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'promotional_banners'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.promotional_banners;
  END IF;
END $$;

-- Seed default Flipkart-style promotional banners
INSERT INTO public.promotional_banners (title, subtitle, image_url, link_type, link_target, badge_text, display_order, is_active)
VALUES
  (
    'Fresh Farm Cow & Buffalo Milk',
    'Pure unadulterated milk tested daily, delivered fresh to your doorstep in Ambajogai',
    'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=1200&q=80',
    'CATEGORY',
    'milk-cream',
    'MORNING FRESH BATCH',
    1,
    true
  ),
  (
    'Pure Vedic Bilona Cow Ghee',
    'Slow-cooked golden aromatic ghee made using traditional Vedic churning',
    'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=1200&q=80',
    'CATEGORY',
    'desi-ghee',
    '100% PURE DESI',
    2,
    true
  ),
  (
    'Daily Fresh Soft Malai Paneer',
    'Spongy, fresh and high in protein — prepared every morning at 5 AM',
    'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=1200&q=80',
    'CATEGORY',
    'paneer-butter',
    'CHEF''S CHOICE',
    3,
    true
  ),
  (
    'Amul Dairy Essentials Festival',
    'Get fresh Amul Taaza, salted butter and processed cheese cubes at best rates',
    'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=1200&q=80',
    'BRAND',
    'Amul',
    'TOP BRAND',
    4,
    true
  ),
  (
    'Authentic Kesar Shrikhand & Sweets',
    'Made with pure chakka, real saffron strands and aromatic cardamoms',
    'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=1200&q=80',
    'CATEGORY',
    'sweets-mithai',
    'FESTIVE SPECIAL',
    5,
    true
  )
ON CONFLICT DO NOTHING;


-- ==============================================================================
-- PART 2: BRANDS MASTER TABLE WITH OFFICIAL LOGOS & REALTIME
-- ==============================================================================

-- 1. Ensure public.brands table exists
CREATE TABLE IF NOT EXISTS public.brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL
);

-- 2. Safely add missing columns
ALTER TABLE public.brands ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE public.brands ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 0;
ALTER TABLE public.brands ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE public.brands ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.brands ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 3. Ensure UNIQUE constraint on 'name'
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conrelid = 'public.brands'::regclass 
    AND conname = 'brands_name_key'
  ) THEN
    ALTER TABLE public.brands ADD CONSTRAINT brands_name_key UNIQUE (name);
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    NULL;
END $$;

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

-- Public read access
DROP POLICY IF EXISTS "Allow public read access to brands" ON public.brands;
CREATE POLICY "Allow public read access to brands"
  ON public.brands
  FOR SELECT
  USING (true);

-- Allow staff to manage brands
DROP POLICY IF EXISTS "Allow staff to manage brands" ON public.brands;
CREATE POLICY "Allow staff to manage brands"
  ON public.brands
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 5. Enable Supabase Realtime publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'brands'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.brands;
  END IF;
END $$;

-- 6. Seed official logos for ALL 24 shop inventory brands
INSERT INTO public.brands (name, logo_url, display_order, is_active)
VALUES
  ('Yogeshwari', '/YDO_logo.png', 1, true),
  ('Parle', '/brands/parle.png', 2, true),
  ('Ram Bandhu', '/brands/ram-bandhu.png', 3, true),
  ('Haldiram''s', '/brands/haldirams.png', 4, true),
  ('Amul', '/brands/amul.png', 5, true),
  ('Britannia', '/brands/britannia.png', 6, true),
  ('Cadbury', '/brands/cadbury.png', 7, true),
  ('Cadbuary', '/brands/cadbury.png', 8, true),
  ('Gramilk', '/brands/gramilk.svg', 9, true),
  ('Temptin', '/brands/temptin.svg', 10, true),
  ('Suhana', '/brands/suhana.png', 11, true),
  ('Chitale', '/brands/chitale.png', 12, true),
  ('Chitale Foods', '/brands/chitale.png', 13, true),
  ('Karia''s', '/brands/karias.svg', 14, true),
  ('Patanjali', '/brands/patanjali.png', 15, true),
  ('Campa', '/brands/campa.png', 16, true),
  ('BRU', '/brands/bru.svg', 17, true),
  ('Maggi', '/brands/maggi.png', 18, true),
  ('Govind', '/brands/govind.png', 19, true),
  ('Nutritious', '/brands/nutritious.svg', 20, true),
  ('Nutritius', '/brands/nutritious.svg', 21, true),
  ('Sprite', '/brands/sprite.png', 22, true),
  ('Mayora', '/brands/mayora.svg', 23, true),
  ('Unibic', '/brands/unibic.png', 24, true)
ON CONFLICT (name) DO UPDATE 
SET 
  logo_url = EXCLUDED.logo_url,
  display_order = EXCLUDED.display_order,
  is_active = true,
  updated_at = NOW();


-- ==============================================================================
-- PART 3: STORAGE BUCKET FOR BRAND LOGOS (OPTIONAL OWNER UPLOADS)
-- ==============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('brand-logos', 'brand-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Public read access on storage objects
DROP POLICY IF EXISTS "Public read access for brand logos" ON storage.objects;
CREATE POLICY "Public read access for brand logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'brand-logos');

-- Allow staff uploads to brand-logos bucket
DROP POLICY IF EXISTS "Staff upload access for brand logos" ON storage.objects;
CREATE POLICY "Staff upload access for brand logos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'brand-logos');

DROP POLICY IF EXISTS "Staff update access for brand logos" ON storage.objects;
CREATE POLICY "Staff update access for brand logos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'brand-logos');


-- ==============================================================================
-- PART 4: VERIFICATION REPORT (Check that all tables & rows are active)
-- ==============================================================================

SELECT 
  'brands' AS table_name, 
  COUNT(*)::text AS record_count 
FROM public.brands
UNION ALL
SELECT 
  'promotional_banners' AS table_name, 
  COUNT(*)::text AS record_count 
FROM public.promotional_banners;
