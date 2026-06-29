-- Video Products Enhancement
-- Supports multiple products per video with timestamps

-- ============================================
-- UPDATE VIDEOS TABLE
-- ============================================
ALTER TABLE videos ADD COLUMN IF NOT EXISTS cover_image_url TEXT;
ALTER TABLE videos ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false;

-- ============================================
-- VIDEO_PRODUCTS JUNCTION TABLE
-- ============================================
CREATE TABLE video_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  start_time_seconds INTEGER DEFAULT 0,      -- When product appears (0 = start)
  end_time_seconds INTEGER,                   -- When product disappears (null = until end)
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(video_id, product_id)
);

CREATE INDEX idx_video_products_video ON video_products(video_id);
CREATE INDEX idx_video_products_product ON video_products(product_id);
CREATE INDEX idx_video_products_timing ON video_products(video_id, start_time_seconds, end_time_seconds);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE video_products ENABLE ROW LEVEL SECURITY;

-- Public can read video products (for embedding)
CREATE POLICY "Public read for video products"
  ON video_products FOR SELECT
  USING (TRUE);

-- Authenticated users can manage video products
CREATE POLICY "Authenticated users can manage video products"
  ON video_products FOR ALL
  USING (auth.role() = 'authenticated');

-- Service role has full access
CREATE POLICY "Service role full access to video products"
  ON video_products FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- REALTIME PUBLICATION
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE video_products;

-- ============================================
-- MIGRATE EXISTING DATA
-- ============================================
-- Move existing video.product_id to video_products table
INSERT INTO video_products (video_id, product_id, start_time_seconds, display_order)
SELECT id, product_id, 0, 0
FROM videos
WHERE product_id IS NOT NULL
ON CONFLICT (video_id, product_id) DO NOTHING;
