-- Auction/Bidding Tables
-- Enables real-time auctions for live streams

-- ============================================
-- MODIFY SHOW_PRODUCTS TABLE - Add auction fields
-- ============================================
ALTER TABLE show_products ADD COLUMN sale_type TEXT DEFAULT 'buy_now';
ALTER TABLE show_products ADD COLUMN starting_price DECIMAL(10,2);
ALTER TABLE show_products ADD COLUMN bid_increment DECIMAL(10,2);
ALTER TABLE show_products ADD COLUMN auction_status TEXT DEFAULT 'pending';
ALTER TABLE show_products ADD COLUMN auction_ended_at TIMESTAMPTZ;
ALTER TABLE show_products ADD COLUMN winner_bidder_id UUID;

-- Index for finding active auctions
CREATE INDEX idx_show_products_auction ON show_products(show_id, sale_type, auction_status);

-- ============================================
-- BIDDERS TABLE - Registered bidders per show
-- ============================================
CREATE TABLE bidders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  show_id UUID NOT NULL REFERENCES shows(id) ON DELETE CASCADE,
  viewer_id TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  approved BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- One registration per viewer per show
  UNIQUE(show_id, viewer_id)
);

CREATE INDEX idx_bidders_show ON bidders(show_id);
CREATE INDEX idx_bidders_viewer ON bidders(show_id, viewer_id);

-- ============================================
-- BIDS TABLE - Individual bids on auctions
-- ============================================
CREATE TABLE bids (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  show_product_id UUID NOT NULL REFERENCES show_products(id) ON DELETE CASCADE,
  bidder_id UUID NOT NULL REFERENCES bidders(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bids_show_product ON bids(show_product_id);
CREATE INDEX idx_bids_amount ON bids(show_product_id, amount DESC);
CREATE INDEX idx_bids_bidder ON bids(bidder_id);

-- ============================================
-- AUCTION_WINNERS TABLE - Records of auction winners
-- ============================================
CREATE TABLE auction_winners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  show_product_id UUID NOT NULL REFERENCES show_products(id) ON DELETE CASCADE,
  bidder_id UUID NOT NULL REFERENCES bidders(id),
  winning_amount DECIMAL(10,2) NOT NULL,
  payment_status TEXT DEFAULT 'pending',
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- One winner per auction
  UNIQUE(show_product_id)
);

CREATE INDEX idx_auction_winners_bidder ON auction_winners(bidder_id);
CREATE INDEX idx_auction_winners_status ON auction_winners(payment_status);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE bidders ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE auction_winners ENABLE ROW LEVEL SECURITY;

-- BIDDERS: Anyone can register (insert), public read, authenticated manage
CREATE POLICY "Anyone can register as bidder"
  ON bidders FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Public read for bidders"
  ON bidders FOR SELECT
  USING (TRUE);

CREATE POLICY "Authenticated can manage bidders"
  ON bidders FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Service role full access to bidders"
  ON bidders FOR ALL
  USING (auth.role() = 'service_role');

-- BIDS: Anyone can insert (bidders place bids), public read
CREATE POLICY "Anyone can place bids"
  ON bids FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Public read for bids"
  ON bids FOR SELECT
  USING (TRUE);

CREATE POLICY "Service role full access to bids"
  ON bids FOR ALL
  USING (auth.role() = 'service_role');

-- AUCTION_WINNERS: Public read, service role write
CREATE POLICY "Public read for auction winners"
  ON auction_winners FOR SELECT
  USING (TRUE);

CREATE POLICY "Authenticated can manage auction winners"
  ON auction_winners FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Service role full access to auction winners"
  ON auction_winners FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- REALTIME
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE bidders;
ALTER PUBLICATION supabase_realtime ADD TABLE bids;
ALTER PUBLICATION supabase_realtime ADD TABLE auction_winners;
