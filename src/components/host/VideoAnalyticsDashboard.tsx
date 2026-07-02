'use client';

import { useVideoAnalytics } from '@/hooks/useVideoAnalytics';

interface VideoAnalyticsDashboardProps {
  videoId: string;
}

interface MetricCardProps {
  label: string;
  value: number | string;
  subValue?: string;
  icon: React.ReactNode;
  highlight?: boolean;
}

function MetricCard({ label, value, subValue, icon, highlight }: MetricCardProps) {
  return (
    <div
      className={`rounded-xl p-3 ${
        highlight ? 'bg-pink-500/20 border border-pink-500/30' : 'bg-white/5'
      }`}
    >
      <div className="flex items-center gap-2 text-white/60 text-xs mb-1">
        {icon}
        <span>{label}</span>
      </div>
      <div
        className={`text-xl font-bold ${
          highlight ? 'text-pink-400' : 'text-white'
        }`}
      >
        {value}
      </div>
      {subValue && (
        <div className="text-white/40 text-xs mt-0.5">{subValue}</div>
      )}
    </div>
  );
}

// Icons
const EyeIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
    <path
      fillRule="evenodd"
      d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
      clipRule="evenodd"
    />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
    />
  </svg>
);

const CreditCardIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
    />
  </svg>
);

const DollarIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const PlayIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
    <path
      fillRule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
      clipRule="evenodd"
    />
  </svg>
);

const ClickIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
    />
  </svg>
);

function formatCurrency(amount: number, currency: string = 'ILS'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function VideoAnalyticsDashboard({ videoId }: VideoAnalyticsDashboardProps) {
  const { metrics, isLoading } = useVideoAnalytics(videoId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <section className="bg-white/5 rounded-2xl p-4">
          <div className="h-5 w-24 bg-white/10 rounded animate-pulse mb-4" />
          <div className="grid grid-cols-2 gap-3">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="bg-white/5 rounded-xl p-3 animate-pulse h-16" />
            ))}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Views Section */}
      <section className="bg-white/5 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <PlayIcon />
          <h2 className="text-base font-semibold text-white">Video Performance</h2>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <MetricCard
            label="Video Views"
            value={metrics.videoViews}
            icon={<EyeIcon />}
            highlight={metrics.videoViews > 0}
          />
          <MetricCard
            label="Unique Viewers"
            value={metrics.uniqueViewers}
            icon={<UsersIcon />}
          />
          <MetricCard
            label="Product Clicks"
            value={metrics.productClickCount}
            subValue={`${metrics.uniqueProductClickViewers} viewers`}
            icon={<ClickIcon />}
            highlight={metrics.productClickCount > 0}
          />
        </div>
      </section>

      {/* Sales Section */}
      <section className="bg-white/5 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <DollarIcon />
          <h2 className="text-base font-semibold text-white">Sales</h2>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <MetricCard
            label="Orders"
            value={metrics.salesCount}
            icon={<CreditCardIcon />}
            highlight={metrics.salesCount > 0}
          />
          <MetricCard
            label="Revenue"
            value={formatCurrency(metrics.totalRevenue, metrics.currency)}
            icon={<DollarIcon />}
            highlight={metrics.totalRevenue > 0}
          />
        </div>
      </section>


      {/* Empty state */}
      {metrics.videoViews === 0 && metrics.productClickCount === 0 && metrics.salesCount === 0 && (
        <div className="text-center text-white/40 py-8 text-sm">
          No analytics data yet. Share your video to start tracking!
        </div>
      )}
    </div>
  );
}
