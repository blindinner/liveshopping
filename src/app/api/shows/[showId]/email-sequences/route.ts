import { NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { getDefaultEmailSequences } from '@/lib/email/sequences';

// GET /api/shows/[showId]/email-sequences - List all sequences for a show
export async function GET(
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

    const serviceClient = createServiceClient();

    // Get sequences with scheduled email counts
    const { data: sequences, error } = await serviceClient
      .from('show_email_sequences')
      .select('*')
      .eq('show_id', showId)
      .order('display_order', { ascending: true });

    if (error) {
      throw error;
    }

    // Get scheduled email stats per sequence
    const { data: stats } = await serviceClient
      .from('scheduled_emails')
      .select('sequence_id, status')
      .eq('show_id', showId);

    const statsMap = new Map<string, { pending: number; sent: number; failed: number; cancelled: number }>();

    for (const stat of stats || []) {
      if (!statsMap.has(stat.sequence_id)) {
        statsMap.set(stat.sequence_id, { pending: 0, sent: 0, failed: 0, cancelled: 0 });
      }
      const entry = statsMap.get(stat.sequence_id)!;
      entry[stat.status as keyof typeof entry]++;
    }

    // Add stats to sequences
    const sequencesWithStats = sequences?.map(seq => ({
      ...seq,
      stats: statsMap.get(seq.id) || { pending: 0, sent: 0, failed: 0, cancelled: 0 },
    }));

    return NextResponse.json({ sequences: sequencesWithStats });
  } catch (error) {
    console.error('Get email sequences error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch email sequences' },
      { status: 500 }
    );
  }
}

// POST /api/shows/[showId]/email-sequences - Create a new sequence
// Body: { name, subject, body_html, body_text?, send_offset_minutes, enabled? }
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
    const { name, subject, body_html, body_text, send_offset_minutes, enabled = true } = body;

    if (!name || !subject || !body_html || send_offset_minutes === undefined) {
      return NextResponse.json(
        { error: 'name, subject, body_html, and send_offset_minutes are required' },
        { status: 400 }
      );
    }

    const serviceClient = createServiceClient();

    // Get max display_order
    const { data: maxOrder } = await serviceClient
      .from('show_email_sequences')
      .select('display_order')
      .eq('show_id', showId)
      .order('display_order', { ascending: false })
      .limit(1)
      .single();

    const displayOrder = (maxOrder?.display_order ?? -1) + 1;

    // Create the sequence
    const { data: sequence, error } = await serviceClient
      .from('show_email_sequences')
      .insert({
        show_id: showId,
        name,
        subject,
        body_html,
        body_text: body_text || null,
        send_offset_minutes,
        enabled,
        display_order: displayOrder,
      })
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

    // Schedule emails for all existing invitations if enabled
    if (enabled) {
      await scheduleEmailsForSequence(serviceClient, showId, sequence.id, send_offset_minutes);
    }

    return NextResponse.json({ sequence });
  } catch (error) {
    console.error('Create email sequence error:', error);
    return NextResponse.json(
      { error: 'Failed to create email sequence' },
      { status: 500 }
    );
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

  // Insert, ignoring conflicts (in case some already exist)
  await serviceClient
    .from('scheduled_emails')
    .upsert(emailsToSchedule, { onConflict: 'invitation_id,sequence_id', ignoreDuplicates: true });
}

// POST /api/shows/[showId]/email-sequences/defaults - Create default sequences
// This is called when a show is created
export async function createDefaultSequences(showId: string, showTitle: string) {
  const serviceClient = createServiceClient();
  const defaults = getDefaultEmailSequences(showTitle);

  const sequencesToCreate = defaults.map((seq, index) => ({
    show_id: showId,
    name: seq.name,
    subject: seq.subject,
    body_html: seq.body_html,
    body_text: seq.body_text,
    send_offset_minutes: seq.send_offset_minutes,
    enabled: seq.enabled,
    display_order: index,
  }));

  await serviceClient
    .from('show_email_sequences')
    .insert(sequencesToCreate);
}
