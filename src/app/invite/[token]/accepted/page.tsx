'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
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
  guest_profile?: {
    name: string;
  };
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function useCountdown(targetDate: Date): TimeLeft | null {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();

      if (diff <= 0) {
        return null;
      }

      return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      };
    };

    // Initial calculation
    setTimeLeft(calculateTimeLeft());

    // Update every second
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return timeLeft;
}

export default function InvitationAcceptedPage() {
  const params = useParams();
  const token = params.token as string;

  const [data, setData] = useState<InvitationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

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

  const showDate = data ? new Date(data.show.scheduled_at) : new Date();
  const timeLeft = useCountdown(showDate);

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

  const getJoinUrl = () => {
    if (!data) return '';
    // Priority: show.embed_url > brand.website_url > brand.shopify_domain > our domain
    const effectiveEmbedUrl = data.show.embed_url
      || data.show._brandWebsiteUrl
      || (data.show._brandDomain ? `https://${data.show._brandDomain}` : null);

    if (effectiveEmbedUrl) {
      // Append token to embed URL
      const url = new URL(effectiveEmbedUrl);
      url.searchParams.set('token', token);
      return url.toString();
    }
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/live/${data.show.id}?token=${token}`;
  };

  const getCalendarUrl = (show: Show) => {
    const startDate = new Date(show.scheduled_at);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

    const formatCalendarDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    };

    const joinUrl = getJoinUrl();

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: `Private Auction: ${show.title}`,
      dates: `${formatCalendarDate(startDate)}/${formatCalendarDate(endDate)}`,
      details: `Join the private auction here: ${joinUrl}`,
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  const copyJoinLink = async () => {
    const url = getJoinUrl();
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

  const isShowLive = data.show.status === 'live';
  const isShowEnded = data.show.status === 'ended';
  // Check if show is upcoming by comparing dates directly (more reliable than depending on countdown state)
  const isUpcoming = new Date(data.show.scheduled_at) > new Date() && !isShowLive && !isShowEnded;
  const guestName = data.guest_profile?.name || 'there';

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* Success header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
            <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            You're All Set, {guestName}!
          </h1>
          <p className="text-white/60">
            Your registration is complete. We've sent you a confirmation email with all the details.
          </p>
        </div>

        {/* Show details card */}
        <div className="bg-white/5 rounded-2xl p-6 border border-white/10 mb-6">
          <h2 className="text-xl font-semibold text-white text-center mb-2">
            {data.show.title}
          </h2>
          <p className="text-white/60 text-center text-sm mb-4">
            {formatDate(data.show.scheduled_at)}
          </p>

          {/* Live Now */}
          {isShowLive && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                <span className="text-red-400 font-semibold text-lg">LIVE NOW</span>
              </div>
              <p className="text-red-300 text-sm">The auction is happening right now!</p>
            </div>
          )}

          {/* Countdown */}
          {isUpcoming && timeLeft && (
            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-white/60 text-center text-sm mb-3">Starting in</p>
              <div className="grid grid-cols-4 gap-2">
                <div className="text-center">
                  <div className="bg-white/10 rounded-lg p-3">
                    <span className="text-2xl font-bold text-white">{timeLeft.days}</span>
                  </div>
                  <span className="text-xs text-white/50 mt-1 block">days</span>
                </div>
                <div className="text-center">
                  <div className="bg-white/10 rounded-lg p-3">
                    <span className="text-2xl font-bold text-white">{timeLeft.hours}</span>
                  </div>
                  <span className="text-xs text-white/50 mt-1 block">hours</span>
                </div>
                <div className="text-center">
                  <div className="bg-white/10 rounded-lg p-3">
                    <span className="text-2xl font-bold text-white">{timeLeft.minutes}</span>
                  </div>
                  <span className="text-xs text-white/50 mt-1 block">min</span>
                </div>
                <div className="text-center">
                  <div className="bg-white/10 rounded-lg p-3">
                    <span className="text-2xl font-bold text-pink-400">{timeLeft.seconds}</span>
                  </div>
                  <span className="text-xs text-white/50 mt-1 block">sec</span>
                </div>
              </div>
            </div>
          )}

          {/* Ended */}
          {isShowEnded && (
            <div className="bg-gray-500/20 rounded-xl p-4 text-center">
              <span className="text-gray-400">This auction has ended</span>
            </div>
          )}
        </div>

        {/* Your personal link */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="text-amber-400 mt-0.5">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <p className="text-amber-400 font-medium text-sm mb-1">Save your personal link</p>
              <p className="text-amber-300/70 text-xs mb-3">
                This link is unique to you. Bookmark it or add the event to your calendar!
              </p>
              <button
                onClick={copyJoinLink}
                className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 rounded-lg transition-colors text-sm text-amber-300"
              >
                {copied ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                    Copy Link
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {isShowLive && (
            <a href={getJoinUrl()} className="block">
              <Button className="w-full" size="lg">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse mr-2" />
                Join Live Now
              </Button>
            </a>
          )}

          {isUpcoming && (
            <>
              <a
                href={getCalendarUrl(data.show)}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Button className="w-full" size="lg">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Add to Calendar
                </Button>
              </a>
              <a href={getJoinUrl()} className="block">
                <Button variant="secondary" className="w-full">
                  Preview Show Page
                </Button>
              </a>
            </>
          )}
        </div>

        {/* What to expect */}
        {isUpcoming && (
          <div className="mt-8 pt-6 border-t border-white/10">
            <h3 className="text-white font-medium mb-3">What to expect:</h3>
            <ul className="space-y-2 text-white/60 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-pink-400">1.</span>
                <span>Join the live stream when it starts</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pink-400">2.</span>
                <span>Browse exclusive items and place your bids</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pink-400">3.</span>
                <span>If you win, we'll send you an invoice</span>
              </li>
            </ul>
          </div>
        )}

        {/* Footer */}
        <p className="text-white/40 text-xs text-center mt-8">
          Questions? Contact us at benji@shoppablevids.com
        </p>
      </div>
    </div>
  );
}
