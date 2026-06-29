'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useVideoProducts } from '@/hooks/useVideoProducts';
import { useCart } from '@/hooks/useCart';
import type { Product, VideoProduct } from '@/types/database';

interface ProductOverlayProps {
  videoId: string;
  currentTime?: number;
  videoDuration?: number;
  viewerId?: string;
  locale?: 'en' | 'he';
  onProductVisible?: (product: Product) => void;
}

export function ProductOverlay({
  videoId,
  currentTime = 0,
  videoDuration,
  viewerId,
  locale = 'en',
  onProductVisible,
}: ProductOverlayProps) {
  const [previousProductId, setPreviousProductId] = useState<string | null>(null);

  const { visibleProducts, currentProduct, allProducts } = useVideoProducts({
    videoId,
    currentTime,
    videoDuration,
  });

  const {
    addToCart,
    isLoading: cartLoading,
  } = useCart({ videoId, viewerId });

  // Track when product changes
  useEffect(() => {
    const product = currentProduct?.product;
    if (product && product.id !== previousProductId) {
      setPreviousProductId(product.id);
      onProductVisible?.(product);
    }
  }, [currentProduct, previousProductId, onProductVisible]);

  const handleProductAction = useCallback(
    async (product: Product) => {
      if (product.source === 'manual' && product.checkout_url) {
        window.open(product.checkout_url, '_blank', 'noopener,noreferrer');
      } else {
        await addToCart(product);
      }
    },
    [addToCart]
  );

  const t = {
    he: { buyNow: 'קנה עכשיו', addToCart: 'הוסף לסל' },
    en: { buyNow: 'Buy Now', addToCart: 'Add to Cart' },
  }[locale];

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat(locale === 'he' ? 'he-IL' : 'en-US', {
      style: 'currency',
      currency,
    }).format(price);
  };

  // Single product - always show
  if (allProducts.length === 1 && allProducts[0]?.product) {
    const product = allProducts[0].product;
    return (
      <ProductCard
        product={product}
        onAction={() => handleProductAction(product)}
        isLoading={cartLoading}
        formatPrice={formatPrice}
        t={t}
        locale={locale}
      />
    );
  }

  // Multiple products - show based on timestamp with animation
  if (!currentProduct?.product) {
    return null;
  }

  return (
    <div className="animate-fadeIn">
      <ProductCard
        product={currentProduct.product}
        onAction={() => handleProductAction(currentProduct.product!)}
        isLoading={cartLoading}
        formatPrice={formatPrice}
        t={t}
        locale={locale}
        showTimestamp
        currentTime={currentTime}
        startTime={currentProduct.start_time_seconds}
        endTime={currentProduct.end_time_seconds}
        duration={videoDuration}
      />
    </div>
  );
}

interface ProductCardProps {
  product: Product;
  onAction: () => void;
  isLoading: boolean;
  formatPrice: (price: number, currency: string) => string;
  t: { buyNow: string; addToCart: string };
  locale: 'en' | 'he';
  showTimestamp?: boolean;
  currentTime?: number;
  startTime?: number;
  endTime?: number | null;
  duration?: number;
}

function ProductCard({
  product,
  onAction,
  isLoading,
  formatPrice,
  t,
  locale,
  showTimestamp,
  currentTime = 0,
  startTime = 0,
  endTime,
  duration,
}: ProductCardProps) {
  const isRTL = locale === 'he';
  const isManualProduct = product.source === 'manual';

  // Calculate progress through this product's time window
  const getProgress = () => {
    if (!showTimestamp) return 100;
    const end = endTime ?? duration ?? Infinity;
    const windowDuration = end - startTime;
    if (windowDuration <= 0) return 100;
    const elapsed = currentTime - startTime;
    return Math.min(100, Math.max(0, (elapsed / windowDuration) * 100));
  };

  return (
    <div
      className="flex items-center gap-3 p-3 bg-black/70 backdrop-blur-md rounded-2xl border border-white/20"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Product image */}
      <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-white/10 shrink-0">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/40">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}

        {/* Time progress indicator */}
        {showTimestamp && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
            <div
              className="h-full bg-pink-500 transition-all duration-200"
              style={{ width: `${getProgress()}%` }}
            />
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

// CSS animation for fadeIn - add to globals.css if not present
// @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
// .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
