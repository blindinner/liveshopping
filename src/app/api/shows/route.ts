import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createLiveInput } from '@/lib/cloudflare/client';

// GET /api/shows - List shows
export async function GET() {
  try {
    const supabase = await createClient();

    const { data: shows, error } = await supabase
      .from('shows')
      .select('*')
      .order('scheduled_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ shows });
  } catch (error) {
    console.error('Get shows error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shows' },
      { status: 500 }
    );
  }
}

// POST /api/shows - Create a new show
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, scheduledAt, brandId } = await request.json();

    if (!title || !scheduledAt || !brandId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create Cloudflare live input
    const cloudflareInput = await createLiveInput(title);

    // Create show in database with Cloudflare stream details
    const { data: show, error } = await supabase
      .from('shows')
      .insert({
        brand_id: brandId,
        title,
        scheduled_at: scheduledAt,
        status: 'scheduled',
        cloudflare_stream_id: cloudflareInput.uid,
        cloudflare_playback_id: cloudflareInput.uid,
        cloudflare_webrtc_url: cloudflareInput.webRtcUrl,
      })
      .select()
      .single();

    if (error) {
      console.error('Create show error:', error);
      return NextResponse.json(
        { error: 'Failed to create show' },
        { status: 500 }
      );
    }

    return NextResponse.json({ show });
  } catch (error) {
    console.error('Create show API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
