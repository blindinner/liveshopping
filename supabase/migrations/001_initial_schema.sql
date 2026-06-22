-- Live Shopping Platform - Initial Schema
-- Phase 1 MVP

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- BRANDS TABLE
-- ============================================
CREATE TABLE brands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  shopify_domain TEXT NOT NULL,
  -- Storefront token stored encrypted, accessed only server-side
  shopify_storefront_token TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SHOWS TABLE
-- ============================================
CREATE TYPE show_status AS ENUM ('scheduled', 'live', 'ended');

CREATE TABLE shows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  status show_status DEFAULT 'scheduled',
  mux_stream_id TEXT,
  mux_playback_id TEXT,
  mux_stream_key TEXT, -- Only shown to host, never exposed to viewers
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_shows_brand ON shows(brand_id);
CREATE INDEX idx_shows_status ON shows(status);
CREATE INDEX idx_shows_scheduled ON shows(scheduled_at);

-- ============================================
-- PRODUCTS TABLE (Shopify product snapshots)
-- ============================================
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  shopify_product_id TEXT NOT NULL,
  shopify_variant_id TEXT NOT NULL,
  title TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'ILS',
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(brand_id, shopify_variant_id)
);

CREATE INDEX idx_products_brand ON products(brand_id);
CREATE INDEX idx_products_shopify ON products(shopify_product_id);

-- ============================================
-- SHOW_PRODUCTS TABLE (Products featured in a show)
-- ============================================
CREATE TABLE show_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  show_id UUID NOT NULL REFERENCES shows(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT FALSE, -- Currently on-screen product
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(show_id, product_id)
);

CREATE INDEX idx_show_products_show ON show_products(show_id);
CREATE INDEX idx_show_products_active ON show_products(show_id, is_active) WHERE is_active = TRUE;

-- ============================================
-- CHAT_MESSAGES TABLE
-- ============================================
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  show_id UUID NOT NULL REFERENCES shows(id) ON DELETE CASCADE,
  viewer_name TEXT NOT NULL,
  message TEXT NOT NULL,
  hidden BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_show ON chat_messages(show_id);
CREATE INDEX idx_chat_created ON chat_messages(show_id, created_at DESC);

-- ============================================
-- LEADS TABLE (Viewer contact capture)
-- ============================================
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  show_id UUID NOT NULL REFERENCES shows(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  consent BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_leads_show ON leads(show_id);
CREATE INDEX idx_leads_created ON leads(created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE shows ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE show_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- BRANDS: No public read (storefront token is secret)
-- Only service role can access brands
CREATE POLICY "Service role full access to brands"
  ON brands FOR ALL
  USING (auth.role() = 'service_role');

-- SHOWS: Public read for live/scheduled shows
CREATE POLICY "Public read for shows"
  ON shows FOR SELECT
  USING (status IN ('scheduled', 'live'));

CREATE POLICY "Authenticated users can manage shows"
  ON shows FOR ALL
  USING (auth.role() = 'authenticated');

-- PRODUCTS: Public read
CREATE POLICY "Public read for products"
  ON products FOR SELECT
  USING (TRUE);

CREATE POLICY "Authenticated users can manage products"
  ON products FOR ALL
  USING (auth.role() = 'authenticated');

-- SHOW_PRODUCTS: Public read for show's products
CREATE POLICY "Public read for show products"
  ON show_products FOR SELECT
  USING (TRUE);

CREATE POLICY "Authenticated users can manage show products"
  ON show_products FOR ALL
  USING (auth.role() = 'authenticated');

-- CHAT_MESSAGES: Public can insert (send messages), read non-hidden
CREATE POLICY "Public can read non-hidden messages"
  ON chat_messages FOR SELECT
  USING (hidden = FALSE);

CREATE POLICY "Anyone can insert chat messages"
  ON chat_messages FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Authenticated can update/delete messages"
  ON chat_messages FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can delete messages"
  ON chat_messages FOR DELETE
  USING (auth.role() = 'authenticated');

-- LEADS: Public can insert (with consent), only authenticated can read
CREATE POLICY "Anyone can insert leads with consent"
  ON leads FOR INSERT
  WITH CHECK (consent = TRUE);

CREATE POLICY "Authenticated can read leads"
  ON leads FOR SELECT
  USING (auth.role() = 'authenticated');

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER brands_updated_at
  BEFORE UPDATE ON brands
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER shows_updated_at
  BEFORE UPDATE ON shows
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- REALTIME PUBLICATIONS
-- ============================================
-- Enable realtime for tables that need live updates
ALTER PUBLICATION supabase_realtime ADD TABLE shows;
ALTER PUBLICATION supabase_realtime ADD TABLE show_products;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
