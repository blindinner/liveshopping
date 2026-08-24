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

    // Get all winners for this show with related data
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
      .eq('show_product.show_id', showId);

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
      throw error;
    }

    // Filter out null show_products (from the join filter)
    const validWinners = (winners || []).filter(w => w.show_product !== null);

    return NextResponse.json({ winners: validWinners });
  } catch (error) {
    console.error('Get winners error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch winners' },
      { status: 500 }
    );
  }
}
