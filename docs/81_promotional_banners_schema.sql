-- ==============================================================================
-- 81: PROMOTIONAL BANNERS SCHEMA & REALTIME SYNC
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

-- Index for instant querying of active banners in order
CREATE INDEX IF NOT EXISTS idx_promotional_banners_active_order 
ON public.promotional_banners (is_active, display_order);

-- Enable Row Level Security (RLS)
ALTER TABLE public.promotional_banners ENABLE ROW LEVEL SECURITY;

-- Allow public read access to all active banners
DROP POLICY IF EXISTS "Public can view active promotional banners" ON public.promotional_banners;
CREATE POLICY "Public can view active promotional banners"
ON public.promotional_banners
FOR SELECT
USING (is_active = true);

-- Allow authenticated dairy staff/owner to insert/update/delete banners
DROP POLICY IF EXISTS "Staff can manage promotional banners" ON public.promotional_banners;
CREATE POLICY "Staff can manage promotional banners"
ON public.promotional_banners
FOR ALL
TO authenticated
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

-- Seed initial high-quality promotional banners
INSERT INTO public.promotional_banners (title, subtitle, image_url, link_type, link_target, badge_text, display_order, is_active)
VALUES
  (
    'Fresh Farm Cow & Buffalo Milk',
    'Pure unadulterated milk tested daily, delivered fresh to your doorstep in Ambajogai',
    'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=1200&q=80',
    'CATEGORY',
    'milk',
    'MORNING FRESH BATCH',
    1,
    true
  ),
  (
    'Pure Vedic Bilona Cow Ghee',
    'Slow-cooked golden aromatic ghee made using traditional Vedic churning',
    'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=1200&q=80',
    'CATEGORY',
    'ghee-butter',
    '100% PURE DESI',
    2,
    true
  ),
  (
    'Daily Fresh Soft Malai Paneer',
    'Spongy, fresh and high in protein — prepared every morning at 5 AM',
    'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=1200&q=80',
    'CATEGORY',
    'paneer-khoya',
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
    'sweets-shrikhand',
    'FESTIVE SPECIAL',
    5,
    true
  )
ON CONFLICT DO NOTHING;
