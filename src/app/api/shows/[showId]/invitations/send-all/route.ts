import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { sendInvitationEmail } from '@/lib/email/send';

// POST /api/shows/[showId]/invitations/send-all - Send email to all pending invitations
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

    const serviceClient = createServiceClient();

    // Get show details
    const { data: show, error: showError } = await serviceClient
      .from('shows')
      .select('title, scheduled_at, embed_url, invitation_email_subject, invitation_email_body, brand:brands(shopify_domain, website_url)')
      .eq('id', showId)
      .single();

    if (showError || !show) {
      return NextResponse.json({ error: 'Show not found' }, { status: 404 });
    }

    // Get all pending invitations that haven't been sent yet (or all pending if resending)
    const { data: invitations, error: invitationsError } = await serviceClient
      .from('invitations')
      .select('*')
      .eq('show_id', showId)
      .eq('status', 'pending');

    if (invitationsError) {
      throw invitationsError;
    }

    if (!invitations || invitations.length === 0) {
      return NextResponse.json({
        success: true,
        sent: 0,
        failed: 0,
        message: 'No pending invitations to send'
      });
    }

    // Get base URL
    const headersList = await headers();
    const host = headersList.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;

    // Determine embed URL
    const brand = show.brand as { shopify_domain?: string; website_url?: string } | null;
    const effectiveEmbedUrl = show.embed_url || brand?.website_url || (brand?.shopify_domain ? `https://${brand.shopify_domain}` : undefined);

    // Send emails to all pending invitations
    let sent = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const invitation of invitations) {
      try {
        const result = await sendInvitationEmail({
          to: invitation.email,
          showTitle: show.title,
          showDate: new Date(show.scheduled_at),
          showId,
          inviteToken: invitation.invite_token,
          baseUrl,
          embedUrl: effectiveEmbedUrl,
          customSubject: show.invitation_email_subject,
          customBody: show.invitation_email_body,
        });

        if (result.success) {
          // Update sent_at timestamp and status
          await serviceClient
            .from('invitations')
            .update({
              sent_at: new Date().toISOString(),
              status: 'sent'
            })
            .eq('id', invitation.id);
          sent++;
        } else {
          failed++;
          errors.push(`${invitation.email}: ${result.error || 'Unknown error'}`);
        }
      } catch (err) {
        failed++;
        errors.push(`${invitation.email}: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }

    return NextResponse.json({
      success: true,
      sent,
      failed,
      total: invitations.length,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Send all invitations error:', error);
    return NextResponse.json(
      { error: 'Failed to send invitations' },
      { status: 500 }
    );
  }
}
