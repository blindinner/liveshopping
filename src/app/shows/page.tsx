import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Badge } from '@/components/ui/Badge';
import type { Show } from '@/types/database';

export const metadata: Metadata = {
  title: 'Live Shows',
  description: 'Watch live shopping shows and discover upcoming events. Shop directly from the stream.',
};

export default async function ShowsPage() {
  const supabase = await createClient();

  const { data: shows } = await supabase
    .from('shows')
    .select('*')
    .in('status', ['scheduled', 'live'])
    .order('scheduled_at', { ascending: true });

  const liveShows = (shows as Show[] | null)?.filter((s) => s.status === 'live') || [];
  const upcomingShows = (shows as Show[] | null)?.filter((s) => s.status === 'scheduled') || [];

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      {/* Header */}
      <header className="p-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-white hover:text-white/80 transition-colors">
          Live Shopping
        </Link>
        <Link
          href="/login"
          className="text-sm text-white/70 hover:text-white"
        >
          Host Login
        </Link>
      </header>

      {/* Live Now Section */}
      {liveShows.length > 0 && (
        <section className="px-4 py-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
            </span>
            Live Now
          </h2>
          <div className="space-y-4">
            {liveShows.map((show) => (
              <Link
                key={show.id}
                href={`/live/${show.id}`}
                className="block bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-2xl p-4 border border-pink-500/30 hover:border-pink-500/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <Badge variant="live" pulse>
                      LIVE
                    </Badge>
                    <h3 className="text-white font-semibold mt-2">
                      {show.title}
                    </h3>
                  </div>
                  <svg
                    className="w-6 h-6 text-white/50"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Upcoming Shows */}
      <section className="px-4 py-6">
        <h2 className="text-lg font-semibold text-white mb-4">
          Upcoming Shows
        </h2>
        {upcomingShows.length === 0 ? (
          <div className="text-center py-12 text-white/50">
            <svg
              className="w-16 h-16 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            <p>No upcoming shows scheduled</p>
            <p className="text-sm mt-1">Check back soon!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingShows.map((show) => (
              <Link
                key={show.id}
                href={`/live/${show.id}`}
                className="block bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <Badge variant="scheduled">Scheduled</Badge>
                    <h3 className="text-white font-medium mt-2">
                      {show.title}
                    </h3>
                    <p className="text-white/60 text-sm mt-1">
                      {formatDate(show.scheduled_at)}
                    </p>
                  </div>
                  <svg
                    className="w-5 h-5 text-white/40"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
