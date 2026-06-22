import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/shows/[showId]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ showId: string }> }
) {
  try {
    const { showId } = await params;
    const supabase = await createClient();

    const { data: show, error } = await supabase
      .from('shows')
      .select('*')
      .eq('id', showId)
      .single();

    if (error || !show) {
      return NextResponse.json({ error: 'Show not found' }, { status: 404 });
    }

    return NextResponse.json({ show });
  } catch (error) {
    console.error('Get show error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch show' },
      { status: 500 }
    );
  }
}

// PATCH /api/shows/[showId] - Update show
export async function PATCH(
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

    const updates = await request.json();

    // Track when show starts and ends
    if (updates.status === 'live') {
      updates.started_at = new Date().toISOString();
    } else if (updates.status === 'ended') {
      updates.ended_at = new Date().toISOString();
    }

    const { data: show, error } = await supabase
      .from('shows')
      .update(updates)
      .eq('id', showId)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update show' },
        { status: 500 }
      );
    }

    return NextResponse.json({ show });
  } catch (error) {
    console.error('Update show error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
