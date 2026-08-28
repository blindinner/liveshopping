import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { createServiceClient } from '@/lib/supabase/server';
import { sendInvitationEmail } from '@/lib/email/send';

// POST /api/invitations/recover - Resend invitation link by email
export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const serviceClient = createServiceClient();

    // Find pending or accepted invitations for this email
    // We'll resend the most recent one for an upcoming show
    const { data: invitations, error } = await serviceClient
      .from('invitations')
      .select(`
        *,
        show:shows(id, title, scheduled_at, status, embed_url)
      `)
      .eq('email', normalizedEmail)
      .in('status', ['pending', 'accepted'])
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Filter to only upcoming or live shows
    const activeInvitations = invitations?.filter((inv) => {
      const show = inv.show as { id: string; title: string; scheduled_at: string; status: string; embed_url: string | null } | null;
      if (!show) return false;
      // Include if show is not ended
      return show.status !== 'ended';
    }) || [];

    if (activeInvitations.length === 0) {
      // Return success anyway to not leak email existence info
      return NextResponse.json({
        success: true,
        message: 'If you have pending invitations, we\'ve sent them to your email.',
      });
    }

    // Send emails for all active invitations
    const headersList = await headers();
    const host = headersList.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;

    let emailsSent = 0;

    for (const invitation of activeInvitations) {
      const show = invitation.show as { id: string; title: string; scheduled_at: string; status: string; embed_url: string | null };

      const result = await sendInvitationEmail({
        to: invitation.email,
        showTitle: show.title,
        showDate: new Date(show.scheduled_at),
        showId: show.id,
        inviteToken: invitation.invite_token,
        baseUrl,
        embedUrl: show.embed_url || undefined,
      });

      if (result.success) {
        // Update sent_at timestamp
        await serviceClient
          .from('invitations')
          .update({ sent_at: new Date().toISOString() })
          .eq('id', invitation.id);
        emailsSent++;
      }
    }

    return NextResponse.json({
      success: true,
      message: 'If you have pending invitations, we\'ve sent them to your email.',
      // Only include count in dev for debugging
      ...(process.env.NODE_ENV === 'development' && { emailsSent }),
    });
  } catch (error) {
    console.error('Recover invitation error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
