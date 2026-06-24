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

    const body = await request.json();
    const {
      shopifyProductId,
      shopifyVariantId,
      title,
      price,
      currency,
      imageUrl,
      brandId,
      source = 'shopify',
      checkoutUrl,
    } = body;

    // Use service client to insert product (may need to bypass RLS for cross-table operations)
    const serviceClient = createServiceClient();

    // Handle manual vs Shopify products differently
    let product;
    let productError;

    if (source === 'manual') {
      // For manual products, always insert a new record
      const result = await serviceClient
        .from('products')
        .insert({
          brand_id: brandId,
          title,
          price,
          currency,
          image_url: imageUrl,
          source: 'manual',
          checkout_url: checkoutUrl,
          shopify_product_id: null,
          shopify_variant_id: null,
        })
        .select()
        .single();

      product = result.data;
      productError = result.error;
    } else {
      // For Shopify products, check if exists first then insert or update
      // (partial unique index doesn't work with onConflict)
      const { data: existingProduct } = await serviceClient
        .from('products')
        .select()
        .eq('brand_id', brandId)
        .eq('shopify_variant_id', shopifyVariantId)
        .single();

      if (existingProduct) {
        // Update existing product
        const result = await serviceClient
          .from('products')
          .update({
            shopify_product_id: shopifyProductId,
            title,
            price,
            currency,
            image_url: imageUrl,
          })
          .eq('id', existingProduct.id)
          .select()
          .single();

        product = result.data;
        productError = result.error;
      } else {
        // Insert new product
        const result = await serviceClient
          .from('products')
          .insert({
            brand_id: brandId,
            shopify_product_id: shopifyProductId,
            shopify_variant_id: shopifyVariantId,
            title,
            price,
            currency,
            image_url: imageUrl,
            source: 'shopify',
          })
          .select()
          .single();

        product = result.data;
        productError = result.error;
      }
    }

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
