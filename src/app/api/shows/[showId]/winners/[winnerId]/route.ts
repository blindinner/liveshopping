import { NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

// PATCH /api/shows/[showId]/winners/[winnerId] - Update winner (e.g., payment status)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ showId: string; winnerId: string }> }
) {
  try {
    const { winnerId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { payment_status, notes } = body;

    const updates: Record<string, unknown> = {};

    if (payment_status !== undefined) {
      updates.payment_status = payment_status;
      updates.status_updated_at = new Date().toISOString();
      if (payment_status === 'paid') {
        updates.paid_at = new Date().toISOString();
      }
    }

    if (notes !== undefined) {
      updates.notes = notes;
    }

    const serviceClient = createServiceClient();

    const { data: winner, error } = await serviceClient
      .from('auction_winners')
      .update(updates)
      .eq('id', winnerId)
      .select(`
        *,
        bidder:bidders(*),
        show_product:show_products(
          *,
          product:products(*)
        )
      `)
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ winner });
  } catch (error) {
    console.error('Update winner error:', error);
    return NextResponse.json(
      { error: 'Failed to update winner' },
      { status: 500 }
    );
  }
}
