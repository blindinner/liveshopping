import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/videos - List videos for the authenticated user's brand
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const brandId = searchParams.get('brandId');

    let query = supabase
      .from('videos')
      .select('*, product:products(*)')
      .order('created_at', { ascending: false });

    if (brandId) {
      query = query.eq('brand_id', brandId);
    }

    const { data: videos, error } = await query;

    if (error) {
      throw error;
    }

    // Fetch analytics for all videos
    const videoIds = videos?.map(v => v.id) || [];

    let analyticsMap: Record<string, {
      views: number;
      uniqueViewers: number;
      productClicks: number;
      addToCarts: number;
      orders: number;
      revenue: number;
    }> = {};

    if (videoIds.length > 0) {
      const { data: videoEvents } = await supabase
        .from('video_events')
        .select('video_id, event_type, viewer_id, metadata')
        .in('video_id', videoIds);

      // Aggregate analytics per video
      for (const videoId of videoIds) {
        const events = (videoEvents || []).filter(e => e.video_id === videoId);

        const views = events.filter(e => e.event_type === 'video_view').length;
        const uniqueViewers = new Set(
          events.filter(e => e.event_type === 'video_view').map(e => e.viewer_id)
        ).size;
        const productClicks = events.filter(e => e.event_type === 'product_click').length;
        const addToCarts = events.filter(e => e.event_type === 'add_to_cart').length;
        const orders = events.filter(e => e.event_type === 'order_completed').length;
        const revenue = events
          .filter(e => e.event_type === 'order_completed')
          .reduce((sum, e) => {
            const orderTotal = (e.metadata as Record<string, unknown>)?.order_total;
            return sum + (typeof orderTotal === 'number' ? orderTotal : 0);
          }, 0);

        analyticsMap[videoId] = { views, uniqueViewers, productClicks, addToCarts, orders, revenue };
      }
    }

    // Attach analytics to each video
    const videosWithAnalytics = videos?.map(video => ({
      ...video,
      analytics: analyticsMap[video.id] || {
        views: 0,
        uniqueViewers: 0,
        productClicks: 0,
        addToCarts: 0,
        orders: 0,
        revenue: 0,
      },
    }));

    return NextResponse.json({ videos: videosWithAnalytics });
  } catch (error) {
    console.error('Get videos error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch videos' },
      { status: 500 }
    );
  }
}

// POST /api/videos - Create a new video record
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      brandId,
      title,
      description,
      productId,
      cloudflareStreamId,
      isPublished
    } = await request.json();

    if (!brandId || !title || !cloudflareStreamId) {
      return NextResponse.json(
        { error: 'Missing required fields: brandId, title, cloudflareStreamId' },
        { status: 400 }
      );
    }

    const { data: video, error } = await supabase
      .from('videos')
      .insert({
        brand_id: brandId,
        title,
        description: description || null,
        product_id: productId || null,
        cloudflare_stream_id: cloudflareStreamId,
        cloudflare_playback_id: cloudflareStreamId, // Same as stream ID in Cloudflare
        status: 'processing',
        is_published: isPublished || false,
      })
      .select('*, product:products(*)')
      .single();

    if (error) {
      console.error('Create video error:', error);
      return NextResponse.json(
        { error: 'Failed to create video' },
        { status: 500 }
      );
    }

    return NextResponse.json({ video });
  } catch (error) {
    console.error('Create video API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
