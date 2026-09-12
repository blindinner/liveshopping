import { NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

// GET /api/brands - Get brands for the authenticated user
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Use service client to access brands table (RLS restricts direct access)
    const supabaseService = createServiceClient();

    // Return only brands owned by the authenticated user
    const { data: brands, error } = await supabaseService
      .from('brands')
      .select('id, name, shopify_domain, website_url, created_at')
      .eq('user_id', user.id);

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

// PATCH /api/brands - Update brand settings
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { brandId, website_url } = await request.json();

    if (!brandId) {
      return NextResponse.json(
        { error: 'brandId is required' },
        { status: 400 }
      );
    }

    const supabaseService = createServiceClient();

    // Only update if the brand belongs to the authenticated user
    const { data: brand, error } = await supabaseService
      .from('brands')
      .update({ website_url: website_url || null })
      .eq('id', brandId)
      .eq('user_id', user.id)
      .select('id, name, shopify_domain, website_url, created_at')
      .single();

    if (error) {
      throw error;
    }

    if (!brand) {
      return NextResponse.json(
        { error: 'Brand not found or access denied' },
        { status: 404 }
      );
    }

    return NextResponse.json({ brand });
  } catch (error) {
    console.error('Update brand error:', error);
    return NextResponse.json(
      { error: 'Failed to update brand' },
      { status: 500 }
    );
  }
}

// POST /api/brands - Create a brand (for initial setup)
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { name, shopifyDomain, shopifyStorefrontToken } = await request.json();

    if (!name || !shopifyDomain || !shopifyStorefrontToken) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabaseService = createServiceClient();

    const { data: brand, error } = await supabaseService
      .from('brands')
      .insert({
        name,
        shopify_domain: shopifyDomain,
        shopify_storefront_token: shopifyStorefrontToken,
        user_id: user.id,
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
