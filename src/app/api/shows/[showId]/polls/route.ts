import { NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

// GET /api/shows/[showId]/polls - Get all polls for a show
export async function GET(
  request: Request,
  { params }: { params: Promise<{ showId: string }> }
) {
  try {
    const { showId } = await params;
    const supabase = await createClient();

    // Get polls with their options
    const { data: polls, error } = await supabase
      .from('polls')
      .select(`
        *,
        options:poll_options(*)
      `)
      .eq('show_id', showId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Get vote counts for each option
    const serviceClient = createServiceClient();
    for (const poll of polls || []) {
      if (poll.options) {
        for (const option of poll.options) {
          const { count } = await serviceClient
            .from('poll_votes')
            .select('*', { count: 'exact', head: true })
            .eq('option_id', option.id);
          option.vote_count = count || 0;
        }
        // Sort options by display_order
        poll.options.sort((a: { display_order: number }, b: { display_order: number }) =>
          a.display_order - b.display_order
        );
      }
    }

    return NextResponse.json({ polls });
  } catch (error) {
    console.error('Get polls error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch polls' },
      { status: 500 }
    );
  }
}

// POST /api/shows/[showId]/polls - Create a new poll
export async function POST(
  request: Request,
  { params }: { params: Promise<{ showId: string }> }
) {
  try {
    const { showId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { question, options, show_results_live = true } = body;

    if (!question || !options || options.length < 2) {
      return NextResponse.json(
        { error: 'Question and at least 2 options are required' },
        { status: 400 }
      );
    }

    const serviceClient = createServiceClient();

    // Create poll
    const { data: poll, error: pollError } = await serviceClient
      .from('polls')
      .insert({
        show_id: showId,
        question,
        status: 'draft',
        show_results_live,
      })
      .select()
      .single();

    if (pollError) {
      throw pollError;
    }

    // Create options
    const optionsToInsert = options.map((text: string, index: number) => ({
      poll_id: poll.id,
      option_text: text,
      display_order: index,
    }));

    const { data: pollOptions, error: optionsError } = await serviceClient
      .from('poll_options')
      .insert(optionsToInsert)
      .select();

    if (optionsError) {
      throw optionsError;
    }

    return NextResponse.json({
      poll: {
        ...poll,
        options: pollOptions,
      },
    });
  } catch (error) {
    console.error('Create poll error:', error);
    return NextResponse.json(
      { error: 'Failed to create poll' },
      { status: 500 }
    );
  }
}
