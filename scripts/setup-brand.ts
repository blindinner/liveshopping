/**
 * Setup script to create the initial brand
 *
 * Usage:
 * npx tsx scripts/setup-brand.ts
 *
 * Make sure to set the environment variables first:
 * - NEXT_PUBLIC_SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 * - SHOPIFY_STORE_DOMAIN
 * - SHOPIFY_STOREFRONT_ACCESS_TOKEN
 */

import { createClient } from '@supabase/supabase-js';

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const shopifyDomain = process.env.SHOPIFY_STORE_DOMAIN;
  const shopifyToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
  }

  if (!shopifyDomain || !shopifyToken) {
    console.error('Missing Shopify credentials');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Check if brand already exists
  const { data: existingBrands } = await supabase
    .from('brands')
    .select('id, name')
    .limit(1);

  if (existingBrands && existingBrands.length > 0) {
    console.log('Brand already exists:', existingBrands[0]);
    return;
  }

  // Create the brand
  const { data: brand, error } = await supabase
    .from('brands')
    .insert({
      name: 'My Store',
      shopify_domain: shopifyDomain,
      shopify_storefront_token: shopifyToken,
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to create brand:', error);
    process.exit(1);
  }

  console.log('Brand created successfully!');
  console.log('Brand ID:', brand.id);
  console.log('Store:', shopifyDomain);
}

main().catch(console.error);
