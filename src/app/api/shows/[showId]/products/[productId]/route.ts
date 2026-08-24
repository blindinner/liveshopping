import { NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

// PATCH /api/shows/[showId]/products/[productId] - Update show product (e.g., set active, auction settings)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ showId: string; productId: string }> }
) {
  try {
    const { showId, productId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const updates = await request.json();

    // If setting this product as active, first deactivate all others
    if (updates.is_active === true) {
      await supabase
        .from('show_products')
        .update({ is_active: false })
        .eq('show_id', showId)
        .neq('id', productId);
    }

    // Handle auction ending - create winner record
    if (updates.auction_status === 'ended') {
      updates.auction_ended_at = new Date().toISOString();

      const serviceClient = createServiceClient();

      // Get highest bid for this auction
      const { data: highestBid } = await serviceClient
        .from('bids')
        .select(`
          *,
          bidder:bidders(*)
        `)
        .eq('show_product_id', productId)
        .order('amount', { ascending: false })
        .limit(1)
        .single();

      if (highestBid) {
        // Set winner on show_product
        updates.winner_bidder_id = highestBid.bidder_id;

        // Create auction winner record
        await serviceClient
          .from('auction_winners')
          .upsert({
            show_product_id: productId,
            bidder_id: highestBid.bidder_id,
            winning_amount: highestBid.amount,
            payment_status: 'pending',
          }, {
            onConflict: 'show_product_id',
          });

        // Track analytics event
        await serviceClient
          .from('show_events')
          .insert({
            show_id: showId,
            viewer_id: highestBid.bidder.viewer_id,
            event_type: 'auction_won',
            metadata: {
              show_product_id: productId,
              winning_amount: highestBid.amount,
              bidder_id: highestBid.bidder_id,
            },
          });
      }
    }

    const { data: showProduct, error } = await supabase
      .from('show_products')
      .update(updates)
      .eq('id', productId)
      .eq('show_id', showId)
      .select('*, product:products(*)')
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update product' },
        { status: 500 }
      );
    }

    return NextResponse.json({ showProduct });
  } catch (error) {
    console.error('Update show product error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/shows/[showId]/products/[productId] - Remove product from show
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ showId: string; productId: string }> }
) {
  try {
    const { showId, productId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { error } = await supabase
      .from('show_products')
      .delete()
      .eq('id', productId)
      .eq('show_id', showId);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to remove product' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete show product error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
