// Email templates for the live shopping app

import { getGoogleCalendarUrl } from '../calendar';

interface InvitationEmailProps {
  recipientEmail: string;
  showTitle: string;
  showDate: Date;
  inviteUrl: string;
  joinUrl: string; // The URL to join the live stream
}

export function getInvitationEmailHtml({
  showTitle,
  showDate,
  inviteUrl,
  joinUrl,
}: InvitationEmailProps): string {
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(showDate);

  const calendarUrl = getGoogleCalendarUrl({
    title: `Private Auction: ${showTitle}`,
    description: `Join the private auction here: ${joinUrl}`,
    startDate: showDate,
    durationMinutes: 60,
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You're Invited!</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #111111;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #111111; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 500px; background-color: #1a1a1a; border-radius: 16px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px; text-align: center;">
              <div style="width: 60px; height: 60px; margin: 0 auto 20px; background: linear-gradient(135deg, #ec4899, #a855f7); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 24px;">✉️</span>
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                You're Invited!
              </h1>
              <p style="margin: 10px 0 0; color: #9ca3af; font-size: 14px;">
                You've been invited to a private auction
              </p>
            </td>
          </tr>

          <!-- Show Details -->
          <tr>
            <td style="padding: 0 40px;">
              <div style="background-color: #262626; border-radius: 12px; padding: 24px;">
                <h2 style="margin: 0 0 8px; color: #ffffff; font-size: 18px; font-weight: 600;">
                  ${showTitle}
                </h2>
                <p style="margin: 0; color: #9ca3af; font-size: 14px;">
                  📅 ${formattedDate}
                </p>
              </div>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding: 30px 40px 15px;">
              <a href="${inviteUrl}" style="display: block; background: linear-gradient(135deg, #ec4899, #a855f7); color: #ffffff; text-decoration: none; padding: 16px 24px; border-radius: 12px; font-weight: 600; font-size: 16px; text-align: center;">
                Accept Invitation
              </a>
            </td>
          </tr>

          <!-- Add to Calendar -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <a href="${calendarUrl}" style="display: block; background-color: #262626; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 12px; font-weight: 500; font-size: 14px; text-align: center; border: 1px solid #333333;">
                📅 Add to Calendar
              </a>
            </td>
          </tr>

          <!-- Instructions -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <p style="margin: 0; color: #9ca3af; font-size: 13px; line-height: 1.6;">
                Click "Accept Invitation" to complete your registration. You'll need to provide your billing information so we can send you an invoice if you win any auctions.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px; border-top: 1px solid #333333;">
              <p style="margin: 0; color: #6b7280; font-size: 12px; text-align: center;">
                If you didn't expect this invitation, you can safely ignore this email.
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

export function getInvitationEmailText({
  showTitle,
  showDate,
  inviteUrl,
  joinUrl,
}: InvitationEmailProps): string {
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(showDate);

  const calendarUrl = getGoogleCalendarUrl({
    title: `Private Auction: ${showTitle}`,
    description: `Join the private auction here: ${joinUrl}`,
    startDate: showDate,
    durationMinutes: 60,
  });

  return `
You're Invited!

You've been invited to a private auction.

${showTitle}
${formattedDate}

Accept your invitation here:
${inviteUrl}

Add to Calendar:
${calendarUrl}

You'll need to provide your billing information so we can send you an invoice if you win any auctions.

If you didn't expect this invitation, you can safely ignore this email.
  `.trim();
}

// Confirmation email after registration
interface ConfirmationEmailProps {
  recipientName: string;
  showTitle: string;
  showDate: Date;
  joinUrl: string;
}

export function getConfirmationEmailHtml({
  recipientName,
  showTitle,
  showDate,
  joinUrl,
}: ConfirmationEmailProps): string {
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(showDate);

  const calendarUrl = getGoogleCalendarUrl({
    title: `Private Auction: ${showTitle}`,
    description: `Join the private auction here: ${joinUrl}`,
    startDate: showDate,
    durationMinutes: 60,
  });

  // Calculate time until event
  const now = new Date();
  const diff = showDate.getTime() - now.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  let timeUntilEvent = '';
  if (days > 0) {
    timeUntilEvent = `${days} day${days > 1 ? 's' : ''}`;
    if (hours > 0) {
      timeUntilEvent += ` and ${hours} hour${hours > 1 ? 's' : ''}`;
    }
  } else if (hours > 0) {
    timeUntilEvent = `${hours} hour${hours > 1 ? 's' : ''}`;
  } else {
    timeUntilEvent = 'very soon';
  }

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You're Registered!</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #111111;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #111111; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 500px; background-color: #1a1a1a; border-radius: 16px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px; text-align: center;">
              <div style="width: 60px; height: 60px; margin: 0 auto 20px; background: linear-gradient(135deg, #22c55e, #16a34a); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 24px;">✓</span>
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                You're Registered, ${recipientName}!
              </h1>
              <p style="margin: 10px 0 0; color: #9ca3af; font-size: 14px;">
                Your spot is confirmed for the private auction
              </p>
            </td>
          </tr>

          <!-- Event Details -->
          <tr>
            <td style="padding: 0 40px;">
              <div style="background-color: #262626; border-radius: 12px; padding: 24px;">
                <h2 style="margin: 0 0 8px; color: #ffffff; font-size: 18px; font-weight: 600;">
                  ${showTitle}
                </h2>
                <p style="margin: 0 0 16px; color: #9ca3af; font-size: 14px;">
                  📅 ${formattedDate}
                </p>
                <div style="background-color: #1a1a1a; border-radius: 8px; padding: 12px; text-align: center;">
                  <p style="margin: 0; color: #ec4899; font-size: 14px; font-weight: 600;">
                    ⏰ Starting in ${timeUntilEvent}
                  </p>
                </div>
              </div>
            </td>
          </tr>

          <!-- Important: Save your link -->
          <tr>
            <td style="padding: 30px 40px 15px;">
              <div style="background-color: #422006; border: 1px solid #854d0e; border-radius: 12px; padding: 16px;">
                <p style="margin: 0 0 8px; color: #fbbf24; font-size: 14px; font-weight: 600;">
                  ⚠️ Important: Save your personal link
                </p>
                <p style="margin: 0; color: #fcd34d; font-size: 12px; line-height: 1.5;">
                  This link is unique to you. Bookmark it or add the event to your calendar so you don't miss it!
                </p>
              </div>
            </td>
          </tr>

          <!-- Join Button -->
          <tr>
            <td style="padding: 15px 40px;">
              <a href="${joinUrl}" style="display: block; background: linear-gradient(135deg, #ec4899, #a855f7); color: #ffffff; text-decoration: none; padding: 16px 24px; border-radius: 12px; font-weight: 600; font-size: 16px; text-align: center;">
                Join the Auction
              </a>
            </td>
          </tr>

          <!-- Add to Calendar -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <a href="${calendarUrl}" style="display: block; background-color: #262626; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 12px; font-weight: 500; font-size: 14px; text-align: center; border: 1px solid #333333;">
                📅 Add to Calendar
              </a>
            </td>
          </tr>

          <!-- What to expect -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <h3 style="margin: 0 0 12px; color: #ffffff; font-size: 14px; font-weight: 600;">
                What to expect:
              </h3>
              <ul style="margin: 0; padding: 0 0 0 20px; color: #9ca3af; font-size: 13px; line-height: 1.8;">
                <li>Join the live stream at the scheduled time</li>
                <li>Browse and bid on exclusive items</li>
                <li>If you win, we'll send you an invoice</li>
              </ul>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px; border-top: 1px solid #333333;">
              <p style="margin: 0; color: #6b7280; font-size: 12px; text-align: center;">
                Questions? Reply to this email or contact us at benji@shoppablevids.com
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

export function getConfirmationEmailText({
  recipientName,
  showTitle,
  showDate,
  joinUrl,
}: ConfirmationEmailProps): string {
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(showDate);

  const calendarUrl = getGoogleCalendarUrl({
    title: `Private Auction: ${showTitle}`,
    description: `Join the private auction here: ${joinUrl}`,
    startDate: showDate,
    durationMinutes: 60,
  });

  return `
You're Registered, ${recipientName}!

Your spot is confirmed for the private auction.

${showTitle}
${formattedDate}

IMPORTANT: Save your personal link!
This link is unique to you. Bookmark it or add the event to your calendar.

Join the Auction:
${joinUrl}

Add to Calendar:
${calendarUrl}

What to expect:
- Join the live stream at the scheduled time
- Browse and bid on exclusive items
- If you win, we'll send you an invoice

Questions? Reply to this email or contact us at benji@shoppablevids.com
  `.trim();
}
