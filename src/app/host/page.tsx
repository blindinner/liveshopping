'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { ShowTypeToggle } from '@/components/host/ShowTypeToggle';
import type { Show, AuctionType } from '@/types/database';

const CLOUDFLARE_SUBDOMAIN = process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID || 'f83anpt0jiknxr1e';

interface ShowWithAnalytics extends Show {
  analytics: {
    viewers: number;
    peakViewers: number;
    chatMessages: number;
    reactions: number;
    addToCarts: number;
    orders: number;
    revenue: number;
  };
}

function getShowThumbnail(show: Show): string | null {
  if (show.cloudflare_stream_id) {
    return `https://customer-${CLOUDFLARE_SUBDOMAIN}.cloudflarestream.com/${show.cloudflare_stream_id}/thumbnails/thumbnail.jpg?time=10s&width=640`;
  }
  return null;
}

function formatCurrency(amount: number): string {
  if (amount === 0) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function LiveShoppingContent() {
  const [shows, setShows] = useState<ShowWithAnalytics[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newShowTitle, setNewShowTitle] = useState('');
  const [newShowDate, setNewShowDate] = useState('');
  const [newShowType, setNewShowType] = useState<AuctionType>('public');
  const [brandId, setBrandId] = useState<string | null>(null);
  const [justInstalled, setJustInstalled] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    loadShows();
    loadBrand();

    if (searchParams.get('installed') === 'true') {
      setJustInstalled(true);
      window.history.replaceState({}, '', '/host');
    }
  }, [searchParams]);

  const loadBrand = async () => {
    const response = await fetch('/api/brands');
    const data = await response.json();
    if (data.brands?.[0]) {
      setBrandId(data.brands[0].id);
    }
  };

  const loadShows = async () => {
    try {
      const response = await fetch('/api/shows');
      const data = await response.json();
      setShows(data.shows || []);
    } catch (error) {
      console.error('Failed to load shows:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateShow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShowTitle || !newShowDate || !brandId) return;

    setIsCreating(true);
    try {
      const response = await fetch('/api/shows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newShowTitle,
          scheduledAt: new Date(newShowDate).toISOString(),
          brandId,
          auctionType: newShowType,
        }),
      });

      if (response.ok) {
        const { show } = await response.json();
        router.push(`/host/${show.id}`);
      }
    } catch (error) {
      console.error('Failed to create show:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'live':
        return <Badge variant="live" pulse>LIVE</Badge>;
      case 'scheduled':
        return <Badge variant="scheduled">Scheduled</Badge>;
      case 'ended':
        return <Badge variant="ended">Ended</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl">
      {/* Success Toast */}
      {justInstalled && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in">
          Shopify store connected successfully!
        </div>
      )}

      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Live Shopping</h1>
        <p className="text-white/60 mt-1">Start live streams and manage your sessions</p>
      </div>

      {/* Create New Show */}
      <section className="bg-white/5 rounded-2xl p-4 md:p-6 border border-white/10 mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">Start New Stream</h2>
        <form onSubmit={handleCreateShow} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              name="title"
              label="Show Title"
              placeholder="e.g., Summer Sale 2024"
              value={newShowTitle}
              onChange={(e) => setNewShowTitle(e.target.value)}
              required
            />
            <Input
              name="scheduled_at"
              label="Date & Time"
              type="datetime-local"
              value={newShowDate}
              onChange={(e) => setNewShowDate(e.target.value)}
              required
              dir="ltr"
            />
          </div>
          <ShowTypeToggle value={newShowType} onChange={setNewShowType} />
          <Button
            type="submit"
            isLoading={isCreating}
            disabled={!newShowTitle || !newShowDate || !brandId}
          >
            Create Show
          </Button>
        </form>
      </section>

      {/* Shows List */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-4">Previous Sessions</h2>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto" />
          </div>
        ) : shows.length === 0 ? (
          <div className="text-center py-12 text-white/50 bg-white/5 rounded-2xl border border-white/10">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-white/5 flex items-center justify-center">
              <svg className="w-6 h-6 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M13 12a1 1 0 11-2 0 1 1 0 012 0z" />
              </svg>
            </div>
            <p>No live sessions yet</p>
            <p className="text-sm mt-1">Create your first show above</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {shows.map((show) => (
              <Link
                key={show.id}
                href={`/host/${show.id}`}
                className="group block bg-white/5 rounded-xl overflow-hidden hover:bg-white/10 transition-colors border border-white/10"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video bg-black">
                  {getShowThumbnail(show) ? (
                    <Image
                      src={getShowThumbnail(show)!}
                      alt={show.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-pink-500/20 to-purple-500/20">
                      <svg className="w-12 h-12 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  {/* Status badge overlay */}
                  <div className="absolute top-2 left-2">
                    {getStatusBadge(show.status)}
                  </div>
                  {/* Duration for ended shows */}
                  {show.status === 'ended' && show.started_at && show.ended_at && (
                    <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/70 text-white text-xs rounded">
                      {Math.round((new Date(show.ended_at).getTime() - new Date(show.started_at).getTime()) / 60000)}m
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-3">
                  <h3 className="text-white font-medium truncate">{show.title}</h3>
                  <p className="text-white/50 text-sm mt-1">
                    {formatDate(show.scheduled_at)}
                  </p>

                  {/* Analytics Row - only for ended or live shows */}
                  {(show.status === 'ended' || show.status === 'live') && (
                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/10">
                      {/* Viewers */}
                      <div className="flex items-center gap-1.5 text-white/60">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-xs">{show.analytics.viewers}</span>
                      </div>
                      {/* Chat messages */}
                      <div className="flex items-center gap-1.5 text-white/60">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span className="text-xs">{show.analytics.chatMessages}</span>
                      </div>
                      {/* Add to carts */}
                      <div className="flex items-center gap-1.5 text-white/60">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span className="text-xs">{show.analytics.addToCarts}</span>
                      </div>
                      {/* Revenue */}
                      {show.analytics.revenue > 0 && (
                        <div className="flex items-center gap-1.5 text-green-400 ml-auto">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-xs font-medium">{formatCurrency(show.analytics.revenue)}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default function LiveShoppingPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full" />
      </div>
    }>
      <LiveShoppingContent />
    </Suspense>
  );
}
