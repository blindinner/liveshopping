import { resend } from './client';
import {
  getInvitationEmailHtml,
  getInvitationEmailText,
  getInvitationEmailSubject,
  getConfirmationEmailHtml,
  getConfirmationEmailText,
} from './templates';
import { generateICSContent } from '../calendar';

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'benji@shoppablevids.com';
const FROM_NAME = 'Shoppable Vids';

interface SendInvitationEmailParams {
  to: string;
  showTitle: string;
  showDate: Date;
  showId: string;
  inviteToken: string;
  baseUrl: string;
  embedUrl?: string;
  customSubject?: string | null;
  customBody?: string | null;
}

export async function sendInvitationEmail({
  to,
  showTitle,
  showDate,
  showId,
  inviteToken,
  baseUrl,
  embedUrl,
  customSubject,
  customBody,
}: SendInvitationEmailParams): Promise<{ success: boolean; error?: string }> {
  // Use embed URL if configured - the widget will handle registration
  let inviteUrl: string;
  let joinUrl: string;

  if (embedUrl) {
    const url = new URL(embedUrl);
    url.searchParams.set('token', inviteToken);
    // Both links point to the embed URL - widget handles everything
    inviteUrl = url.toString();
    joinUrl = url.toString();
  } else {
    // Fallback to our domain
    inviteUrl = `${baseUrl}/invite/${inviteToken}`;
    joinUrl = `${baseUrl}/live/${showId}?token=${inviteToken}`;
  }

  // Get email subject (custom or default)
  const subject = getInvitationEmailSubject({ showTitle, customSubject });

  try {
    const { error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to,
      subject,
      html: getInvitationEmailHtml({
        recipientEmail: to,
        showTitle,
        showDate,
        inviteUrl,
        joinUrl,
        customBody,
      }),
      text: getInvitationEmailText({
        recipientEmail: to,
        showTitle,
        showDate,
        inviteUrl,
        joinUrl,
        customBody,
      }),
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Send invitation email error:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to send email',
    };
  }
}

interface SendConfirmationEmailParams {
  to: string;
  recipientName: string;
  showTitle: string;
  showDate: Date;
  showId: string;
  inviteToken: string;
  baseUrl: string;
  embedUrl?: string;
}

export async function sendConfirmationEmail({
  to,
  recipientName,
  showTitle,
  showDate,
  showId,
  inviteToken,
  baseUrl,
  embedUrl,
}: SendConfirmationEmailParams): Promise<{ success: boolean; error?: string }> {
  // Use embed URL if configured, otherwise use our domain
  let joinUrl: string;
  if (embedUrl) {
    const url = new URL(embedUrl);
    url.searchParams.set('token', inviteToken);
    joinUrl = url.toString();
  } else {
    joinUrl = `${baseUrl}/live/${showId}?token=${inviteToken}`;
  }

  // Generate ICS file for attachment
  const icsContent = generateICSContent({
    title: `Private Auction: ${showTitle}`,
    description: `Join the private auction here: ${joinUrl}`,
    startDate: showDate,
    durationMinutes: 60,
  });

  try {
    const { error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to,
      subject: `You're registered for ${showTitle}`,
      html: getConfirmationEmailHtml({
        recipientName,
        showTitle,
        showDate,
        joinUrl,
      }),
      text: getConfirmationEmailText({
        recipientName,
        showTitle,
        showDate,
        joinUrl,
      }),
      attachments: [
        {
          filename: 'event.ics',
          content: Buffer.from(icsContent).toString('base64'),
        },
      ],
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Send confirmation email error:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to send email',
    };
  }
}
