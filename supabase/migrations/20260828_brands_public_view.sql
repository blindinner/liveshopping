-- Create a public view for brands that exposes only non-sensitive fields
-- This allows client-side queries to join with brand data without exposing secrets

CREATE VIEW brands_public AS
SELECT
  id,
  name,
  shopify_domain,
  platform,
  created_at
FROM brands;

-- Grant read access to anonymous and authenticated users
GRANT SELECT ON brands_public TO anon, authenticated;

-- Add comment explaining the view's purpose
COMMENT ON VIEW brands_public IS 'Public view of brands table, excludes sensitive fields like storefront tokens';
