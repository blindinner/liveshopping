import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getVideoDetails, getThumbnailUrl } from '@/lib/cloudflare/client';

// GET /api/videos/[videoId]/status - Check video processing status
export async function GET(
  request: Request,
  { params }: { params: Promise<{ videoId: string }> }
) {
  try {
    const { videoId } = await params;
    const supabase = await createClient();

    // Get video from database
    const { data: video, error } = await supabase
      .from('videos')
      .select('*')
      .eq('id', videoId)
      .single();

    if (error || !video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    // If already ready or error, return current status
    if (video.status === 'ready' || video.status === 'error') {
      return NextResponse.json({ video });
    }

    // Check Cloudflare for current status
    if (video.cloudflare_stream_id) {
      try {
        const cfStatus = await getVideoDetails(video.cloudflare_stream_id);

        // Map Cloudflare status to our status
        let newStatus = video.status;
        const updates: Record<string, unknown> = {};

        if (cfStatus.status === 'ready') {
          newStatus = 'ready';
          updates.status = 'ready';
          updates.cloudflare_playback_id = cfStatus.playbackId;
          updates.thumbnail_url = getThumbnailUrl(video.cloudflare_stream_id);
          updates.duration_seconds = cfStatus.durationSeconds;
        } else if (cfStatus.status === 'error') {
          newStatus = 'error';
          updates.status = 'error';
        }

        // Update database if status changed
        if (Object.keys(updates).length > 0) {
          const { data: updatedVideo } = await supabase
            .from('videos')
            .update(updates)
            .eq('id', videoId)
            .select('*')
            .single();

          return NextResponse.json({ video: updatedVideo || { ...video, ...updates } });
        }

        return NextResponse.json({
          video,
          cloudflareStatus: cfStatus.status
        });
      } catch (cfError) {
        console.error('Cloudflare status check failed:', cfError);
        return NextResponse.json({ video });
      }
    }

    return NextResponse.json({ video });
  } catch (error) {
    console.error('Video status error:', error);
    return NextResponse.json(
      { error: 'Failed to check video status' },
      { status: 500 }
    );
  }
}
