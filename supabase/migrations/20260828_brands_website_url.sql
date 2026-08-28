-- Add website_url to brands for non-Shopify users
-- This allows brands to set their website URL once and have it apply to all shows

ALTER TABLE brands ADD COLUMN website_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN brands.website_url IS 'Brand website URL for non-Shopify users. When set, invitation links redirect here instead of requiring embed_url per show.';
