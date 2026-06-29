-- Add handle column to products table for Shopify product URLs
ALTER TABLE products ADD COLUMN IF NOT EXISTS handle TEXT;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_products_handle ON products(handle);
