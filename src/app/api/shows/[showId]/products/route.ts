import { NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

// GET /api/shows/[showId]/products - Get products for a show
export async function GET(
  request: Request,
  { params }: { params: Promise<{ showId: string }> }
) {
  try {
    const { showId } = await params;
    const supabase = await createClient();

    const { data: showProducts, error } = await supabase
      .from('show_products')
      .select('*, product:products(*)')
      .eq('show_id', showId)
      .order('display_order', { ascending: true });

    if (error) {
      throw error;
    }

    return NextResponse.json({ products: showProducts });
  } catch (error) {
    console.error('Get show products error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST /api/shows/[showId]/products - Add product to show
export async function POST(
  request: Request,
  { params }: { params: Promise<{ showId: string }> }
) {
  try {
    const { showId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      shopifyProductId,
      shopifyVariantId,
      title,
      price,
      currency,
      imageUrl,
      brandId,
    } = await request.json();

    // Use service client to insert product (may need to bypass RLS for cross-table operations)
    const serviceClient = createServiceClient();

    // First, upsert the product
    const { data: product, error: productError } = await serviceClient
      .from('products')
      .upsert(
        {
          brand_id: brandId,
          shopify_product_id: shopifyProductId,
          shopify_variant_id: shopifyVariantId,
          title,
          price,
          currency,
          image_url: imageUrl,
        },
        {
          onConflict: 'brand_id,shopify_variant_id',
        }
      )
      .select()
      .single();

    if (productError) {
      console.error('Product upsert error:', productError);
      return NextResponse.json(
        { error: 'Failed to save product' },
        { status: 500 }
      );
    }

    // Get current max display order
    const { data: existingProducts } = await serviceClient
      .from('show_products')
      .select('display_order')
      .eq('show_id', showId)
      .order('display_order', { ascending: false })
      .limit(1);

    const nextOrder = (existingProducts?.[0]?.display_order ?? -1) + 1;

    // Add to show_products
    const { data: showProduct, error: showProductError } = await serviceClient
      .from('show_products')
      .upsert(
        {
          show_id: showId,
          product_id: product.id,
          display_order: nextOrder,
          is_active: false,
        },
        {
          onConflict: 'show_id,product_id',
        }
      )
      .select('*, product:products(*)')
      .single();

    if (showProductError) {
      console.error('Show product error:', showProductError);
      return NextResponse.json(
        { error: 'Failed to add product to show' },
        { status: 500 }
      );
    }

    return NextResponse.json({ showProduct });
  } catch (error) {
    console.error('Add product to show error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
