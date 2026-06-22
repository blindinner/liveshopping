-- Analytics & Attribution Tables
-- Enables real-time metrics and sales attribution across e-commerce platforms

-- ============================================
-- ENGAGEMENT_EVENTS TABLE - Track viewer interactions
-- High-volume, real-time metrics for show engagement
-- ============================================
CREATE TABLE engagement_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  show_id UUID NOT NULL REFERENCES shows(id) ON DELETE CASCADE,
  viewer_id TEXT NOT NULL,
  event_type TEXT NOT NULL, -- viewer_join, viewer_leave, product_view, reaction, chat_message
  metadata JSONB DEFAULT '{}', -- emoji type, message preview, etc.
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_engagement_events_show ON engagement_events(show_id);
CREATE INDEX idx_engagement_events_show_type ON engagement_events(show_id, event_type);
CREATE INDEX idx_engagement_events_created ON engagement_events(created_at DESC);
CREATE INDEX idx_engagement_events_viewer ON engagement_events(show_id, viewer_id);

-- ============================================
-- CART_SESSIONS TABLE - Link carts to shows for attribution
-- Must be created before cart_events (referenced by FK)
-- ============================================
CREATE TABLE cart_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  show_id UUID NOT NULL REFERENCES shows(id) ON DELETE CASCADE,
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  viewer_id TEXT NOT NULL,
  platform_cart_id TEXT NOT NULL, -- Shopify cart ID, WooCommerce session, etc.
  platform TEXT NOT NULL DEFAULT 'shopify', -- shopify, woocommerce, bigcommerce, magento
  checkout_url TEXT,
  converted BOOLEAN DEFAULT FALSE,
  order_id TEXT, -- Platform-specific order ID when converted
  order_total DECIMAL(10, 2),
  order_currency TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  converted_at TIMESTAMPTZ,
  UNIQUE(platform_cart_id, platform)
);

CREATE INDEX idx_cart_sessions_show ON cart_sessions(show_id);
CREATE INDEX idx_cart_sessions_platform_cart ON cart_sessions(platform_cart_id, platform);
CREATE INDEX idx_cart_sessions_converted ON cart_sessions(show_id, converted) WHERE converted = TRUE;
CREATE INDEX idx_cart_sessions_viewer ON cart_sessions(show_id, viewer_id);

-- ============================================
-- CART_EVENTS TABLE - Track cart and checkout actions
-- Revenue attribution and conversion tracking
-- ============================================
CREATE TABLE cart_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  show_id UUID NOT NULL REFERENCES shows(id) ON DELETE CASCADE,
  viewer_id TEXT NOT NULL,
  event_type TEXT NOT NULL, -- add_to_cart, remove_from_cart, checkout_start, checkout_complete
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  cart_session_id UUID REFERENCES cart_sessions(id) ON DELETE SET NULL,
  quantity INTEGER DEFAULT 1,
  unit_price DECIMAL(10, 2),
  currency TEXT,
  metadata JSONB DEFAULT '{}', -- variant info, discount codes, etc.
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cart_events_show ON cart_events(show_id);
CREATE INDEX idx_cart_events_show_type ON cart_events(show_id, event_type);
CREATE INDEX idx_cart_events_product ON cart_events(product_id);
CREATE INDEX idx_cart_events_cart_session ON cart_events(cart_session_id);
CREATE INDEX idx_cart_events_created ON cart_events(created_at DESC);
CREATE INDEX idx_cart_events_viewer ON cart_events(show_id, viewer_id);

-- ============================================
-- MODIFY BRANDS TABLE - Add platform support
-- ============================================
ALTER TABLE brands ADD COLUMN IF NOT EXISTS platform TEXT NOT NULL DEFAULT 'shopify';
ALTER TABLE brands ADD COLUMN IF NOT EXISTS platform_config JSONB DEFAULT '{}';

COMMENT ON COLUMN brands.platform IS 'E-commerce platform type: shopify, woocommerce, bigcommerce, magento';
COMMENT ON COLUMN brands.platform_config IS 'Platform-specific configuration (webhook_secret, admin_token, etc.)';

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on all analytics tables
ALTER TABLE engagement_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_sessions ENABLE ROW LEVEL SECURITY;

-- ENGAGEMENT_EVENTS: Anyone can insert (viewers), authenticated can read
CREATE POLICY "Anyone can insert engagement events"
  ON engagement_events FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Authenticated can read engagement events"
  ON engagement_events FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Service role full access to engagement events"
  ON engagement_events FOR ALL
  USING (auth.role() = 'service_role');

-- CART_EVENTS: Anyone can insert (viewers), authenticated can read
CREATE POLICY "Anyone can insert cart events"
  ON cart_events FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Authenticated can read cart events"
  ON cart_events FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Service role full access to cart events"
  ON cart_events FOR ALL
  USING (auth.role() = 'service_role');

-- CART_SESSIONS: Service role only (created by API, updated by webhooks)
CREATE POLICY "Service role full access to cart sessions"
  ON cart_sessions FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Authenticated can read cart sessions"
  ON cart_sessions FOR SELECT
  USING (auth.role() = 'authenticated');

-- ============================================
-- REALTIME PUBLICATIONS
-- ============================================
-- Enable realtime for analytics tables
ALTER PUBLICATION supabase_realtime ADD TABLE engagement_events;
ALTER PUBLICATION supabase_realtime ADD TABLE cart_events;
ALTER PUBLICATION supabase_realtime ADD TABLE cart_sessions;
