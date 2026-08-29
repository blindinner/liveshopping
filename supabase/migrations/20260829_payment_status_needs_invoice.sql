-- Update payment_status workflow for auction winners
-- Statuses: needs_invoice -> invoice_sent -> paid

-- Update existing 'pending' records to 'needs_invoice'
UPDATE auction_winners
SET payment_status = 'needs_invoice'
WHERE payment_status = 'pending';

-- Add new columns for tracking
ALTER TABLE auction_winners
ADD COLUMN IF NOT EXISTS status_updated_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Update existing records to have status_updated_at
UPDATE auction_winners
SET status_updated_at = COALESCE(paid_at, created_at)
WHERE status_updated_at IS NULL;
