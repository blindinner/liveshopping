import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/brands/[brandId]/live-status - Check if brand has a live show
export async function GET(
  request: Request,
  { params }: { params: Promise<{ brandId: string }> }
) {
  try {
    const { brandId } = await params;
    const supabase = await createClient();

    // Check for a live show
    const { data: liveShow } = await supabase
      .from('shows')
      .select('id, title, status, cloudflare_playback_id')
      .eq('brand_id', brandId)
      .eq('status', 'live')
      .limit(1)
      .single();

    if (liveShow) {
      return NextResponse.json({
        isLive: true,
        show: {
          id: liveShow.id,
          title: liveShow.title,
        },
      }, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      });
    }

    // Check for next scheduled show
    const { data: scheduledShow } = await supabase
      .from('shows')
      .select('id, title, scheduled_at')
      .eq('brand_id', brandId)
      .eq('status', 'scheduled')
      .gte('scheduled_at', new Date().toISOString())
      .order('scheduled_at', { ascending: true })
      .limit(1)
      .single();

    return NextResponse.json({
      isLive: false,
      nextShow: scheduledShow ? {
        id: scheduledShow.id,
        title: scheduledShow.title,
        scheduledAt: scheduledShow.scheduled_at,
      } : null,
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Live status check error:', error);
    return NextResponse.json(
      { isLive: false, error: 'Failed to check status' },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}

// Handle CORS preflight
export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
