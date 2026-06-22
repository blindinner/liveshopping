-- Fix missing analytics tables (safe to run multiple times)

-- Create engagement_events if it doesn't exist
CREATE TABLE IF NOT EXISTS engagement_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  show_id UUID NOT NULL REFERENCES shows(id) ON DELETE CASCADE,
  viewer_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_engagement_events_show ON engagement_events(show_id);
CREATE INDEX IF NOT EXISTS idx_engagement_events_show_type ON engagement_events(show_id, event_type);
CREATE INDEX IF NOT EXISTS idx_engagement_events_created ON engagement_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_engagement_events_viewer ON engagement_events(show_id, viewer_id);

-- Create cart_events if it doesn't exist
CREATE TABLE IF NOT EXISTS cart_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  show_id UUID NOT NULL REFERENCES shows(id) ON DELETE CASCADE,
  viewer_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  cart_session_id UUID REFERENCES cart_sessions(id) ON DELETE SET NULL,
  quantity INTEGER DEFAULT 1,
  unit_price DECIMAL(10, 2),
  currency TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cart_events_show ON cart_events(show_id);
CREATE INDEX IF NOT EXISTS idx_cart_events_show_type ON cart_events(show_id, event_type);
CREATE INDEX IF NOT EXISTS idx_cart_events_product ON cart_events(product_id);
CREATE INDEX IF NOT EXISTS idx_cart_events_cart_session ON cart_events(cart_session_id);
CREATE INDEX IF NOT EXISTS idx_cart_events_created ON cart_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cart_events_viewer ON cart_events(show_id, viewer_id);

-- Enable RLS (safe to run multiple times)
ALTER TABLE engagement_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_sessions ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies (to avoid "already exists" errors)
DROP POLICY IF EXISTS "Anyone can insert engagement events" ON engagement_events;
DROP POLICY IF EXISTS "Authenticated can read engagement events" ON engagement_events;
DROP POLICY IF EXISTS "Service role full access to engagement events" ON engagement_events;

CREATE POLICY "Anyone can insert engagement events"
  ON engagement_events FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Authenticated can read engagement events"
  ON engagement_events FOR SELECT
  USING (TRUE);

CREATE POLICY "Service role full access to engagement events"
  ON engagement_events FOR ALL
  USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Anyone can insert cart events" ON cart_events;
DROP POLICY IF EXISTS "Authenticated can read cart events" ON cart_events;
DROP POLICY IF EXISTS "Service role full access to cart events" ON cart_events;

CREATE POLICY "Anyone can insert cart events"
  ON cart_events FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Authenticated can read cart events"
  ON cart_events FOR SELECT
  USING (TRUE);

CREATE POLICY "Service role full access to cart events"
  ON cart_events FOR ALL
  USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role full access to cart sessions" ON cart_sessions;
DROP POLICY IF EXISTS "Authenticated can read cart sessions" ON cart_sessions;
DROP POLICY IF EXISTS "Anyone can insert cart sessions" ON cart_sessions;

CREATE POLICY "Anyone can insert cart sessions"
  ON cart_sessions FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Authenticated can read cart sessions"
  ON cart_sessions FOR SELECT
  USING (TRUE);

CREATE POLICY "Service role full access to cart sessions"
  ON cart_sessions FOR ALL
  USING (auth.role() = 'service_role');

-- Enable realtime (ignore errors if already enabled)
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE engagement_events;
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE cart_events;
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE cart_sessions;
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;
