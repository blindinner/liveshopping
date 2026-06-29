'use client';

import { useEffect, useState, useCallback, use } from 'react';
import Image from 'next/image';
import { CartDrawer } from '@/components/viewer/CartDrawer';
import { useCart } from '@/hooks/useCart';
import type { Video, Product } from '@/types/database';
import { useSearchParams } from 'next/navigation';

// Product card for video embed
function ProductCard({
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

export default function EmbedVideoPage({ params }: { params: Promise<{ videoId: string }> }) {
  const { videoId } = use(params);
  const searchParams = useSearchParams();
  const locale = (searchParams.get('locale') || 'en') as 'he' | 'en';

  const [video, setVideo] = useState<Video | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Generate viewer ID for the session
  const [viewerId] = useState(() => `video-${Date.now()}-${Math.random().toString(36).slice(2)}`);

  // Cart hook
  const {
    cart,
    itemCount,
    total,
    isLoading: cartLoading,
    addToCart,
    updateQuantity,
    removeFromCart,
  } = useCart({ videoId, viewerId });

  useEffect(() => {
    const loadVideo = async () => {
      try {
        const response = await fetch(`/api/videos/${videoId}`);
        if (response.ok) {
          const { video } = await response.json();
          setVideo(video);

          // TODO: Add video analytics tracking
        }
      } catch (error) {
        console.error('Failed to load video:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadVideo();
  }, [videoId]);

  // Handle product action
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

  // Handle checkout
  const handleCheckout = useCallback(() => {
    if (cart.checkoutUrl) {
      window.open(cart.checkoutUrl, '_blank', 'noopener,noreferrer');
    }
  }, [cart.checkoutUrl]);

  const t = {
    he: {
      loading: 'טוען...',
      notFound: 'הסרטון לא נמצא',
      processing: 'הסרטון מעובד...',
      checkout: 'לתשלום',
    },
    en: {
      loading: 'Loading...',
      notFound: 'Video not found',
      processing: 'Video is processing...',
      checkout: 'Checkout',
    },
  }[locale];

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!video) {
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
        <p className="text-white/60 text-sm">{t.notFound}</p>
      </div>
    );
  }

  if (video.status !== 'ready') {
    return (
      <div className="fixed inset-0 bg-gradient-to-b from-gray-900 to-black flex flex-col items-center justify-center p-6">
        <div className="animate-spin w-12 h-12 border-2 border-white border-t-transparent rounded-full mb-4" />
        <p className="text-white/60 text-sm">{t.processing}</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black flex flex-col">
      {/* Video Player */}
      <div className="flex-1 relative min-h-0">
        <iframe
          src={`https://customer-${process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID || 'f83anpt0jiknxr1e'}.cloudflarestream.com/${video.cloudflare_playback_id}/iframe?autoplay=true&loop=true&muted=false&preload=auto`}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
        />

        {/* Cart button */}
        <div className="absolute top-3 right-3 z-20">
          <button
            onClick={() => setIsCartOpen(true)}
            className="p-2 bg-black/50 backdrop-blur-sm rounded-full"
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

      {/* Bottom section - Product card */}
      <div className="shrink-0 p-3 pb-safe space-y-2">
        {video.product && (
          <ProductCard
            product={video.product}
            onAction={() => handleProductAction(video.product!)}
            isLoading={cartLoading}
            locale={locale}
          />
        )}

        {/* Checkout bar when cart has items */}
        {itemCount > 0 && (
          <button
            onClick={handleCheckout}
            className="w-full py-3 bg-pink-500 hover:bg-pink-600 active:bg-pink-700 text-white font-semibold rounded-full text-sm transition-colors flex items-center justify-center gap-2"
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
