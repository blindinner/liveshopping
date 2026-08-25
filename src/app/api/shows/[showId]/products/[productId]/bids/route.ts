import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

// GET /api/shows/[showId]/products/[productId]/bids - Get all bids for an auction
export async function GET(
  request: Request,
  { params }: { params: Promise<{ showId: string; productId: string }> }
) {
  try {
    const { productId } = await params;
    const serviceClient = createServiceClient();

    const { data: bids, error } = await serviceClient
      .from('bids')
      .select(`
        *,
        bidder:bidders(id, name, email, phone, viewer_id)
      `)
      .eq('show_product_id', productId)
      .order('amount', { ascending: false });

    if (error) {
      throw error;
    }

    // Get highest bid info
    const highestBid = bids && bids.length > 0 ? bids[0] : null;

    return NextResponse.json({
      bids,
      highest_bid: highestBid?.amount || null,
      bid_count: bids?.length || 0,
      highest_bidder: highestBid?.bidder || null,
    });
  } catch (error) {
    console.error('Get bids error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bids' },
      { status: 500 }
    );
  }
}

// POST /api/shows/[showId]/products/[productId]/bids - Place a bid
export async function POST(
  request: Request,
  { params }: { params: Promise<{ showId: string; productId: string }> }
) {
  try {
    const { showId, productId } = await params;
    const body = await request.json();
    const { viewer_id, amount } = body;

    if (!viewer_id || !amount) {
      return NextResponse.json(
        { error: 'viewer_id and amount are required' },
        { status: 400 }
      );
    }

    const serviceClient = createServiceClient();

    // Get the show_product to check auction status and rules
    const { data: showProduct, error: productError } = await serviceClient
      .from('show_products')
      .select('*')
      .eq('id', productId)
      .eq('show_id', showId)
      .single();

    if (productError || !showProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    if (showProduct.sale_type !== 'auction') {
      return NextResponse.json(
        { error: 'This product is not an auction' },
        { status: 400 }
      );
    }

    if (showProduct.auction_status !== 'active') {
      return NextResponse.json(
        { error: 'Auction is not active' },
        { status: 400 }
      );
    }

    // Get bidder record
    const { data: bidder, error: bidderError } = await serviceClient
      .from('bidders')
      .select('*')
      .eq('show_id', showId)
      .eq('viewer_id', viewer_id)
      .single();

    if (bidderError || !bidder) {
      return NextResponse.json(
        { error: 'You must register as a bidder first' },
        { status: 400 }
      );
    }

    if (!bidder.approved) {
      return NextResponse.json(
        { error: 'Your bidder registration is not approved' },
        { status: 403 }
      );
    }

    // Get current highest bid
    const { data: highestBidData } = await serviceClient
      .from('bids')
      .select('amount')
      .eq('show_product_id', productId)
      .order('amount', { ascending: false })
      .limit(1)
      .single();

    const currentHighestBid = highestBidData?.amount || 0;
    const startingPrice = showProduct.starting_price || 0;
    const bidIncrement = showProduct.bid_increment || 1;

    // Determine minimum valid bid
    const minimumBid = currentHighestBid > 0
      ? currentHighestBid + bidIncrement
      : startingPrice;

    if (amount < minimumBid) {
      return NextResponse.json(
        {
          error: `Bid must be at least ${minimumBid}`,
          minimum_bid: minimumBid,
          current_highest: currentHighestBid,
          bid_increment: bidIncrement,
        },
        { status: 400 }
      );
    }

    // Place the bid
    const { data: bid, error: bidError } = await serviceClient
      .from('bids')
      .insert({
        show_product_id: productId,
        bidder_id: bidder.id,
        amount,
      })
      .select(`
        *,
        bidder:bidders(id, name, viewer_id)
      `)
      .single();

    if (bidError) {
      throw bidError;
    }

    // Track analytics event
    await serviceClient
      .from('show_events')
      .insert({
        show_id: showId,
        viewer_id,
        event_type: 'bid_placed',
        product_id: showProduct.product_id,
        metadata: {
          show_product_id: productId,
          bid_amount: amount,
          bid_id: bid.id,
        },
      });

    return NextResponse.json({
      bid,
      message: 'Bid placed successfully',
    });
  } catch (error) {
    console.error('Place bid error:', error);
    return NextResponse.json(
      { error: 'Failed to place bid' },
      { status: 500 }
    );
  }
}
