import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/brands/[brandId]/videos - Get published videos for a brand
export async function GET(
  request: Request,
  { params }: { params: Promise<{ brandId: string }> }
) {
  try {
    const { brandId } = await params;
    const { searchParams } = new URL(request.url);
    const publishedOnly = searchParams.get('published') !== 'false';

    const supabase = await createClient();

    let query = supabase
      .from('videos')
      .select(`
        *,
        product:products(*),
        products:video_products(
          *,
          product:products(*)
        )
      `)
      .eq('brand_id', brandId)
      .eq('status', 'ready')
      .order('created_at', { ascending: false });

    if (publishedOnly) {
      query = query.eq('is_published', true);
    }

    const { data: videos, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({ videos });
  } catch (error) {
    console.error('Get brand videos error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch videos' },
      { status: 500 }
    );
  }
}
