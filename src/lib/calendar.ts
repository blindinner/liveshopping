// Calendar link utilities for generating Google Calendar and ICS links

interface CalendarEventParams {
  title: string;
  description: string;
  startDate: Date;
  durationMinutes?: number;
  location?: string;
}

/**
 * Generate a Google Calendar link
 */
export function getGoogleCalendarUrl({
  title,
  description,
  startDate,
  durationMinutes = 60,
  location,
}: CalendarEventParams): string {
  const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000);

  const formatDate = (date: Date) =>
    date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${formatDate(startDate)}/${formatDate(endDate)}`,
    details: description,
  });

  if (location) {
    params.set('location', location);
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generate an ICS file content for download
 */
export function generateICSContent({
  title,
  description,
  startDate,
  durationMinutes = 60,
  location,
}: CalendarEventParams): string {
  const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000);

  const formatDate = (date: Date) =>
    date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '').slice(0, -1) + 'Z';

  const uid = `${Date.now()}-${Math.random().toString(36).slice(2)}@shoppablevids.com`;

  // Escape special characters in ICS format
  const escapeICS = (str: string) =>
    str.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Shoppable Vids//Private Auction//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${formatDate(new Date())}`,
    `DTSTART:${formatDate(startDate)}`,
    `DTEND:${formatDate(endDate)}`,
    `SUMMARY:${escapeICS(title)}`,
    `DESCRIPTION:${escapeICS(description)}`,
  ];

  if (location) {
    lines.push(`LOCATION:${escapeICS(location)}`);
  }

  lines.push('END:VEVENT', 'END:VCALENDAR');

  return lines.join('\r\n');
}

/**
 * Generate a data URL for ICS download
 */
export function getICSDataUrl(params: CalendarEventParams): string {
  const icsContent = generateICSContent(params);
  const base64 = Buffer.from(icsContent).toString('base64');
  return `data:text/calendar;base64,${base64}`;
}
