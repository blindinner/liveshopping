-- Shoppable Videos Feature
-- Allows merchants to upload videos with a featured product for embedding on their websites

-- ============================================
-- VIDEOS TABLE
-- ============================================
CREATE TYPE video_status AS ENUM ('processing', 'ready', 'error');

CREATE TABLE videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  cloudflare_stream_id TEXT,
  cloudflare_playback_id TEXT,
  thumbnail_url TEXT,
  duration_seconds INTEGER,
  status video_status DEFAULT 'processing',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_videos_brand ON videos(brand_id);
CREATE INDEX idx_videos_status ON videos(status);
CREATE INDEX idx_videos_created ON videos(created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- Public can read ready videos (for embedding)
CREATE POLICY "Public read for ready videos"
  ON videos FOR SELECT
  USING (status = 'ready');

-- Authenticated users can manage all videos
CREATE POLICY "Authenticated users can manage videos"
  ON videos FOR ALL
  USING (auth.role() = 'authenticated');

-- Service role has full access
CREATE POLICY "Service role full access to videos"
  ON videos FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
CREATE TRIGGER videos_updated_at
  BEFORE UPDATE ON videos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- REALTIME PUBLICATION
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE videos;
