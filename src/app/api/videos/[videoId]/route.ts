import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { deleteVideo } from '@/lib/cloudflare/client';

// GET /api/videos/[videoId]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ videoId: string }> }
) {
  try {
    const { videoId } = await params;
    const supabase = await createClient();

    const { data: video, error } = await supabase
      .from('videos')
      .select('*, product:products(*)')
      .eq('id', videoId)
      .single();

    if (error || !video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    return NextResponse.json({ video });
  } catch (error) {
    console.error('Get video error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch video' },
      { status: 500 }
    );
  }
}

// PATCH /api/videos/[videoId] - Update video
export async function PATCH(
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

    const updates = await request.json();

    // Only allow specific fields to be updated
    const allowedFields = ['title', 'description', 'product_id', 'status', 'thumbnail_url', 'duration_seconds', 'cloudflare_playback_id', 'is_published', 'cover_image_url'];
    const sanitizedUpdates: Record<string, unknown> = {};

    for (const key of allowedFields) {
      if (key in updates) {
        sanitizedUpdates[key] = updates[key];
      }
    }

    const { data: video, error } = await supabase
      .from('videos')
      .update(sanitizedUpdates)
      .eq('id', videoId)
      .select('*, product:products(*)')
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update video' },
        { status: 500 }
      );
    }

    return NextResponse.json({ video });
  } catch (error) {
    console.error('Update video error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/videos/[videoId]
export async function DELETE(
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

    // Get video to find Cloudflare stream ID
    const { data: video } = await supabase
      .from('videos')
      .select('cloudflare_stream_id')
      .eq('id', videoId)
      .single();

    // Delete from database
    const { error } = await supabase
      .from('videos')
      .delete()
      .eq('id', videoId);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete video' },
        { status: 500 }
      );
    }

    // Delete from Cloudflare (fire and forget)
    if (video?.cloudflare_stream_id) {
      deleteVideo(video.cloudflare_stream_id).catch(console.error);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete video error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
