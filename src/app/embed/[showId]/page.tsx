'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { VideoPlayer } from '@/components/viewer/VideoPlayer';
import { CartDrawer } from '@/components/viewer/CartDrawer';
import { PollCard, PollButton } from '@/components/viewer/PollCard';
import { Countdown } from '@/components/viewer/Countdown';
import {
  useShowProducts,
  useViewerPresence,
  useShowStatus,
} from '@/hooks/useRealtime';
import { useCart } from '@/hooks/useCart';
import { useActivePoll } from '@/hooks/usePolls';
import type { Product } from '@/types/database';
import { useParams, useSearchParams } from 'next/navigation';

// Instagram-style product card for mobile
function MobileProductCard({
  product,
  onAction,
  isLoading,
  locale,
}: {
  product: Product;
  onAction: () => void;
  isLoading: boolean;
  locale: 'he' | 'en';
}) {
  const isRTL = locale === 'he';
  const isManualProduct = product.source === 'manual';

  const t = {
    he: {
      buyNow: 'קנה עכשיו',
      addToCart: 'הוסף לסל',
    },
    en: {
      buyNow: 'Buy Now',
      addToCart: 'Add to Cart',
    },
  }[locale];

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat(locale === 'he' ? 'he-IL' : 'en-US', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  return (
    <div
      className="flex items-center gap-3 p-3 bg-black/70 backdrop-blur-md rounded-2xl border border-white/20"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Product image */}
      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-white/10 shrink-0">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/40">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Product info */}
      <div className="flex-1 min-w-0">
        <h3 className="text-white font-medium text-sm leading-tight line-clamp-2">
          {product.title}
        </h3>
        <p className="text-pink-400 font-bold text-base mt-0.5">
          {formatPrice(product.price, product.currency)}
        </p>
      </div>

      {/* Action button */}
      <button
        onClick={onAction}
        disabled={isLoading}
        className="shrink-0 px-4 py-2 bg-pink-500 hover:bg-pink-600 active:bg-pink-700 disabled:opacity-50 text-white font-semibold text-sm rounded-full transition-colors"
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : isManualProduct ? (
          t.buyNow
        ) : (
          t.addToCart
        )}
      </button>
    </div>
  );
}

export default function EmbedLiveViewerPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const showId = params.showId as string;

  // Configuration from URL params
  const locale = (searchParams.get('locale') || 'en') as 'he' | 'en';

  // Generate viewer ID (persisted in memory for the session)
  const [viewerId] = useState(() => `embed-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isPollOpen, setIsPollOpen] = useState(false);

  // Real-time hooks
  const { show, isLoading: showLoading } = useShowStatus(showId);
  const { activeProduct } = useShowProducts(showId);
  const { viewerCount } = useViewerPresence(showId, viewerId);
  const { activePoll, hasVoted, submitVote } = useActivePoll(showId, viewerId);

  // Cart hook - pass showId and viewerId for analytics tracking
  const {
    cart,
    itemCount,
    total,
    isLoading: cartLoading,
    addToCart,
    updateQuantity,
    removeFromCart,
  } = useCart({ showId, viewerId });

  // Track viewer_join event when viewer loads the live show
  useEffect(() => {
    if (show?.status === 'live') {
      fetch(`/api/shows/${showId}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: 'viewer_join',
          viewerId,
        }),
      }).catch((err) => console.error('Failed to track viewer_join:', err));
    }
  }, [show?.status, showId, viewerId]);

  // Handle product action (add to cart or buy now)
  const handleProductAction = useCallback(
    async (product: Product) => {
      if (product.source === 'manual' && product.checkout_url) {
        // Open checkout URL in new tab for manual products
        window.open(product.checkout_url, '_blank', 'noopener,noreferrer');
      } else {
        // Add to cart for Shopify products
        await addToCart(product);
      }
    },
    [addToCart]
  );

  // Handle checkout - open in new tab on mobile
  const handleCheckout = useCallback(() => {
    if (cart.checkoutUrl) {
      window.open(cart.checkoutUrl, '_blank', 'noopener,noreferrer');
    }
  }, [cart.checkoutUrl]);

  // Translations
  const t = {
    he: {
      loading: 'טוען...',
      showEnded: 'השידור הסתיים',
      checkout: 'לתשלום',
      live: 'לייב',
    },
    en: {
      loading: 'Loading...',
      showEnded: 'Show ended',
      checkout: 'Checkout',
      live: 'LIVE',
    },
  }[locale];

  if (showLoading || !show) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full" />
      </div>
    );
  }

  // Pre-show state (scheduled)
  if (show.status === 'scheduled') {
    return (
      <div className="fixed inset-0 bg-gradient-to-b from-gray-900 to-black flex flex-col items-center justify-center p-6">
        <h1 className="text-xl font-bold text-white mb-2 text-center">{show.title}</h1>
        <div className="mt-6">
          <Countdown targetDate={new Date(show.scheduled_at)} locale={locale} />
        </div>
      </div>
    );
  }

  // Ended state
  if (show.status === 'ended') {
    return (
      <div className="fixed inset-0 bg-gradient-to-b from-gray-900 to-black flex flex-col items-center justify-center p-6">
        <svg
          className="w-12 h-12 text-white/40 mb-3"
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
        <h1 className="text-lg font-bold text-white mb-1">{show.title}</h1>
        <p className="text-white/60 text-sm">{t.showEnded}</p>
      </div>
    );
  }

  // Live state - Instagram-style mobile view
  return (
    <div className="fixed inset-0 bg-black flex flex-col">
      {/* Video Player (fills available space) */}
      <div className="flex-1 relative min-h-0">
        <VideoPlayer
          playbackId={show.cloudflare_playback_id}
          isLive={show.status === 'live'}
          viewerCount={viewerCount}
          locale={locale}
        />

        {/* Top bar - Live badge and cart */}
        <div className="absolute top-0 left-0 right-0 p-3 flex items-center justify-between z-20 pointer-events-none">
          {/* Live badge, viewer count, and poll button */}
          <div className="flex items-center gap-2 pointer-events-auto">
            <div className="flex items-center gap-1.5 px-2 py-1 bg-red-500 rounded-lg">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <span className="text-white text-xs font-bold">{t.live}</span>
            </div>
            {viewerCount > 0 && (
              <div className="flex items-center gap-1 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-lg">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
                <span className="text-white text-xs font-medium">{viewerCount}</span>
              </div>
            )}
            {activePoll && (
              <PollButton
                poll={activePoll}
                hasVoted={hasVoted}
                onClick={() => setIsPollOpen(true)}
                locale={locale}
              />
            )}
          </div>

          {/* Cart button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="p-2 bg-black/50 backdrop-blur-sm rounded-full pointer-events-auto"
          >
            <div className="relative">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-pink-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {itemCount}
                </span>
              )}
            </div>
          </button>
        </div>

      </div>

      {/* Poll modal */}
      {activePoll && isPollOpen && (
        <PollCard
          poll={activePoll}
          hasVoted={hasVoted}
          onVote={submitVote}
          onClose={() => setIsPollOpen(false)}
          locale={locale}
        />
      )}

      {/* Bottom section - Product card (Instagram-style) */}
      <div className="shrink-0 p-3 pb-safe space-y-2">
        {/* Product card */}
        {activeProduct?.product && (
          <MobileProductCard
            product={activeProduct.product}
            onAction={() => handleProductAction(activeProduct.product!)}
            isLoading={cartLoading}
            locale={locale}
          />
        )}

        {/* Checkout bar when cart has items */}
        {itemCount > 0 && (
          <button
            onClick={handleCheckout}
            className="w-full mt-2 py-3 bg-pink-500 hover:bg-pink-600 active:bg-pink-700 text-white font-semibold rounded-full text-sm transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {t.checkout} ({itemCount})
          </button>
        )}
      </div>

      {/* Cart drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart.items}
        total={total}
        currency={cart.items[0]?.product.currency || 'ILS'}
        onUpdateQuantity={updateQuantity}
        onRemove={removeFromCart}
        onCheckout={handleCheckout}
        isLoading={cartLoading}
        locale={locale}
      />
    </div>
  );
}
