'use client';

import { useShowAnalytics, type ProductMetrics } from '@/hooks/useShowAnalytics';
import { useShowProducts } from '@/hooks/useRealtime';

interface MetricsDashboardProps {
  showId: string;
  viewerCount: number;
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

// Icon components
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

const ChatIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
    />
  </svg>
);

const HeartIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
    <path
      fillRule="evenodd"
      d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
      clipRule="evenodd"
    />
  </svg>
);

const CartIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
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

const TrendingIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
    />
  </svg>
);

const PercentIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
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

// Product performance row component
function ProductRow({
  metric,
  productName,
  currency
}: {
  metric: ProductMetrics;
  productName: string;
  currency: string;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
      <div className="flex-1 min-w-0">
        <div className="text-sm text-white truncate">{productName}</div>
        <div className="text-xs text-white/40">{metric.uniqueViewers} viewers</div>
      </div>
      <div className="flex items-center gap-4 ml-4">
        <div className="text-right">
          <div className="text-sm font-medium text-white">{metric.addToCartCount} added</div>
          <div className="text-xs text-white/40">
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency,
              minimumFractionDigits: 0,
            }).format(metric.addToCartValue)}
          </div>
        </div>
        <div className="text-right">
          <div className={`text-sm font-medium ${metric.purchaseCount > 0 ? 'text-green-400' : 'text-white/40'}`}>
            {metric.purchaseCount} sold
          </div>
          <div className="text-xs text-white/40">
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency,
              minimumFractionDigits: 0,
            }).format(metric.purchaseValue)}
          </div>
        </div>
      </div>
    </div>
  );
}

const PackageIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
    />
  </svg>
);

export function MetricsDashboard({ showId, viewerCount }: MetricsDashboardProps) {
  const { metrics, productMetrics, isLoading } = useShowAnalytics(showId);
  const { products } = useShowProducts(showId);

  // Create a map of product IDs to names
  const productNames = new Map<string, string>();
  for (const showProduct of products) {
    if (showProduct.product) {
      productNames.set(showProduct.product.id, showProduct.product.title);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <section className="bg-white/5 rounded-2xl p-4">
          <div className="h-5 w-24 bg-white/10 rounded animate-pulse mb-4" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white/5 rounded-xl p-3 animate-pulse h-16" />
            ))}
          </div>
        </section>
        <section className="bg-white/5 rounded-2xl p-4">
          <div className="h-5 w-32 bg-white/10 rounded animate-pulse mb-4" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white/5 rounded-xl p-3 animate-pulse h-16" />
            ))}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Audience & Engagement Section */}
      <section className="bg-white/5 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <UsersIcon />
          <h2 className="text-base font-semibold text-white">Audience</h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricCard
            label="Live Now"
            value={viewerCount}
            icon={<EyeIcon />}
            highlight={viewerCount > 0}
          />
          <MetricCard
            label="Total Viewers"
            value={metrics.uniqueViewers}
            icon={<UsersIcon />}
          />
          <MetricCard
            label="Chat Messages"
            value={metrics.chatCount}
            icon={<ChatIcon />}
          />
          <MetricCard
            label="Reactions"
            value={metrics.reactionCount}
            icon={<HeartIcon />}
          />
        </div>
      </section>

      {/* Cart & Checkout Section */}
      <section className="bg-white/5 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <CartIcon />
          <h2 className="text-base font-semibold text-white">Sales & Conversion</h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Add to Cart */}
          <MetricCard
            label="Add to Cart"
            value={metrics.addToCartCount}
            subValue={`${metrics.uniqueAddToCartViewers} viewers`}
            icon={<CartIcon />}
          />
          <MetricCard
            label="Cart Value"
            value={formatCurrency(metrics.addToCartValue, metrics.currency)}
            subValue={`Avg: ${formatCurrency(metrics.averageCartValue, metrics.currency)}`}
            icon={<DollarIcon />}
          />

          {/* Checkout */}
          <MetricCard
            label="Checkouts"
            value={metrics.checkoutClickCount}
            subValue={`${metrics.uniqueCheckoutViewers} viewers`}
            icon={<CreditCardIcon />}
          />
          <MetricCard
            label="Checkout Value"
            value={formatCurrency(metrics.checkoutValue, metrics.currency)}
            icon={<DollarIcon />}
          />

          {/* Conversion Rates */}
          <MetricCard
            label="Viewer → Cart"
            value={`${metrics.viewerToCartRate.toFixed(1)}%`}
            icon={<TrendingIcon />}
          />
          <MetricCard
            label="Cart → Checkout"
            value={`${metrics.cartToCheckoutRate.toFixed(1)}%`}
            icon={<PercentIcon />}
          />

          {/* Sales */}
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

      {/* Product Performance Section */}
      {productMetrics.length > 0 && (
        <section className="bg-white/5 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <PackageIcon />
            <h2 className="text-base font-semibold text-white">Top Products</h2>
          </div>

          <div className="space-y-1">
            {productMetrics.slice(0, 5).map((metric) => (
              <ProductRow
                key={metric.productId}
                metric={metric}
                productName={productNames.get(metric.productId) || 'Unknown Product'}
                currency={metrics.currency}
              />
            ))}
          </div>

          {productMetrics.length === 0 && (
            <div className="text-center text-white/40 py-4 text-sm">
              No products added to cart yet
            </div>
          )}
        </section>
      )}
    </div>
  );
}
