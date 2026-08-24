import { NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

// GET /api/shows/[showId]/bidders - Get bidders
// Query params:
//   ?viewer_id=xxx - Get specific bidder by viewer_id (public)
//   No params - Get all bidders (host only, requires auth)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ showId: string }> }
) {
  try {
    const { showId } = await params;
    const { searchParams } = new URL(request.url);
    const viewerId = searchParams.get('viewer_id');

    const serviceClient = createServiceClient();

    // If viewer_id provided, return that specific bidder (public endpoint)
    if (viewerId) {
      const { data: bidder } = await serviceClient
        .from('bidders')
        .select('*')
        .eq('show_id', showId)
        .eq('viewer_id', viewerId)
        .single();

      return NextResponse.json({ bidder: bidder || null });
    }

    // Otherwise, require auth and return all bidders (host only)
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: bidders, error } = await serviceClient
      .from('bidders')
      .select('*')
      .eq('show_id', showId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ bidders });
  } catch (error) {
    console.error('Get bidders error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bidders' },
      { status: 500 }
    );
  }
}

// POST /api/shows/[showId]/bidders - Register as a bidder
export async function POST(
  request: Request,
  { params }: { params: Promise<{ showId: string }> }
) {
  try {
    const { showId } = await params;
    const body = await request.json();
    const { viewer_id, name, email, phone } = body;

    if (!viewer_id || !name || !email) {
      return NextResponse.json(
        { error: 'viewer_id, name, and email are required' },
        { status: 400 }
      );
    }

    const serviceClient = createServiceClient();

    // Check if already registered
    const { data: existing } = await serviceClient
      .from('bidders')
      .select('*')
      .eq('show_id', showId)
      .eq('viewer_id', viewer_id)
      .single();

    if (existing) {
      return NextResponse.json({ bidder: existing });
    }

    // Register new bidder
    const { data: bidder, error } = await serviceClient
      .from('bidders')
      .insert({
        show_id: showId,
        viewer_id,
        name,
        email,
        phone: phone || null,
        approved: true, // Auto-approve by default
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ bidder });
  } catch (error) {
    console.error('Register bidder error:', error);
    return NextResponse.json(
      { error: 'Failed to register bidder' },
      { status: 500 }
    );
  }
}
