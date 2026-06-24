-- Add support for manual products (not from Shopify)
-- Manual products have a checkout_url instead of Shopify variant IDs

-- Add source field to distinguish product types
ALTER TABLE products ADD COLUMN source TEXT DEFAULT 'shopify' CHECK (source IN ('shopify', 'manual'));

-- Add checkout_url for manual products (external purchase link)
ALTER TABLE products ADD COLUMN checkout_url TEXT;

-- Make Shopify-specific fields nullable for manual products
ALTER TABLE products ALTER COLUMN shopify_product_id DROP NOT NULL;
ALTER TABLE products ALTER COLUMN shopify_variant_id DROP NOT NULL;

-- Drop the existing unique constraint that requires shopify_variant_id
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_brand_id_shopify_variant_id_key;

-- Create a partial unique constraint for Shopify products only
CREATE UNIQUE INDEX idx_products_shopify_unique
  ON products(brand_id, shopify_variant_id)
  WHERE shopify_variant_id IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN products.source IS 'Product source: shopify (from Shopify store) or manual (manually added)';
COMMENT ON COLUMN products.checkout_url IS 'External checkout URL for manual products';
