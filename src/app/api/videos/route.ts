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

    return NextResponse.json({ videos });
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
      cloudflareStreamId
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
