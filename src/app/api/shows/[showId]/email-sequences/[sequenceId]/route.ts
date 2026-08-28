import { NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

// GET /api/shows/[showId]/email-sequences/[sequenceId] - Get a single sequence
export async function GET(
  request: Request,
  { params }: { params: Promise<{ showId: string; sequenceId: string }> }
) {
  try {
    const { showId, sequenceId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const serviceClient = createServiceClient();

    const { data: sequence, error } = await serviceClient
      .from('show_email_sequences')
      .select('*')
      .eq('id', sequenceId)
      .eq('show_id', showId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Sequence not found' }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json({ sequence });
  } catch (error) {
    console.error('Get email sequence error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch email sequence' },
      { status: 500 }
    );
  }
}

// PATCH /api/shows/[showId]/email-sequences/[sequenceId] - Update a sequence
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ showId: string; sequenceId: string }> }
) {
  try {
    const { showId, sequenceId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, subject, body_html, body_text, send_offset_minutes, enabled } = body;

    const serviceClient = createServiceClient();

    // Get current sequence
    const { data: currentSequence } = await serviceClient
      .from('show_email_sequences')
      .select('*')
      .eq('id', sequenceId)
      .eq('show_id', showId)
      .single();

    if (!currentSequence) {
      return NextResponse.json({ error: 'Sequence not found' }, { status: 404 });
    }

    // Build update object
    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = name;
    if (subject !== undefined) updates.subject = subject;
    if (body_html !== undefined) updates.body_html = body_html;
    if (body_text !== undefined) updates.body_text = body_text;
    if (send_offset_minutes !== undefined) updates.send_offset_minutes = send_offset_minutes;
    if (enabled !== undefined) updates.enabled = enabled;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    // Update the sequence
    const { data: sequence, error } = await serviceClient
      .from('show_email_sequences')
      .update(updates)
      .eq('id', sequenceId)
      .eq('show_id', showId)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'A sequence with this timing already exists for this show' },
          { status: 409 }
        );
      }
      throw error;
    }

    // Handle timing changes - reschedule pending emails
    if (send_offset_minutes !== undefined && send_offset_minutes !== currentSequence.send_offset_minutes) {
      await rescheduleEmails(serviceClient, showId, sequenceId, send_offset_minutes);
    }

    // Handle enabled changes
    if (enabled !== undefined && enabled !== currentSequence.enabled) {
      if (enabled === false) {
        // Cancel all pending emails
        await serviceClient
          .from('scheduled_emails')
          .update({ status: 'cancelled' })
          .eq('sequence_id', sequenceId)
          .eq('status', 'pending');
      } else {
        // Re-enable: schedule emails for all invitations
        await scheduleEmailsForSequence(serviceClient, showId, sequenceId, sequence.send_offset_minutes);
      }
    }

    return NextResponse.json({ sequence });
  } catch (error) {
    console.error('Update email sequence error:', error);
    return NextResponse.json(
      { error: 'Failed to update email sequence' },
      { status: 500 }
    );
  }
}

// DELETE /api/shows/[showId]/email-sequences/[sequenceId] - Delete a sequence
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ showId: string; sequenceId: string }> }
) {
  try {
    const { showId, sequenceId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const serviceClient = createServiceClient();

    // Cancel all pending emails first (they'll be deleted via CASCADE, but let's be explicit)
    await serviceClient
      .from('scheduled_emails')
      .update({ status: 'cancelled' })
      .eq('sequence_id', sequenceId)
      .eq('status', 'pending');

    // Delete the sequence
    const { error } = await serviceClient
      .from('show_email_sequences')
      .delete()
      .eq('id', sequenceId)
      .eq('show_id', showId);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete email sequence error:', error);
    return NextResponse.json(
      { error: 'Failed to delete email sequence' },
      { status: 500 }
    );
  }
}

// Helper: Reschedule pending emails for a sequence
async function rescheduleEmails(
  serviceClient: ReturnType<typeof createServiceClient>,
  showId: string,
  sequenceId: string,
  newOffsetMinutes: number
) {
  // Get show scheduled_at
  const { data: show } = await serviceClient
    .from('shows')
    .select('scheduled_at')
    .eq('id', showId)
    .single();

  if (!show) return;

  const newScheduledFor = new Date(show.scheduled_at);
  newScheduledFor.setMinutes(newScheduledFor.getMinutes() + newOffsetMinutes);

  // If new time is in the past, cancel pending emails
  if (newScheduledFor <= new Date()) {
    await serviceClient
      .from('scheduled_emails')
      .update({ status: 'cancelled' })
      .eq('sequence_id', sequenceId)
      .eq('status', 'pending');
  } else {
    // Update scheduled time
    await serviceClient
      .from('scheduled_emails')
      .update({ scheduled_for: newScheduledFor.toISOString() })
      .eq('sequence_id', sequenceId)
      .eq('status', 'pending');
  }
}

// Helper: Schedule emails for a sequence
async function scheduleEmailsForSequence(
  serviceClient: ReturnType<typeof createServiceClient>,
  showId: string,
  sequenceId: string,
  offsetMinutes: number
) {
  // Get show scheduled_at
  const { data: show } = await serviceClient
    .from('shows')
    .select('scheduled_at')
    .eq('id', showId)
    .single();

  if (!show) return;

  // Get all invitations for this show
  const { data: invitations } = await serviceClient
    .from('invitations')
    .select('id')
    .eq('show_id', showId);

  if (!invitations || invitations.length === 0) return;

  const scheduledFor = new Date(show.scheduled_at);
  scheduledFor.setMinutes(scheduledFor.getMinutes() + offsetMinutes);

  // Only schedule if in the future
  if (scheduledFor <= new Date()) return;

  const emailsToSchedule = invitations.map(inv => ({
    show_id: showId,
    invitation_id: inv.id,
    sequence_id: sequenceId,
    scheduled_for: scheduledFor.toISOString(),
    status: 'pending',
  }));

  // Insert, ignoring conflicts
  await serviceClient
    .from('scheduled_emails')
    .upsert(emailsToSchedule, { onConflict: 'invitation_id,sequence_id', ignoreDuplicates: true });
}
