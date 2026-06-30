-- Video Analytics Tables
-- Enables tracking and attribution for shoppable videos

-- ============================================
-- VIDEO_EVENTS TABLE - Track video cart and checkout actions
-- Mirrors cart_events but for videos instead of shows
-- ============================================
CREATE TABLE video_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  viewer_id TEXT NOT NULL,
  event_type TEXT NOT NULL, -- add_to_cart, checkout_start, order_completed
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  quantity INTEGER DEFAULT 1,
  unit_price DECIMAL(10, 2),
  currency TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_video_events_video ON video_events(video_id);
CREATE INDEX idx_video_events_video_type ON video_events(video_id, event_type);
CREATE INDEX idx_video_events_product ON video_events(product_id);
CREATE INDEX idx_video_events_created ON video_events(created_at DESC);
CREATE INDEX idx_video_events_viewer ON video_events(video_id, viewer_id);

-- ============================================
-- MODIFY CART_SESSIONS - Add video_id for video attribution
-- ============================================
ALTER TABLE cart_sessions ADD COLUMN IF NOT EXISTS video_id UUID REFERENCES videos(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_cart_sessions_video ON cart_sessions(video_id);

-- Update constraint: either show_id or video_id must be present
-- (We can't easily add a CHECK constraint without dropping NOT NULL on show_id,
-- so we'll handle this in application logic for now)

-- Make show_id nullable to support video-only cart sessions
ALTER TABLE cart_sessions ALTER COLUMN show_id DROP NOT NULL;

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

ALTER TABLE video_events ENABLE ROW LEVEL SECURITY;

-- VIDEO_EVENTS: Anyone can insert (viewers), authenticated can read
CREATE POLICY "Anyone can insert video events"
  ON video_events FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Authenticated can read video events"
  ON video_events FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Service role full access to video events"
  ON video_events FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- REALTIME PUBLICATIONS
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE video_events;
