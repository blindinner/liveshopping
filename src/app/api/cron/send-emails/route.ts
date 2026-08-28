import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { sendSequenceEmail, ScheduledEmailWithData } from '@/lib/email/sequences';

// Vercel cron job - runs every minute
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 60 second timeout

export async function GET(request: Request) {
  // Verify cron secret (required for Vercel cron jobs)
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  // In development, allow without secret
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const serviceClient = createServiceClient();
  const now = new Date().toISOString();

  try {
    // Get pending emails that are due (limit to 50 per run to avoid timeouts)
    const { data: pendingEmails, error } = await serviceClient
      .from('scheduled_emails')
      .select(`
        *,
        invitation:invitations(*, guest_profile:guest_profiles(*)),
        sequence:show_email_sequences(*),
        show:shows(*, brand:brands(*))
      `)
      .eq('status', 'pending')
      .lte('scheduled_for', now)
      .limit(50);

    if (error) {
      console.error('Cron fetch error:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    if (!pendingEmails || pendingEmails.length === 0) {
      return NextResponse.json({
        message: 'No emails to send',
        processed: 0,
        sent: 0,
        failed: 0,
        cancelled: 0,
      });
    }

    let sent = 0;
    let failed = 0;
    let cancelled = 0;

    for (const email of pendingEmails) {
      // Skip if show has ended or invitation was declined
      if (email.show?.status === 'ended') {
        await serviceClient
          .from('scheduled_emails')
          .update({ status: 'cancelled' })
          .eq('id', email.id);
        cancelled++;
        continue;
      }

      if (email.invitation?.status === 'declined') {
        await serviceClient
          .from('scheduled_emails')
          .update({ status: 'cancelled' })
          .eq('id', email.id);
        cancelled++;
        continue;
      }

      // Skip if missing required data
      if (!email.invitation || !email.sequence || !email.show) {
        console.error(`Missing data for scheduled email ${email.id}`);
        await serviceClient
          .from('scheduled_emails')
          .update({
            status: 'failed',
            error_message: 'Missing required data',
          })
          .eq('id', email.id);
        failed++;
        continue;
      }

      try {
        const result = await sendSequenceEmail(email as ScheduledEmailWithData);

        if (result.success) {
          await serviceClient
            .from('scheduled_emails')
            .update({
              status: 'sent',
              sent_at: new Date().toISOString(),
            })
            .eq('id', email.id);
          sent++;
        } else {
          // Retry up to 3 times
          const newRetryCount = email.retry_count + 1;
          await serviceClient
            .from('scheduled_emails')
            .update({
              status: newRetryCount >= 3 ? 'failed' : 'pending',
              error_message: result.error,
              retry_count: newRetryCount,
            })
            .eq('id', email.id);

          if (newRetryCount >= 3) {
            failed++;
          }
        }
      } catch (err) {
        console.error(`Error sending email ${email.id}:`, err);
        const newRetryCount = email.retry_count + 1;
        await serviceClient
          .from('scheduled_emails')
          .update({
            status: newRetryCount >= 3 ? 'failed' : 'pending',
            error_message: err instanceof Error ? err.message : 'Unknown error',
            retry_count: newRetryCount,
          })
          .eq('id', email.id);

        if (newRetryCount >= 3) {
          failed++;
        }
      }
    }

    return NextResponse.json({
      message: 'Cron job completed',
      processed: pendingEmails.length,
      sent,
      failed,
      cancelled,
    });
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      { error: 'Cron job failed' },
      { status: 500 }
    );
  }
}
