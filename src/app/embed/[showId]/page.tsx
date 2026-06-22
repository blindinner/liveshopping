'use client';

import { useEffect, useState, useCallback } from 'react';
import { VideoPlayer } from '@/components/viewer/VideoPlayer';
import { ProductCard } from '@/components/viewer/ProductCard';
import { ProductTray } from '@/components/viewer/ProductTray';
import { CartDrawer } from '@/components/viewer/CartDrawer';
import { Countdown } from '@/components/viewer/Countdown';
import {
  useShowProducts,
  useViewerPresence,
  useShowStatus,
} from '@/hooks/useRealtime';
import { useCart } from '@/hooks/useCart';
import type { ShowProduct } from '@/types/database';
import { useParams, useSearchParams } from 'next/navigation';

export default function EmbedLiveViewerPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const showId = params.showId as string;

  // Configuration from URL params
  const locale = (searchParams.get('locale') || 'en') as 'he' | 'en';

  // Generate viewer ID (persisted in memory for the session)
  const [viewerId] = useState(() => `embed-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ShowProduct | null>(null);

  // Real-time hooks
  const { show, isLoading: showLoading } = useShowStatus(showId);
  const { products, activeProduct } = useShowProducts(showId);
  const { viewerCount } = useViewerPresence(showId, viewerId);

  // Cart hook - pass showId and viewerId for analytics tracking
  const {
    cart,
    itemCount,
    total,
    isLoading: cartLoading,
    addToCart,
    updateQuantity,
    removeFromCart,
    checkout,
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

  // Handle add to cart (no lead capture in embed)
  const handleAddToCart = useCallback(
    async (showProduct: ShowProduct) => {
      if (showProduct.product) {
        await addToCart(showProduct.product);
      }
    },
    [addToCart]
  );

  // Handle checkout - open in popup so stream keeps playing
  const handleCheckout = useCallback(() => {
    if (cart.checkoutUrl) {
      const width = 450;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      window.open(
        cart.checkoutUrl,
        'shopify-checkout',
        `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
      );
    }
  }, [cart.checkoutUrl]);

  // Handle product selection from tray
  const handleSelectProduct = (product: ShowProduct) => {
    setSelectedProduct(product);
  };

  // Update selected product when active product changes
  useEffect(() => {
    setSelectedProduct(activeProduct);
  }, [activeProduct]);

  // Translations
  const t = {
    he: {
      loading: 'Loading...',
      showEnded: 'Show ended',
      checkout: 'Checkout',
    },
    en: {
      loading: 'Loading...',
      showEnded: 'Show ended',
      checkout: 'Checkout',
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
        <h1 className="text-2xl font-bold text-white mb-2">{show.title}</h1>
        <div className="mt-8">
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
          className="w-16 h-16 text-white/40 mb-4"
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
        <h1 className="text-xl font-bold text-white mb-2">{show.title}</h1>
        <p className="text-white/60">{t.showEnded}</p>
      </div>
    );
  }

  // Live state - simplified embed view
  return (
    <div className="fixed inset-0 bg-black">
      {/* Video Player (full screen background) */}
      <VideoPlayer
        playbackId={show.cloudflare_playback_id}
        isLive={show.status === 'live'}
        viewerCount={viewerCount}
        locale={locale}
      />

      {/* Active product card */}
      {selectedProduct?.product && (
        <ProductCard
          product={selectedProduct.product}
          onAddToCart={() => handleAddToCart(selectedProduct)}
          isLoading={cartLoading}
          locale={locale}
        />
      )}

      {/* Product tray */}
      <ProductTray
        products={products}
        onSelectProduct={handleSelectProduct}
        locale={locale}
      />

      {/* Cart button */}
      <button
        onClick={() => setIsCartOpen(true)}
        className="absolute top-4 start-4 p-3 bg-white/10 backdrop-blur-sm rounded-full z-20 pointer-events-auto"
      >
        <div className="relative">
          <svg
            className="w-6 h-6 text-white"
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
            <span className="absolute -top-2 -end-2 bg-pink-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
              {itemCount}
            </span>
          )}
        </div>
      </button>

      {/* Checkout floating button when cart has items */}
      {itemCount > 0 && !isCartOpen && (
        <button
          onClick={handleCheckout}
          className="absolute top-4 start-16 px-4 py-2 bg-pink-500 text-white font-semibold rounded-full text-sm z-20 pointer-events-auto"
        >
          {t.checkout} ({itemCount})
        </button>
      )}

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
