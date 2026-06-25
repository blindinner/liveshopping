import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

// POST /api/shows/[showId]/polls/[pollId]/vote - Submit a vote
export async function POST(
  request: Request,
  { params }: { params: Promise<{ showId: string; pollId: string }> }
) {
  try {
    const { showId, pollId } = await params;
    const body = await request.json();
    const { option_id, viewer_id } = body;

    if (!option_id || !viewer_id) {
      return NextResponse.json(
        { error: 'option_id and viewer_id are required' },
        { status: 400 }
      );
    }

    const serviceClient = createServiceClient();

    // Verify poll is active
    const { data: poll, error: pollError } = await serviceClient
      .from('polls')
      .select('status')
      .eq('id', pollId)
      .single();

    if (pollError || !poll) {
      return NextResponse.json(
        { error: 'Poll not found' },
        { status: 404 }
      );
    }

    if (poll.status !== 'active') {
      return NextResponse.json(
        { error: 'Poll is not active' },
        { status: 400 }
      );
    }

    // Verify option belongs to poll
    const { data: option, error: optionError } = await serviceClient
      .from('poll_options')
      .select('id')
      .eq('id', option_id)
      .eq('poll_id', pollId)
      .single();

    if (optionError || !option) {
      return NextResponse.json(
        { error: 'Invalid option' },
        { status: 400 }
      );
    }

    // Upsert vote (allows changing vote)
    const { error: voteError } = await serviceClient
      .from('poll_votes')
      .upsert(
        {
          poll_id: pollId,
          option_id,
          viewer_id,
        },
        {
          onConflict: 'poll_id,viewer_id',
        }
      );

    if (voteError) {
      throw voteError;
    }

    // Track engagement event
    await serviceClient
      .from('engagement_events')
      .insert({
        show_id: showId,
        viewer_id,
        event_type: 'poll_vote',
        metadata: { poll_id: pollId, option_id },
      });

    // Get updated vote counts
    const { data: options } = await serviceClient
      .from('poll_options')
      .select('id')
      .eq('poll_id', pollId);

    const voteCounts: Record<string, number> = {};
    let totalVotes = 0;

    for (const opt of options || []) {
      const { count } = await serviceClient
        .from('poll_votes')
        .select('*', { count: 'exact', head: true })
        .eq('option_id', opt.id);
      voteCounts[opt.id] = count || 0;
      totalVotes += voteCounts[opt.id];
    }

    return NextResponse.json({
      success: true,
      vote_counts: voteCounts,
      total_votes: totalVotes,
    });
  } catch (error) {
    console.error('Vote error:', error);
    return NextResponse.json(
      { error: 'Failed to submit vote' },
      { status: 500 }
    );
  }
}
