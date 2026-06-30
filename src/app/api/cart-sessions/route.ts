import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// POST /api/cart-sessions - Create or update a cart session for attribution
// Supports both live shows (showId) and shoppable videos (videoId)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      showId,
      videoId,
      brandId,
      viewerId,
      platformCartId,
      platform = 'shopify',
      checkoutUrl,
    }: {
      showId?: string;
      videoId?: string;
      brandId?: string;
      viewerId: string;
      platformCartId: string;
      platform?: string;
      checkoutUrl?: string;
    } = body;

    // Validate required fields - need either showId or videoId
    if ((!showId && !videoId) || !viewerId || !platformCartId) {
      return NextResponse.json(
        { error: 'showId or videoId, viewerId, and platformCartId are required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get brand_id from show or video if not provided
    let resolvedBrandId = brandId;
    if (!resolvedBrandId) {
      if (showId) {
        const { data: show } = await supabase
          .from('shows')
          .select('brand_id')
          .eq('id', showId)
          .single();

        if (show) {
          resolvedBrandId = show.brand_id;
        }
      } else if (videoId) {
        const { data: video } = await supabase
          .from('videos')
          .select('brand_id')
          .eq('id', videoId)
          .single();

        if (video) {
          resolvedBrandId = video.brand_id;
        }
      }
    }

    if (!resolvedBrandId) {
      return NextResponse.json(
        { error: 'Could not determine brand' },
        { status: 400 }
      );
    }

    // Upsert the cart session (update if exists, insert if not)
    const { data: cartSession, error } = await supabase
      .from('cart_sessions')
      .upsert(
        {
          show_id: showId || null,
          video_id: videoId || null,
          brand_id: resolvedBrandId,
          viewer_id: viewerId,
          platform_cart_id: platformCartId,
          platform,
          checkout_url: checkoutUrl,
        },
        {
          onConflict: 'platform_cart_id,platform',
          ignoreDuplicates: false,
        }
      )
      .select()
      .single();

    if (error) {
      console.error('Failed to create cart session:', error);
      return NextResponse.json(
        { error: 'Failed to create cart session' },
        { status: 500 }
      );
    }

    return NextResponse.json({ cartSession });
  } catch (error) {
    console.error('Cart sessions API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/cart-sessions?showId=xxx or ?videoId=xxx - Get cart sessions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const showId = searchParams.get('showId');
    const videoId = searchParams.get('videoId');

    if (!showId && !videoId) {
      return NextResponse.json(
        { error: 'showId or videoId query parameter is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    let query = supabase
      .from('cart_sessions')
      .select('*')
      .order('created_at', { ascending: false });

    if (showId) {
      query = query.eq('show_id', showId);
    } else if (videoId) {
      query = query.eq('video_id', videoId);
    }

    const { data: cartSessions, error } = await query;

    if (error) {
      console.error('Failed to fetch cart sessions:', error);
      return NextResponse.json(
        { error: 'Failed to fetch cart sessions' },
        { status: 500 }
      );
    }

    // Calculate summary stats
    const totalSessions = cartSessions.length;
    const convertedSessions = cartSessions.filter((s) => s.converted).length;
    const totalRevenue = cartSessions.reduce(
      (sum, s) => sum + (s.order_total || 0),
      0
    );

    return NextResponse.json({
      cartSessions,
      summary: {
        totalSessions,
        convertedSessions,
        conversionRate: totalSessions > 0
          ? ((convertedSessions / totalSessions) * 100).toFixed(1)
          : '0',
        totalRevenue,
      },
    });
  } catch (error) {
    console.error('Cart sessions API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
