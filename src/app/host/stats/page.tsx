'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// Generate thumbnail URL from cloudflare_stream_id
const CLOUDFLARE_SUBDOMAIN = process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID || 'f83anpt0jiknxr1e';

function getVideoThumbnailUrl(cloudflareStreamId: string | null, thumbnailUrl: string | null): string | null {
  if (cloudflareStreamId) {
    return `https://customer-${CLOUDFLARE_SUBDOMAIN}.cloudflarestream.com/${cloudflareStreamId}/thumbnails/thumbnail.jpg?time=1s&width=640`;
  }
  return thumbnailUrl;
}

interface Stats {
  liveShows: {
    totalShows: number;
    completedShows: number;
    totalViewers: number;
    totalChatMessages: number;
    totalReactions: number;
    totalProductViews: number;
    totalAddToCarts: number;
    totalCheckouts: number;
    totalOrders: number;
    totalRevenue: number;
    addToCartValue: number;
  };
  videos: {
    totalVideos: number;
    publishedVideos: number;
    totalViews: number;
    uniqueViewers: number;
    totalProductClicks: number;
    totalAddToCarts: number;
    totalCheckouts: number;
    totalOrders: number;
    totalRevenue: number;
    addToCartValue: number;
  };
  combined: {
    totalRevenue: number;
    totalOrders: number;
    totalAddToCarts: number;
    totalCheckouts: number;
    totalEngagements: number;
  };
  conversionRates: {
    liveShows: {
      viewerToCart: string;
      cartToCheckout: string;
      checkoutToOrder: string;
    };
    videos: {
      viewerToCart: string;
      cartToCheckout: string;
      checkoutToOrder: string;
    };
  };
  topShows: Array<{
    id: string;
    title: string;
    status: string;
    scheduledAt: string;
    viewers: number;
    revenue: number;
    orders: number;
    engagement: number;
  }>;
  topVideos: Array<{
    id: string;
    title: string;
    thumbnailUrl: string | null;
    cloudflareStreamId: string | null;
    isPublished: boolean;
    views: number;
    productClicks: number;
    addToCarts: number;
    revenue: number;
    orders: number;
  }>;
  cartSessions: {
    totalSessions: number;
    convertedSessions: number;
    conversionRate: string;
    attributedRevenue: number;
  };
}

function StatCard({ label, value, subValue, icon, trend }: {
  label: string;
  value: string | number;
  subValue?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
}) {
  return (
    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
      <div className="flex items-start justify-between">
        <div className="p-2 rounded-lg bg-white/5">
          {icon}
        </div>
        {trend && (
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            trend === 'up' ? 'bg-green-500/20 text-green-400' :
            trend === 'down' ? 'bg-red-500/20 text-red-400' :
            'bg-white/10 text-white/50'
          }`}>
            {trend === 'up' ? '+' : trend === 'down' ? '-' : '~'}
          </span>
        )}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-sm text-white/50 mt-0.5">{label}</p>
        {subValue && (
          <p className="text-xs text-white/40 mt-1">{subValue}</p>
        )}
      </div>
    </div>
  );
}

function ConversionFunnel({ title, stages }: {
  title: string;
  stages: Array<{ label: string; value: number; rate?: string }>;
}) {
  const maxValue = Math.max(...stages.map(s => s.value), 1);

  return (
    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
      <h3 className="text-sm font-semibold text-white mb-4">{title}</h3>
      <div className="space-y-3">
        {stages.map((stage, idx) => (
          <div key={stage.label}>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-white/70">{stage.label}</span>
              <span className="text-white font-medium">{stage.value}</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full transition-all"
                style={{ width: `${(stage.value / maxValue) * 100}%` }}
              />
            </div>
            {stage.rate && idx > 0 && (
              <p className="text-xs text-white/40 mt-1">{stage.rate}% conversion</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await fetch('/api/stats');
        if (!response.ok) throw new Error('Failed to load stats');
        const data = await response.json();
        setStats(data);
      } catch (err) {
        console.error('Failed to load stats:', err);
        setError('Failed to load statistics');
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-4 md:p-6">
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-center">
          <p className="text-red-400">{error || 'Failed to load statistics'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Statistics</h1>
        <p className="text-white/60 mt-1">Overview of your live shopping and video performance</p>
      </div>

      {/* Combined Overview */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">Overall Performance</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Total Revenue"
            value={formatCurrency(stats.combined.totalRevenue)}
            subValue={`${stats.combined.totalOrders} orders`}
            icon={
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            label="Total Viewers"
            value={formatNumber(stats.combined.totalEngagements)}
            subValue="Unique across all content"
            icon={
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            }
          />
          <StatCard
            label="Add to Carts"
            value={formatNumber(stats.combined.totalAddToCarts)}
            subValue={`${stats.combined.totalCheckouts} checkouts`}
            icon={
              <svg className="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
          />
          <StatCard
            label="Cart Sessions"
            value={`${stats.cartSessions.conversionRate}%`}
            subValue={`${stats.cartSessions.convertedSessions}/${stats.cartSessions.totalSessions} converted`}
            icon={
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
          />
        </div>
      </section>

      {/* Two Column Layout for Live Shows and Videos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Live Shows Stats */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M13 12a1 1 0 11-2 0 1 1 0 012 0z" />
            </svg>
            <h2 className="text-lg font-semibold text-white">Live Shopping</h2>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
              <p className="text-xl font-bold text-white">{stats.liveShows.totalShows}</p>
              <p className="text-xs text-white/50">Total Shows</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
              <p className="text-xl font-bold text-white">{stats.liveShows.totalViewers}</p>
              <p className="text-xs text-white/50">Total Viewers</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
              <p className="text-xl font-bold text-white">{formatCurrency(stats.liveShows.totalRevenue)}</p>
              <p className="text-xs text-white/50">Revenue</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
              <p className="text-xl font-bold text-white">{stats.liveShows.totalOrders}</p>
              <p className="text-xs text-white/50">Orders</p>
            </div>
          </div>

          <ConversionFunnel
            title="Live Show Funnel"
            stages={[
              { label: 'Viewers', value: stats.liveShows.totalViewers },
              { label: 'Add to Cart', value: stats.liveShows.totalAddToCarts, rate: stats.conversionRates.liveShows.viewerToCart },
              { label: 'Checkout', value: stats.liveShows.totalCheckouts, rate: stats.conversionRates.liveShows.cartToCheckout },
              { label: 'Orders', value: stats.liveShows.totalOrders, rate: stats.conversionRates.liveShows.checkoutToOrder },
            ]}
          />

          {/* Engagement Stats */}
          <div className="mt-4 bg-white/5 rounded-xl p-4 border border-white/10">
            <h3 className="text-sm font-semibold text-white mb-3">Engagement</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <p className="text-lg font-bold text-white">{stats.liveShows.totalChatMessages}</p>
                <p className="text-xs text-white/50">Chat Messages</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-white">{stats.liveShows.totalReactions}</p>
                <p className="text-xs text-white/50">Reactions</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-white">{stats.liveShows.totalProductViews}</p>
                <p className="text-xs text-white/50">Product Views</p>
              </div>
            </div>
          </div>
        </section>

        {/* Video Stats */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <h2 className="text-lg font-semibold text-white">Shoppable Videos</h2>
          </div>

          {/* Video Thumbnails Preview */}
          {stats.topVideos.length > 0 && (
            <div className="mb-4 bg-white/5 rounded-xl p-3 border border-white/10">
              <div className="flex gap-2 overflow-x-auto pb-1">
                {stats.topVideos.slice(0, 5).map((video) => (
                  <Link
                    key={video.id}
                    href={`/host/videos/${video.id}/edit`}
                    className="relative shrink-0 w-16 h-24 rounded-lg overflow-hidden bg-black group"
                  >
                    {getVideoThumbnailUrl(video.cloudflareStreamId, video.thumbnailUrl) ? (
                      <Image
                        src={getVideoThumbnailUrl(video.cloudflareStreamId, video.thumbnailUrl)!}
                        alt={video.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/5">
                        <svg className="w-6 h-6 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        </svg>
                      </div>
                    )}
                    {/* Views badge */}
                    <div className="absolute bottom-1 left-1 right-1 bg-black/70 rounded px-1 py-0.5">
                      <p className="text-[10px] text-white text-center truncate">{video.views} views</p>
                    </div>
                  </Link>
                ))}
                {stats.videos.totalVideos > 5 && (
                  <Link
                    href="/host/videos"
                    className="shrink-0 w-16 h-24 rounded-lg bg-white/5 border border-white/10 flex flex-col items-center justify-center hover:bg-white/10 transition-colors"
                  >
                    <span className="text-white/70 text-sm font-medium">+{stats.videos.totalVideos - 5}</span>
                    <span className="text-white/40 text-[10px]">more</span>
                  </Link>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
              <p className="text-xl font-bold text-white">{stats.videos.totalVideos}</p>
              <p className="text-xs text-white/50">Total Videos</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
              <p className="text-xl font-bold text-white">{stats.videos.totalViews}</p>
              <p className="text-xs text-white/50">Total Views</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
              <p className="text-xl font-bold text-white">{formatCurrency(stats.videos.totalRevenue)}</p>
              <p className="text-xs text-white/50">Revenue</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
              <p className="text-xl font-bold text-white">{stats.videos.totalOrders}</p>
              <p className="text-xs text-white/50">Orders</p>
            </div>
          </div>

          <ConversionFunnel
            title="Video Funnel"
            stages={[
              { label: 'Views', value: stats.videos.totalViews },
              { label: 'Product Clicks', value: stats.videos.totalProductClicks },
              { label: 'Add to Cart', value: stats.videos.totalAddToCarts, rate: stats.conversionRates.videos.viewerToCart },
              { label: 'Checkout', value: stats.videos.totalCheckouts, rate: stats.conversionRates.videos.cartToCheckout },
              { label: 'Orders', value: stats.videos.totalOrders, rate: stats.conversionRates.videos.checkoutToOrder },
            ]}
          />
        </section>
      </div>

      {/* Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Shows */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-4">Top Live Shows</h2>
          {stats.topShows.length === 0 ? (
            <div className="bg-white/5 rounded-xl p-6 border border-white/10 text-center">
              <p className="text-white/50">No shows yet</p>
              <Link href="/host" className="text-pink-400 text-sm hover:text-pink-300 mt-2 inline-block">
                Create your first show
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.topShows.map((show, idx) => (
                <Link
                  key={show.id}
                  href={`/host/${show.id}`}
                  className="flex items-center gap-3 bg-white/5 rounded-xl p-3 border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-400 font-bold text-sm">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{show.title}</p>
                    <p className="text-white/50 text-xs">
                      {show.viewers} viewers · {show.engagement} engagements
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-medium">{formatCurrency(show.revenue)}</p>
                    <p className="text-white/50 text-xs">{show.orders} orders</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Top Videos */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-4">Top Shoppable Videos</h2>
          {stats.topVideos.length === 0 ? (
            <div className="bg-white/5 rounded-xl p-6 border border-white/10 text-center">
              <p className="text-white/50">No videos yet</p>
              <Link href="/host/videos/new" className="text-pink-400 text-sm hover:text-pink-300 mt-2 inline-block">
                Upload your first video
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.topVideos.map((video, idx) => (
                <Link
                  key={video.id}
                  href={`/host/videos/${video.id}/edit`}
                  className="flex items-center gap-3 bg-white/5 rounded-xl p-3 border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-black shrink-0">
                    {getVideoThumbnailUrl(video.cloudflareStreamId, video.thumbnailUrl) ? (
                      <Image
                        src={getVideoThumbnailUrl(video.cloudflareStreamId, video.thumbnailUrl)!}
                        alt={video.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/5">
                        <span className="text-pink-400 font-bold text-sm">{idx + 1}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{video.title}</p>
                    <p className="text-white/50 text-xs">
                      {video.views} views · {video.productClicks} clicks
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-medium">{formatCurrency(video.revenue)}</p>
                    <p className="text-white/50 text-xs">{video.orders} orders</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
