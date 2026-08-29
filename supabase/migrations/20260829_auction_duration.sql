-- Add auction duration and started_at columns to show_products
ALTER TABLE show_products ADD COLUMN IF NOT EXISTS auction_duration_seconds INTEGER;
ALTER TABLE show_products ADD COLUMN IF NOT EXISTS auction_started_at TIMESTAMPTZ;

COMMENT ON COLUMN show_products.auction_duration_seconds IS 'Optional countdown duration for auctions in seconds. If null, auction ends manually.';
COMMENT ON COLUMN show_products.auction_started_at IS 'Timestamp when the auction was started. Used for timer countdown.';
