// Email sequence sending logic
// Handles variable substitution and sending scheduled emails

import { resend } from './client';
import { getGoogleCalendarUrl } from '../calendar';
import type {
  ShowEmailSequence,
  ScheduledEmail,
  Invitation,
  Show,
  Brand,
  GuestProfile,
} from '@/types/database';

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'benji@shoppablevids.com';
const FROM_NAME = 'Shoppable Vids';

// Context for variable substitution
interface EmailContext {
  recipientEmail: string;
  recipientName: string;
  showTitle: string;
  showDate: Date;
  joinUrl: string;
  calendarUrl: string;
}

/**
 * Format a date for display in emails
 */
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/**
 * Calculate time until event for display
 */
function getTimeUntilEvent(showDate: Date): string {
  const now = new Date();
  const diff = showDate.getTime() - now.getTime();

  if (diff <= 0) return 'now';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) {
    return hours > 0 ? `${days} day${days > 1 ? 's' : ''} and ${hours} hour${hours > 1 ? 's' : ''}` : `${days} day${days > 1 ? 's' : ''}`;
  }
  if (hours > 0) {
    return minutes > 0 ? `${hours} hour${hours > 1 ? 's' : ''} and ${minutes} minute${minutes > 1 ? 's' : ''}` : `${hours} hour${hours > 1 ? 's' : ''}`;
  }
  if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  }
  return 'very soon';
}

/**
 * Replace {{placeholders}} with actual values
 */
export function substituteVariables(template: string, context: EmailContext): string {
  return template
    .replace(/\{\{recipient_name\}\}/g, context.recipientName || 'Guest')
    .replace(/\{\{recipient_email\}\}/g, context.recipientEmail)
    .replace(/\{\{show_title\}\}/g, context.showTitle)
    .replace(/\{\{show_date\}\}/g, formatDate(context.showDate))
    .replace(/\{\{time_until_event\}\}/g, getTimeUntilEvent(context.showDate))
    .replace(/\{\{join_url\}\}/g, context.joinUrl)
    .replace(/\{\{calendar_url\}\}/g, context.calendarUrl);
}

/**
 * Strip HTML tags for plain text fallback
 */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

// Extended scheduled email type with joined data
export interface ScheduledEmailWithData extends ScheduledEmail {
  invitation: Invitation & {
    guest_profile?: GuestProfile;
  };
  sequence: ShowEmailSequence;
  show: Show & {
    brand?: Brand;
  };
}

/**
 * Send a scheduled sequence email
 */
export async function sendSequenceEmail(
  scheduledEmail: ScheduledEmailWithData
): Promise<{ success: boolean; error?: string }> {
  const { invitation, sequence, show } = scheduledEmail;

  // Build join URL
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.shoppablevids.com';
  const embedUrl = show.embed_url || show.brand?.website_url ||
    (show.brand?.shopify_domain ? `https://${show.brand.shopify_domain}` : null);

  let joinUrl: string;
  if (embedUrl) {
    const url = new URL(embedUrl);
    url.searchParams.set('token', invitation.invite_token);
    joinUrl = url.toString();
  } else {
    joinUrl = `${baseUrl}/live/${show.id}?token=${invitation.invite_token}`;
  }

  const showDate = new Date(show.scheduled_at);

  // Build calendar URL
  const calendarUrl = getGoogleCalendarUrl({
    title: `Private Auction: ${show.title}`,
    description: `Join the private auction here: ${joinUrl}`,
    startDate: showDate,
    durationMinutes: 60,
  });

  // Build context for variable substitution
  const context: EmailContext = {
    recipientEmail: invitation.email,
    recipientName: invitation.guest_profile?.name || 'Guest',
    showTitle: show.title,
    showDate,
    joinUrl,
    calendarUrl,
  };

  // Substitute variables in subject and body
  const subject = substituteVariables(sequence.subject, context);
  const htmlBody = substituteVariables(sequence.body_html, context);
  const textBody = sequence.body_text
    ? substituteVariables(sequence.body_text, context)
    : stripHtml(htmlBody);

  try {
    const { error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: invitation.email,
      subject,
      html: htmlBody,
      text: textBody,
    });

    if (error) {
      console.error('Resend sequence email error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Send sequence email error:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to send email',
    };
  }
}

/**
 * Get default email templates for a new show
 */
export function getDefaultEmailSequences(showTitle: string): Omit<ShowEmailSequence, 'id' | 'show_id' | 'created_at' | 'updated_at'>[] {
  return [
    {
      name: '1 Week Reminder',
      subject: `Reminder: {{show_title}} is in 1 week!`,
      body_html: getDefaultEmailHtml('1 week'),
      body_text: null,
      send_offset_minutes: -7 * 24 * 60,
      enabled: true,
      display_order: 0,
    },
    {
      name: '1 Day Reminder',
      subject: `Tomorrow: {{show_title}}`,
      body_html: getDefaultEmailHtml('tomorrow'),
      body_text: null,
      send_offset_minutes: -24 * 60,
      enabled: true,
      display_order: 1,
    },
  ];
}

/**
 * Generate default email HTML template
 */
function getDefaultEmailHtml(timeframe: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #111111;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #111111; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 500px; background-color: #1a1a1a; border-radius: 16px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                ${timeframe === '1 hour' ? 'Starting Soon!' : timeframe === 'tomorrow' ? 'See You Tomorrow!' : 'Reminder'}
              </h1>
              <p style="margin: 10px 0 0; color: #9ca3af; font-size: 14px;">
                {{show_title}} is happening ${timeframe === '1 hour' ? 'in just 1 hour' : timeframe === 'tomorrow' ? 'tomorrow' : 'in 1 week'}
              </p>
            </td>
          </tr>

          <!-- Show Details -->
          <tr>
            <td style="padding: 0 40px;">
              <div style="background-color: #262626; border-radius: 12px; padding: 24px;">
                <p style="margin: 0 0 8px; color: #9ca3af; font-size: 14px;">Hi {{recipient_name}},</p>
                <h2 style="margin: 0 0 8px; color: #ffffff; font-size: 18px; font-weight: 600;">
                  {{show_title}}
                </h2>
                <p style="margin: 0; color: #9ca3af; font-size: 14px;">
                  {{show_date}}
                </p>
              </div>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding: 30px 40px 15px;">
              <a href="{{join_url}}" style="display: block; background: linear-gradient(135deg, #ec4899, #a855f7); color: #ffffff; text-decoration: none; padding: 16px 24px; border-radius: 12px; font-weight: 600; font-size: 16px; text-align: center;">
                ${timeframe === '1 hour' ? 'Join Now' : 'View Details'}
              </a>
            </td>
          </tr>

          <!-- Add to Calendar -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <a href="{{calendar_url}}" style="display: block; background-color: #262626; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 12px; font-weight: 500; font-size: 14px; text-align: center; border: 1px solid #333333;">
                Add to Calendar
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px 40px; border-top: 1px solid #262626;">
              <p style="margin: 0; color: #6b7280; font-size: 12px; text-align: center;">
                You're receiving this because you're invited to a private auction.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
