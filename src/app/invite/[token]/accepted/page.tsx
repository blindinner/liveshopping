'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import type { Show } from '@/types/database';

interface InvitationData {
  invitation: {
    id: string;
    email: string;
    status: string;
    show_id: string;
  };
  show: Show;
}

export default function InvitationAcceptedPage() {
  const params = useParams();
  const token = params.token as string;

  const [data, setData] = useState<InvitationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchInvitation();
  }, [token]);

  const fetchInvitation = async () => {
    try {
      const response = await fetch(`/api/invitations/${token}`);
      if (response.ok) {
        const invitationData = await response.json();
        setData(invitationData);
      }
    } catch (err) {
      console.error('Fetch invitation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const getCalendarUrl = (show: Show) => {
    const startDate = new Date(show.scheduled_at);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour duration

    const formatCalendarDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    };

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: show.title,
      dates: `${formatCalendarDate(startDate)}/${formatCalendarDate(endDate)}`,
      details: `Join the private auction: ${typeof window !== 'undefined' ? window.location.origin : ''}/live/${show.id}?token=${token}`,
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white/5 rounded-2xl p-8 border border-white/10 text-center">
          <h1 className="text-xl font-bold text-white mb-2">Invitation Not Found</h1>
          <p className="text-white/60">This invitation link is no longer valid.</p>
        </div>
      </div>
    );
  }

  const showDate = new Date(data.show.scheduled_at);
  const isShowLive = data.show.status === 'live';
  const isShowEnded = data.show.status === 'ended';
  const isUpcoming = showDate > new Date() && !isShowLive;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* Success message */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
            <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">You're All Set!</h1>
          <p className="text-white/60">Your registration is complete. You can now join the private auction.</p>
        </div>

        {/* Show details card */}
        <div className="bg-white/5 rounded-2xl p-6 border border-white/10 mb-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-white mb-2">{data.show.title}</h2>
            <p className="text-white/60">
              {formatDate(data.show.scheduled_at)}
            </p>

            {/* Status indicator */}
            <div className="mt-4">
              {isShowLive && (
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm font-medium">
                  <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                  Live Now
                </span>
              )}
              {isUpcoming && (
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm font-medium">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Upcoming
                </span>
              )}
              {isShowEnded && (
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-gray-500/20 text-gray-400 rounded-full text-sm font-medium">
                  Ended
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {(isShowLive || !isShowEnded) && (
            <Link href={`/live/${data.show.id}?token=${token}`} className="block">
              <Button className="w-full" size="lg">
                {isShowLive ? 'Join Live Show' : 'View Show Page'}
              </Button>
            </Link>
          )}

          {isUpcoming && (
            <a
              href={getCalendarUrl(data.show)}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Button variant="secondary" className="w-full">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Add to Calendar
              </Button>
            </a>
          )}
        </div>

        {/* Note */}
        <p className="text-white/40 text-sm text-center mt-6">
          Keep this link safe - you'll need it to join the auction.
        </p>
      </div>
    </div>
  );
}
