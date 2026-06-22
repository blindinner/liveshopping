import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

// GET /api/brands - Get brands (for host, service role needed)
export async function GET() {
  try {
    const supabase = createServiceClient();

    // For MVP, return all brands (should be just one)
    // Don't return the storefront token to the client
    const { data: brands, error } = await supabase
      .from('brands')
      .select('id, name, shopify_domain, created_at')
      .limit(1);

    if (error) {
      throw error;
    }

    return NextResponse.json({ brands });
  } catch (error) {
    console.error('Get brands error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch brands' },
      { status: 500 }
    );
  }
}

// POST /api/brands - Create a brand (for initial setup)
export async function POST(request: Request) {
  try {
    const { name, shopifyDomain, shopifyStorefrontToken } = await request.json();

    if (!name || !shopifyDomain || !shopifyStorefrontToken) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    const { data: brand, error } = await supabase
      .from('brands')
      .insert({
        name,
        shopify_domain: shopifyDomain,
        shopify_storefront_token: shopifyStorefrontToken,
      })
      .select('id, name, shopify_domain')
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ brand });
  } catch (error) {
    console.error('Create brand error:', error);
    return NextResponse.json(
      { error: 'Failed to create brand' },
      { status: 500 }
    );
  }
}
