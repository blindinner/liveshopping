import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

// CORS headers for widget embeds
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// OPTIONS handler for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, { headers: corsHeaders });
}

// Event types for video analytics
type VideoEventType = 'video_view' | 'product_click' | 'add_to_cart' | 'checkout_click' | 'order_completed';

// POST /api/videos/[videoId]/events - Record a viewer event for a video
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
) {
  try {
    const { videoId } = await params;
    const body = await request.json();

    const {
      eventType,
      viewerId,
      productId,
      metadata = {},
    }: {
      eventType: VideoEventType;
      viewerId: string;
      productId?: string;
      metadata?: Record<string, unknown>;
    } = body;

    // Validate required fields
    if (!eventType || !viewerId) {
      return NextResponse.json(
        { error: 'eventType and viewerId are required' },
        { status: 400, headers: corsHeaders }
      );
    }

    const supabase = createServiceClient();

    // Map checkout_click to checkout_start for storage
    const storedEventType = eventType === 'checkout_click' ? 'checkout_start' : eventType;

    const { data: event, error } = await supabase
      .from('video_events')
      .insert({
        video_id: videoId,
        viewer_id: viewerId,
        event_type: storedEventType,
        product_id: productId || null,
        unit_price: typeof metadata?.price === 'number' ? metadata.price : null,
        quantity: typeof metadata?.quantity === 'number' ? metadata.quantity : 1,
        currency: typeof metadata?.currency === 'string' ? metadata.currency : null,
        metadata,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to insert video event:', {
        error,
        eventType,
        videoId,
        viewerId,
        productId,
      });
      return NextResponse.json(
        { error: 'Failed to record event', details: error.message, code: error.code },
        { status: 500, headers: corsHeaders }
      );
    }

    return NextResponse.json({ event }, { headers: corsHeaders });
  } catch (error) {
    console.error('Video events API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// GET /api/videos/[videoId]/events - Get event counts for video analytics
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
) {
  try {
    const { videoId } = await params;
    const supabase = createServiceClient();

    const { data: events, error } = await supabase
      .from('video_events')
      .select('event_type, viewer_id, unit_price, quantity, metadata')
      .eq('video_id', videoId);

    if (error) {
      console.error('Failed to fetch video events:', error);
      return NextResponse.json(
        { error: 'Failed to fetch events' },
        { status: 500, headers: corsHeaders }
      );
    }

    // Aggregate counts
    const counts: Record<string, number> = {};
    const uniqueViewers = new Set<string>();
    let totalRevenue = 0;

    for (const event of events || []) {
      // Map checkout_start back to checkout_click for consistency
      const eventType = event.event_type === 'checkout_start' ? 'checkout_click' : event.event_type;
      counts[eventType] = (counts[eventType] || 0) + 1;

      if (event.event_type === 'add_to_cart') {
        uniqueViewers.add(event.viewer_id);
      }

      if (event.event_type === 'order_completed') {
        const orderTotal = (event.metadata as Record<string, unknown>)?.order_total;
        if (typeof orderTotal === 'number') {
          totalRevenue += orderTotal;
        }
      }
    }

    return NextResponse.json({
      counts,
      uniqueViewers: uniqueViewers.size,
      totalRevenue,
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('Video events API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}
