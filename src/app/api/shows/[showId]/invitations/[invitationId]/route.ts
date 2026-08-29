import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { sendInvitationEmail } from '@/lib/email/send';

// PATCH /api/shows/[showId]/invitations/[invitationId] - Resend invitation email
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ showId: string; invitationId: string }> }
) {
  try {
    const { showId, invitationId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const serviceClient = createServiceClient();

    // Get invitation and show details
    const { data: invitation, error: invitationError } = await serviceClient
      .from('invitations')
      .select('*')
      .eq('id', invitationId)
      .eq('show_id', showId)
      .single();

    if (invitationError || !invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    const { data: show, error: showError } = await serviceClient
      .from('shows')
      .select('title, scheduled_at, embed_url, invitation_email_subject, invitation_email_body, brand:brands(shopify_domain)')
      .eq('id', showId)
      .single();

    if (showError || !show) {
      return NextResponse.json({ error: 'Show not found' }, { status: 404 });
    }

    // Get base URL
    const headersList = await headers();
    const host = headersList.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;

    // Determine embed URL: explicit embed_url > shopify domain > none
    const brandDomain = (show.brand as { shopify_domain?: string } | null)?.shopify_domain;
    const effectiveEmbedUrl = show.embed_url || (brandDomain ? `https://${brandDomain}` : undefined);

    // Send email
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

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to send email' },
        { status: 500 }
      );
    }

    // Update sent_at timestamp and status
    await serviceClient
      .from('invitations')
      .update({
        sent_at: new Date().toISOString(),
        status: 'sent'
      })
      .eq('id', invitationId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Resend invitation error:', error);
    return NextResponse.json(
      { error: 'Failed to resend invitation' },
      { status: 500 }
    );
  }
}

// DELETE /api/shows/[showId]/invitations/[invitationId] - Remove an invitation
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ showId: string; invitationId: string }> }
) {
  try {
    const { showId, invitationId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const serviceClient = createServiceClient();

    // Delete the invitation
    const { error } = await serviceClient
      .from('invitations')
      .delete()
      .eq('id', invitationId)
      .eq('show_id', showId);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete invitation error:', error);
    return NextResponse.json(
      { error: 'Failed to delete invitation' },
      { status: 500 }
    );
  }
}
