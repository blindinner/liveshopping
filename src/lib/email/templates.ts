// Email templates for the live shopping app

interface InvitationEmailProps {
  recipientEmail: string;
  showTitle: string;
  showDate: Date;
  inviteUrl: string;
}

export function getInvitationEmailHtml({
  showTitle,
  showDate,
  inviteUrl,
}: InvitationEmailProps): string {
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(showDate);

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
            <td style="padding: 30px 40px;">
              <a href="${inviteUrl}" style="display: block; background: linear-gradient(135deg, #ec4899, #a855f7); color: #ffffff; text-decoration: none; padding: 16px 24px; border-radius: 12px; font-weight: 600; font-size: 16px; text-align: center;">
                Accept Invitation
              </a>
            </td>
          </tr>

          <!-- Instructions -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <p style="margin: 0; color: #9ca3af; font-size: 13px; line-height: 1.6;">
                Click the button above to complete your registration. You'll need to provide your billing information so we can send you an invoice if you win any auctions.
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
}: InvitationEmailProps): string {
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(showDate);

  return `
You're Invited!

You've been invited to a private auction.

${showTitle}
${formattedDate}

Accept your invitation here:
${inviteUrl}

You'll need to provide your billing information so we can send you an invoice if you win any auctions.

If you didn't expect this invitation, you can safely ignore this email.
  `.trim();
}
