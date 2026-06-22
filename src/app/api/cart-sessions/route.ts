import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// POST /api/cart-sessions - Create or update a cart session for attribution
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      showId,
      brandId,
      viewerId,
      platformCartId,
      platform = 'shopify',
      checkoutUrl,
    }: {
      showId: string;
      brandId?: string;
      viewerId: string;
      platformCartId: string;
      platform?: string;
      checkoutUrl?: string;
    } = body;

    // Validate required fields
    if (!showId || !viewerId || !platformCartId) {
      return NextResponse.json(
        { error: 'showId, viewerId, and platformCartId are required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get brand_id from show if not provided
    let resolvedBrandId = brandId;
    if (!resolvedBrandId) {
      const { data: show } = await supabase
        .from('shows')
        .select('brand_id')
        .eq('id', showId)
        .single();

      if (show) {
        resolvedBrandId = show.brand_id;
      }
    }

    if (!resolvedBrandId) {
      return NextResponse.json(
        { error: 'Could not determine brand for show' },
        { status: 400 }
      );
    }

    // Upsert the cart session (update if exists, insert if not)
    const { data: cartSession, error } = await supabase
      .from('cart_sessions')
      .upsert(
        {
          show_id: showId,
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

// GET /api/cart-sessions?showId=xxx - Get cart sessions for a show
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const showId = searchParams.get('showId');

    if (!showId) {
      return NextResponse.json(
        { error: 'showId query parameter is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data: cartSessions, error } = await supabase
      .from('cart_sessions')
      .select('*')
      .eq('show_id', showId)
      .order('created_at', { ascending: false });

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
