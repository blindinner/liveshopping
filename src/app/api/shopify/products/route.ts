import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  createShopifyClient,
  PRODUCTS_QUERY,
  type ShopifyProduct,
} from '@/lib/shopify/client';

// GET /api/shopify/products?query=...
// Fetches products from Shopify for the host to add to a show
export async function GET(request: Request) {
  try {
    // Verify user is authenticated
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '';

    // For MVP, use env vars. Later, fetch from brands table based on user's brand
    const domain = process.env.SHOPIFY_STORE_DOMAIN!;
    const accessToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN!;

    const client = createShopifyClient(domain, accessToken);

    const response = await client.request<{
      products: {
        edges: Array<{ node: ShopifyProduct }>;
      };
    }>(PRODUCTS_QUERY, {
      first: 20,
      query: query || null,
    });

    // Transform to simpler format
    const products = response.products.edges.map(({ node }) => {
      const firstVariant = node.variants.edges[0]?.node;
      return {
        shopify_product_id: node.id,
        shopify_variant_id: firstVariant?.id,
        title: node.title,
        price: parseFloat(firstVariant?.price.amount || '0'),
        currency: firstVariant?.price.currencyCode || 'ILS',
        image_url: node.featuredImage?.url || null,
        available: firstVariant?.availableForSale || false,
      };
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Shopify products error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST /api/shopify/products - Create or get existing product record
export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    let user;
    try {
      const { data } = await supabase.auth.getUser();
      user = data.user;
    } catch (authError) {
      console.error('Auth check failed (network issue?):', authError);
      return NextResponse.json(
        { error: 'Service temporarily unavailable, please try again' },
        { status: 503 }
      );
    }

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      brandId,
      shopifyProductId,
      shopifyVariantId,
      title,
      price,
      currency,
      imageUrl,
    } = await request.json();

    if (!brandId || !shopifyVariantId || !title) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if product already exists
    const { data: existingProduct } = await supabase
      .from('products')
      .select('*')
      .eq('brand_id', brandId)
      .eq('shopify_variant_id', shopifyVariantId)
      .single();

    if (existingProduct) {
      return NextResponse.json({ product: existingProduct });
    }

    // Create new product
    const { data: product, error } = await supabase
      .from('products')
      .insert({
        brand_id: brandId,
        shopify_product_id: shopifyProductId,
        shopify_variant_id: shopifyVariantId,
        title,
        price,
        currency: currency || 'ILS',
        image_url: imageUrl,
        source: 'shopify',
      })
      .select()
      .single();

    if (error) {
      console.error('Create product error:', error);
      return NextResponse.json(
        { error: 'Failed to create product' },
        { status: 500 }
      );
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Create product API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
