import { NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

// GET /api/shows/[showId]/bidders/[bidderId] - Get a specific bidder
export async function GET(
  request: Request,
  { params }: { params: Promise<{ showId: string; bidderId: string }> }
) {
  try {
    const { showId, bidderId } = await params;
    const serviceClient = createServiceClient();

    const { data: bidder, error } = await serviceClient
      .from('bidders')
      .select('*')
      .eq('id', bidderId)
      .eq('show_id', showId)
      .single();

    if (error || !bidder) {
      return NextResponse.json({ error: 'Bidder not found' }, { status: 404 });
    }

    return NextResponse.json({ bidder });
  } catch (error) {
    console.error('Get bidder error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bidder' },
      { status: 500 }
    );
  }
}

// PATCH /api/shows/[showId]/bidders/[bidderId] - Update bidder (approve/reject)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ showId: string; bidderId: string }> }
) {
  try {
    const { showId, bidderId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { approved } = body;

    if (typeof approved !== 'boolean') {
      return NextResponse.json(
        { error: 'approved field is required' },
        { status: 400 }
      );
    }

    const serviceClient = createServiceClient();

    const { data: bidder, error } = await serviceClient
      .from('bidders')
      .update({ approved })
      .eq('id', bidderId)
      .eq('show_id', showId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ bidder });
  } catch (error) {
    console.error('Update bidder error:', error);
    return NextResponse.json(
      { error: 'Failed to update bidder' },
      { status: 500 }
    );
  }
}
