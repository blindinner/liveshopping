import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// CORS headers for widget embeds
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// OPTIONS handler for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, { headers: corsHeaders });
}

// GET /api/products/[shopifyProductId]/videos - Get videos featuring a specific product
export async function GET(
  request: Request,
  { params }: { params: Promise<{ shopifyProductId: string }> }
) {
  try {
    const { shopifyProductId } = await params;
    const supabase = await createClient();

    // First, find the product by Shopify product ID
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id')
      .eq('shopify_product_id', shopifyProductId)
      .single();

    if (productError || !product) {
      // No product found with this Shopify ID
      return NextResponse.json({ videos: [] }, { headers: corsHeaders });
    }

    // Get all video_products entries for this product
    const { data: videoProducts, error: vpError } = await supabase
      .from('video_products')
      .select('video_id')
      .eq('product_id', product.id);

    if (vpError || !videoProducts || videoProducts.length === 0) {
      return NextResponse.json({ videos: [] }, { headers: corsHeaders });
    }

    const videoIds = videoProducts.map(vp => vp.video_id);

    // Get all videos that feature this product
    const { data: videos, error: videosError } = await supabase
      .from('videos')
      .select(`
        *,
        product:products(*),
        products:video_products(
          *,
          product:products(*)
        )
      `)
      .in('id', videoIds)
      .eq('status', 'ready')
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (videosError) {
      throw videosError;
    }

    return NextResponse.json({ videos: videos || [] }, { headers: corsHeaders });
  } catch (error) {
    console.error('Get product videos error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch videos' },
      { status: 500, headers: corsHeaders }
    );
  }
}
