-- ============================================================================
-- Migration: 82_brands_table_schema.sql
-- Description: Create or update brands table with official logos for all inventory brands
-- ============================================================================

-- 1. Ensure public.brands table exists
CREATE TABLE IF NOT EXISTS public.brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL
);

-- 2. Safely add missing columns if table already existed in your database
ALTER TABLE public.brands ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE public.brands ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 0;
ALTER TABLE public.brands ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE public.brands ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.brands ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 3. Ensure UNIQUE constraint on 'name' column so ON CONFLICT works
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

-- Public can read active brands
DROP POLICY IF EXISTS "Allow public read access to brands" ON public.brands;
CREATE POLICY "Allow public read access to brands"
  ON public.brands
  FOR SELECT
  USING (true);

-- Authenticated staff can insert, update, delete brands
DROP POLICY IF EXISTS "Allow staff to manage brands" ON public.brands;
CREATE POLICY "Allow staff to manage brands"
  ON public.brands
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Also allow anon write for staff management in development/POS
DROP POLICY IF EXISTS "Allow anon update for demo staff" ON public.brands;
CREATE POLICY "Allow anon update for demo staff"
  ON public.brands
  FOR ALL
  TO anon
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

-- 6. Seed official logos for ALL shop inventory brands
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
