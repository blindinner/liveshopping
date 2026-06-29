import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// PATCH /api/videos/[videoId]/products/[productId] - Update a video product
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ videoId: string; productId: string }> }
) {
  try {
    const { videoId, productId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const updates = await request.json();

    // Only allow specific fields to be updated
    const allowedFields = ['start_time_seconds', 'end_time_seconds', 'display_order'];
    const sanitizedUpdates: Record<string, unknown> = {};

    for (const key of allowedFields) {
      if (key in updates) {
        sanitizedUpdates[key] = updates[key];
      }
    }

    const { data: videoProduct, error } = await supabase
      .from('video_products')
      .update(sanitizedUpdates)
      .eq('video_id', videoId)
      .eq('product_id', productId)
      .select('*, product:products(*)')
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update video product' },
        { status: 500 }
      );
    }

    return NextResponse.json({ videoProduct });
  } catch (error) {
    console.error('Update video product error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/videos/[videoId]/products/[productId] - Remove a product from video
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ videoId: string; productId: string }> }
) {
  try {
    const { videoId, productId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { error } = await supabase
      .from('video_products')
      .delete()
      .eq('video_id', videoId)
      .eq('product_id', productId);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to remove product from video' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete video product error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
