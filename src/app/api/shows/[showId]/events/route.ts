import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { ShowEventType } from '@/types/database';

// Event types that go to engagement_events table
const ENGAGEMENT_EVENTS: ShowEventType[] = [
  'viewer_join',
  'viewer_leave',
  'product_view',
  'reaction',
  'chat_message',
];

// Event types that go to cart_events table
const CART_EVENTS: ShowEventType[] = [
  'add_to_cart',
  'checkout_click',
  'order_completed',
];

// POST /api/shows/[showId]/events - Record a viewer event
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ showId: string }> }
) {
  try {
    const { showId } = await params;
    const body = await request.json();

    const {
      eventType,
      viewerId,
      productId,
      metadata = {},
    }: {
      eventType: ShowEventType;
      viewerId: string;
      productId?: string;
      metadata?: Record<string, unknown>;
    } = body;

    // Validate required fields
    if (!eventType || !viewerId) {
      return NextResponse.json(
        { error: 'eventType and viewerId are required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    let event;
    let error;

    // Route to the appropriate table based on event type
    if (ENGAGEMENT_EVENTS.includes(eventType)) {
      const result = await supabase
        .from('engagement_events')
        .insert({
          show_id: showId,
          viewer_id: viewerId,
          event_type: eventType,
          metadata,
        })
        .select()
        .single();
      event = result.data;
      error = result.error;
    } else if (CART_EVENTS.includes(eventType)) {
      // Map checkout_click to checkout_start for cart_events table
      const cartEventType = eventType === 'checkout_click' ? 'checkout_start' : eventType;

      const result = await supabase
        .from('cart_events')
        .insert({
          show_id: showId,
          viewer_id: viewerId,
          event_type: cartEventType,
          product_id: productId || null,
          unit_price: typeof metadata?.price === 'number' ? metadata.price : null,
          quantity: typeof metadata?.quantity === 'number' ? metadata.quantity : 1,
          currency: typeof metadata?.currency === 'string' ? metadata.currency : null,
          metadata,
        })
        .select()
        .single();
      event = result.data;
      error = result.error;
    } else {
      return NextResponse.json(
        { error: `Invalid event type: ${eventType}` },
        { status: 400 }
      );
    }

    if (error) {
      console.error('Failed to insert event:', {
        error,
        eventType,
        showId,
        viewerId,
        productId,
      });
      return NextResponse.json(
        { error: 'Failed to record event', details: error.message, code: error.code },
        { status: 500 }
      );
    }

    return NextResponse.json({ event });
  } catch (error) {
    console.error('Events API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/shows/[showId]/events - Get event counts for analytics
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ showId: string }> }
) {
  try {
    const { showId } = await params;
    const supabase = await createClient();

    // Get engagement events
    const { data: engagementEvents, error: engagementError } = await supabase
      .from('engagement_events')
      .select('event_type, viewer_id')
      .eq('show_id', showId);

    // Get cart events
    const { data: cartEvents, error: cartError } = await supabase
      .from('cart_events')
      .select('event_type, viewer_id, unit_price, quantity, metadata')
      .eq('show_id', showId);

    if (engagementError || cartError) {
      console.error('Failed to fetch events:', engagementError || cartError);
      return NextResponse.json(
        { error: 'Failed to fetch events' },
        { status: 500 }
      );
    }

    // Aggregate counts from both tables
    const counts: Record<string, number> = {};

    for (const event of engagementEvents || []) {
      counts[event.event_type] = (counts[event.event_type] || 0) + 1;
    }

    for (const event of cartEvents || []) {
      // Map checkout_start back to checkout_click for consistency
      const eventType = event.event_type === 'checkout_start' ? 'checkout_click' : event.event_type;
      counts[eventType] = (counts[eventType] || 0) + 1;
    }

    // Get unique viewer count from engagement events
    const uniqueViewers = new Set(
      (engagementEvents || [])
        .filter((e) => e.event_type === 'viewer_join')
        .map((e) => e.viewer_id)
    ).size;

    // Get revenue from checkout_complete events
    const totalRevenue = (cartEvents || [])
      .filter((e) => e.event_type === 'checkout_complete')
      .reduce((sum, event) => {
        const orderTotal = (event.metadata as Record<string, unknown>)?.order_total;
        return sum + (typeof orderTotal === 'number' ? orderTotal : 0);
      }, 0);

    return NextResponse.json({
      counts,
      uniqueViewers,
      totalRevenue,
    });
  } catch (error) {
    console.error('Events API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
