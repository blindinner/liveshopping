import { resend } from './client';
import { getInvitationEmailHtml, getInvitationEmailText } from './templates';

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'benji@shoppablevids.com';
const FROM_NAME = 'Shoppable Vids';

interface SendInvitationEmailParams {
  to: string;
  showTitle: string;
  showDate: Date;
  inviteToken: string;
  baseUrl: string;
}

export async function sendInvitationEmail({
  to,
  showTitle,
  showDate,
  inviteToken,
  baseUrl,
}: SendInvitationEmailParams): Promise<{ success: boolean; error?: string }> {
  const inviteUrl = `${baseUrl}/invite/${inviteToken}`;

  try {
    const { error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to,
      subject: `You're invited to ${showTitle}`,
      html: getInvitationEmailHtml({
        recipientEmail: to,
        showTitle,
        showDate,
        inviteUrl,
      }),
      text: getInvitationEmailText({
        recipientEmail: to,
        showTitle,
        showDate,
        inviteUrl,
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
      error: err instanceof Error ? err.message : 'Failed to send email'
    };
  }
}
