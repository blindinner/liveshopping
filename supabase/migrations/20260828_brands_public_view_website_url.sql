-- Update brands_public view to include website_url
-- Must drop and recreate since we're adding a new column

DROP VIEW IF EXISTS brands_public;

CREATE VIEW brands_public AS
SELECT
  id,
  name,
  shopify_domain,
  platform,
  created_at,
  website_url
FROM brands;

-- Re-grant access
GRANT SELECT ON brands_public TO anon, authenticated;
