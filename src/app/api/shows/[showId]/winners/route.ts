import { NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

// GET /api/shows/[showId]/winners - Get all auction winners for a show
export async function GET(
  request: Request,
  { params }: { params: Promise<{ showId: string }> }
) {
  try {
    const { showId } = await params;
    const { searchParams } = new URL(request.url);
    const viewerId = searchParams.get('viewer_id');

    const serviceClient = createServiceClient();

    // First, get all show_product IDs for this show
    const { data: showProducts } = await serviceClient
      .from('show_products')
      .select('id')
      .eq('show_id', showId)
      .eq('sale_type', 'auction');

    if (!showProducts || showProducts.length === 0) {
      return NextResponse.json({ winners: [] });
    }

    const showProductIds = showProducts.map(sp => sp.id);

    // Now get winners for these show_products
    let query = serviceClient
      .from('auction_winners')
      .select(`
        *,
        bidder:bidders(*),
        show_product:show_products(
          *,
          product:products(*)
        )
      `)
      .in('show_product_id', showProductIds);

    // If viewer_id provided, filter to just their wins
    if (viewerId) {
      const { data: bidder } = await serviceClient
        .from('bidders')
        .select('id')
        .eq('show_id', showId)
        .eq('viewer_id', viewerId)
        .single();

      if (bidder) {
        query = query.eq('bidder_id', bidder.id);
      } else {
        return NextResponse.json({ winners: [] });
      }
    }

    const { data: winners, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Winners query error:', error);
      throw error;
    }

    return NextResponse.json({ winners: winners || [] });
  } catch (error) {
    console.error('Get winners error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch winners' },
      { status: 500 }
    );
  }
}
