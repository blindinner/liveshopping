-- ============================================
-- ADD USER_ID TO BRANDS FOR MULTI-TENANCY
-- ============================================
-- Each brand is now owned by a specific user.
-- This enables proper data isolation between customers.

-- Add user_id column to brands
ALTER TABLE brands
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create index for efficient user-based queries
CREATE INDEX idx_brands_user_id ON brands(user_id);

-- Update the brands_public view to include user_id (but not expose tokens)
DROP VIEW IF EXISTS brands_public;
CREATE VIEW brands_public AS
SELECT
  id,
  name,
  shopify_domain,
  website_url,
  platform,
  user_id,
  created_at,
  updated_at
FROM brands;

-- Grant access to the public view
GRANT SELECT ON brands_public TO anon, authenticated;
