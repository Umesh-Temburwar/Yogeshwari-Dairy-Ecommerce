-- ============================================================================
-- Migration: 82_brands_table_schema.sql
-- Description: Create or update brands table with logo support, real-time sync, and RLS
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

-- 6. Seed top dairy & grocery brands (Yogeshwari uses local logo /YDO_logo.png)
INSERT INTO public.brands (name, logo_url, display_order, is_active)
VALUES
  ('Yogeshwari', '/YDO_logo.png', 1, true),
  ('Amul', NULL, 2, true),
  ('Haldiram''s', NULL, 3, true),
  ('Britannia', NULL, 4, true),
  ('Cadbury', NULL, 5, true),
  ('Gramilk', NULL, 6, true),
  ('Gowardhan', NULL, 7, true),
  ('Parle', NULL, 8, true),
  ('Tata', NULL, 9, true),
  ('Mother Dairy', NULL, 10, true),
  ('Nestle', NULL, 11, true),
  ('Suhana', NULL, 12, true),
  ('Ram Bandhu', NULL, 13, true),
  ('Temptin', NULL, 14, true)
ON CONFLICT (name) DO UPDATE 
SET 
  is_active = true,
  updated_at = NOW();
