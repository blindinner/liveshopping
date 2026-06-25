import { NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

// GET /api/shows/[showId]/polls/[pollId] - Get a single poll with results
export async function GET(
  request: Request,
  { params }: { params: Promise<{ showId: string; pollId: string }> }
) {
  try {
    const { pollId } = await params;
    const { searchParams } = new URL(request.url);
    const viewerId = searchParams.get('viewerId');

    const supabase = await createClient();

    // Get poll with options
    const { data: poll, error } = await supabase
      .from('polls')
      .select(`
        *,
        options:poll_options(*)
      `)
      .eq('id', pollId)
      .single();

    if (error) {
      throw error;
    }

    // Get vote counts for each option
    const serviceClient = createServiceClient();
    let totalVotes = 0;

    if (poll.options) {
      for (const option of poll.options) {
        const { count } = await serviceClient
          .from('poll_votes')
          .select('*', { count: 'exact', head: true })
          .eq('option_id', option.id);
        option.vote_count = count || 0;
        totalVotes += option.vote_count;
      }
      // Sort options by display_order
      poll.options.sort((a: { display_order: number }, b: { display_order: number }) =>
        a.display_order - b.display_order
      );
    }

    // Check if viewer has voted
    let viewerVote = null;
    if (viewerId) {
      const { data: vote } = await serviceClient
        .from('poll_votes')
        .select('option_id')
        .eq('poll_id', pollId)
        .eq('viewer_id', viewerId)
        .single();
      viewerVote = vote?.option_id || null;
    }

    return NextResponse.json({
      poll: {
        ...poll,
        total_votes: totalVotes,
        viewer_vote: viewerVote,
      },
    });
  } catch (error) {
    console.error('Get poll error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch poll' },
      { status: 500 }
    );
  }
}

// PATCH /api/shows/[showId]/polls/[pollId] - Update poll (status, etc.)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ showId: string; pollId: string }> }
) {
  try {
    const { showId, pollId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { status, question, show_results_live } = body;

    const serviceClient = createServiceClient();
    const updateData: Record<string, unknown> = {};

    if (status !== undefined) {
      updateData.status = status;

      // Set timestamps based on status change
      if (status === 'active') {
        updateData.started_at = new Date().toISOString();

        // End any other active poll for this show
        await serviceClient
          .from('polls')
          .update({ status: 'ended', ended_at: new Date().toISOString() })
          .eq('show_id', showId)
          .eq('status', 'active')
          .neq('id', pollId);
      } else if (status === 'ended') {
        updateData.ended_at = new Date().toISOString();
      }
    }

    if (question !== undefined) {
      updateData.question = question;
    }

    if (show_results_live !== undefined) {
      updateData.show_results_live = show_results_live;
    }

    const { data: poll, error } = await serviceClient
      .from('polls')
      .update(updateData)
      .eq('id', pollId)
      .select(`
        *,
        options:poll_options(*)
      `)
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ poll });
  } catch (error) {
    console.error('Update poll error:', error);
    return NextResponse.json(
      { error: 'Failed to update poll' },
      { status: 500 }
    );
  }
}

// DELETE /api/shows/[showId]/polls/[pollId] - Delete a poll
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ showId: string; pollId: string }> }
) {
  try {
    const { pollId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const serviceClient = createServiceClient();

    const { error } = await serviceClient
      .from('polls')
      .delete()
      .eq('id', pollId);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete poll error:', error);
    return NextResponse.json(
      { error: 'Failed to delete poll' },
      { status: 500 }
    );
  }
}
