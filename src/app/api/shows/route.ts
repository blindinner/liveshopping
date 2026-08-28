import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createLiveInput } from '@/lib/cloudflare/client';

// GET /api/shows - List shows with analytics
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

    // Fetch analytics for all shows
    const showIds = shows?.map(s => s.id) || [];

    let analyticsMap: Record<string, {
      viewers: number;
      peakViewers: number;
      chatMessages: number;
      reactions: number;
      addToCarts: number;
      orders: number;
      revenue: number;
    }> = {};

    if (showIds.length > 0) {
      // Get engagement events
      const { data: engagementEvents } = await supabase
        .from('engagement_events')
        .select('show_id, event_type, viewer_id')
        .in('show_id', showIds);

      // Get cart events
      const { data: cartEvents } = await supabase
        .from('cart_events')
        .select('show_id, event_type, viewer_id, metadata')
        .in('show_id', showIds);

      // Aggregate analytics per show
      for (const showId of showIds) {
        const showEngagement = (engagementEvents || []).filter(e => e.show_id === showId);
        const showCart = (cartEvents || []).filter(e => e.show_id === showId);

        const viewerJoins = showEngagement.filter(e => e.event_type === 'viewer_join');
        const uniqueViewers = new Set(viewerJoins.map(e => e.viewer_id)).size;
        const chatMessages = showEngagement.filter(e => e.event_type === 'chat_message').length;
        const reactions = showEngagement.filter(e => e.event_type === 'reaction').length;
        const addToCarts = showCart.filter(e => e.event_type === 'add_to_cart').length;
        const orders = showCart.filter(e => e.event_type === 'order_completed').length;
        const revenue = showCart
          .filter(e => e.event_type === 'order_completed')
          .reduce((sum, e) => {
            const orderTotal = (e.metadata as Record<string, unknown>)?.order_total;
            return sum + (typeof orderTotal === 'number' ? orderTotal : 0);
          }, 0);

        analyticsMap[showId] = {
          viewers: uniqueViewers,
          peakViewers: uniqueViewers, // TODO: Track peak separately
          chatMessages,
          reactions,
          addToCarts,
          orders,
          revenue,
        };
      }
    }

    // Attach analytics to each show
    const showsWithAnalytics = shows?.map(show => ({
      ...show,
      analytics: analyticsMap[show.id] || {
        viewers: 0,
        peakViewers: 0,
        chatMessages: 0,
        reactions: 0,
        addToCarts: 0,
        orders: 0,
        revenue: 0,
      },
    }));

    return NextResponse.json({ shows: showsWithAnalytics });
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

    const { title, scheduledAt, brandId, auctionType, embedUrl } = await request.json();

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
        auction_type: auctionType || 'public',
        embed_url: embedUrl || null,
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
