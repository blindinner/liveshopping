import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getThumbnailUrl } from '@/lib/cloudflare/client';

// Cloudflare Stream webhook payload
interface CloudflareWebhookPayload {
  uid: string;
  readyToStream: boolean;
  status: {
    state: 'pendingupload' | 'downloading' | 'queued' | 'inprogress' | 'ready' | 'error';
    errorReasonCode?: string;
    errorReasonText?: string;
  };
  duration?: number;
  thumbnail?: string;
  meta?: {
    name?: string;
  };
}

// POST /api/webhooks/cloudflare - Handle Cloudflare Stream webhooks
export async function POST(request: Request) {
  try {
    // Cloudflare sends webhook signing secret in header (if configured)
    const signature = request.headers.get('webhook-signature');
    const webhookSecret = process.env.CLOUDFLARE_WEBHOOK_SECRET;

    // Verify webhook signature if secret is configured
    if (webhookSecret && signature !== webhookSecret) {
      console.warn('Invalid Cloudflare webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const payload: CloudflareWebhookPayload = await request.json();
    const { uid, status, duration } = payload;

    console.log('Cloudflare webhook received:', { uid, state: status.state });

    const supabase = await createClient();

    // Find video by cloudflare_stream_id
    const { data: video } = await supabase
      .from('videos')
      .select('id')
      .eq('cloudflare_stream_id', uid)
      .single();

    if (!video) {
      // Video not found - might be a live stream, not a shoppable video
      console.log('No video found for Cloudflare stream:', uid);
      return NextResponse.json({ received: true });
    }

    // Map Cloudflare status to our status
    let videoStatus: 'processing' | 'ready' | 'error' = 'processing';
    if (status.state === 'ready') {
      videoStatus = 'ready';
    } else if (status.state === 'error') {
      videoStatus = 'error';
    }

    // Update video with processing result
    const updates: Record<string, unknown> = {
      status: videoStatus,
    };

    if (duration) {
      updates.duration_seconds = Math.round(duration);
    }

    // Set thumbnail URL when video is ready
    if (videoStatus === 'ready') {
      updates.thumbnail_url = getThumbnailUrl(uid, { time: '1s', width: 640 });
    }

    const { error } = await supabase
      .from('videos')
      .update(updates)
      .eq('id', video.id);

    if (error) {
      console.error('Failed to update video status:', error);
      return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }

    console.log('Video status updated:', { videoId: video.id, status: videoStatus });

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Cloudflare webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
