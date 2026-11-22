-- ============================================================================
-- Migration: 82_brands_table_schema.sql
-- Description: Create brands table with logo support, real-time sync, and RLS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

-- 1. Public can read active brands
DROP POLICY IF EXISTS "Allow public read access to brands" ON public.brands;
CREATE POLICY "Allow public read access to brands"
  ON public.brands
  FOR SELECT
  USING (true);

-- 2. Authenticated staff can insert, update, delete brands
DROP POLICY IF EXISTS "Allow staff to manage brands" ON public.brands;
CREATE POLICY "Allow staff to manage brands"
  ON public.brands
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 3. Also allow anon update if using anon key in staff client with security role
DROP POLICY IF EXISTS "Allow anon update for demo staff" ON public.brands;
CREATE POLICY "Allow anon update for demo staff"
  ON public.brands
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- Enable Supabase Realtime publication
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

-- Seed top dairy & grocery brands (Yogeshwari uses local logo /YDO_logo.png)
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
