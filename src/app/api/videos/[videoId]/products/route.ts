import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/videos/[videoId]/products - Get all products for a video
export async function GET(
  request: Request,
  { params }: { params: Promise<{ videoId: string }> }
) {
  try {
    const { videoId } = await params;
    const supabase = await createClient();

    const { data: videoProducts, error } = await supabase
      .from('video_products')
      .select('*, product:products(*)')
      .eq('video_id', videoId)
      .order('start_time_seconds', { ascending: true })
      .order('display_order', { ascending: true });

    if (error) {
      throw error;
    }

    return NextResponse.json({ videoProducts });
  } catch (error) {
    console.error('Get video products error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch video products' },
      { status: 500 }
    );
  }
}

// POST /api/videos/[videoId]/products - Add a product to a video
export async function POST(
  request: Request,
  { params }: { params: Promise<{ videoId: string }> }
) {
  try {
    const { videoId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      productId,
      startTimeSeconds = 0,
      endTimeSeconds = null,
      displayOrder = 0,
    } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { error: 'Missing productId' },
        { status: 400 }
      );
    }

    const { data: videoProduct, error } = await supabase
      .from('video_products')
      .insert({
        video_id: videoId,
        product_id: productId,
        start_time_seconds: startTimeSeconds,
        end_time_seconds: endTimeSeconds,
        display_order: displayOrder,
      })
      .select('*, product:products(*)')
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Product already added to this video' },
          { status: 409 }
        );
      }
      throw error;
    }

    return NextResponse.json({ videoProduct });
  } catch (error) {
    console.error('Add video product error:', error);
    return NextResponse.json(
      { error: 'Failed to add product to video' },
      { status: 500 }
    );
  }
}
