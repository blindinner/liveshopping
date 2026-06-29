import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createDirectUploadUrl } from '@/lib/cloudflare/client';

// POST /api/videos/upload-url - Get a direct upload URL for client-side video upload
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, maxDurationSeconds } = await request.json();

    const { uid, uploadUrl } = await createDirectUploadUrl({
      name: name || 'Shoppable Video',
      maxDurationSeconds: maxDurationSeconds || 3600, // Default 1 hour max
    });

    return NextResponse.json({
      uid,
      uploadUrl,
    });
  } catch (error) {
    console.error('Create upload URL error:', error);
    return NextResponse.json(
      { error: 'Failed to create upload URL' },
      { status: 500 }
    );
  }
}
