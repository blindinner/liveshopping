'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { CartDrawer } from '@/components/viewer/CartDrawer';
import { useCart } from '@/hooks/useCart';
import { useVideoProducts } from '@/hooks/useVideoProducts';
import type { Video, Product } from '@/types/database';

interface VideoModalProps {
  video: Video;
  isOpen: boolean;
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

export function VideoModal({
  video,
  isOpen,
  onClose,
  onNext,
  onPrevious,
  hasNext = false,
  hasPrevious = false,
}: VideoModalProps) {
  const [currentTime, setCurrentTime] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Generate viewer ID for the session
  const [viewerId] = useState(
    () => `carousel-${Date.now()}-${Math.random().toString(36).slice(2)}`
  );

  // Get products for this video
  const { visibleProducts, currentProduct } = useVideoProducts({
    videoId: video.id,
    currentTime,
    videoDuration: video.duration_seconds || undefined,
  });

  // Cart hook
  const {
    cart,
    itemCount,
    total,
    isLoading: cartLoading,
    addToCart,
    updateQuantity,
    removeFromCart,
  } = useCart({ videoId: video.id, viewerId });

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && hasNext && onNext) onNext();
      if (e.key === 'ArrowLeft' && hasPrevious && onPrevious) onPrevious();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose, onNext, onPrevious, hasNext, hasPrevious]);

  // Handle product action - track click and redirect to product page with attribution params
  const handleProductAction = useCallback(
    async (product: Product) => {
      // Track product click event
      fetch(`/api/videos/${video.id}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: 'product_click',
          viewerId,
          productId: product.id,
          metadata: {
            product_title: product.title,
            price: product.price,
            currency: product.currency,
          },
        }),
      }).catch(console.error);

      // Build product URL with attribution params
      // Shopify captures these in landing_site field on orders
      let productUrl: string | null = null;
      if (product.checkout_url) {
        productUrl = product.checkout_url;
      } else if (product.handle) {
        productUrl = `https://${process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}/products/${product.handle}`;
      }

      if (productUrl) {
        const url = new URL(productUrl);
        url.searchParams.set('utm_source', 'shoppable_video');
        url.searchParams.set('utm_medium', 'video');
        url.searchParams.set('utm_campaign', video.id);
        url.searchParams.set('utm_content', product.id);
        url.searchParams.set('ssvid', video.id); // shoppable video id
        url.searchParams.set('ssvwr', viewerId); // viewer id

        window.open(url.toString(), '_blank', 'noopener,noreferrer');
      }
    },
    [video.id, viewerId]
  );

  // Handle checkout
  const handleCheckout = useCallback(() => {
    if (cart.checkoutUrl) {
      window.open(cart.checkoutUrl, '_blank', 'noopener,noreferrer');
    }
  }, [cart.checkoutUrl]);

  if (!isOpen) return null;

  const product = currentProduct?.product;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal container */}
      <div className="relative w-full max-w-md mx-4 aspect-[9/16] max-h-[90vh] bg-black rounded-2xl overflow-hidden shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-30 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Cart button */}
        <button
          onClick={() => setIsCartOpen(true)}
          className="absolute top-3 left-3 z-30 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
        >
          <div className="relative">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-pink-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {itemCount}
              </span>
            )}
          </div>
        </button>

        {/* Navigation arrows */}
        {hasPrevious && onPrevious && (
          <button
            onClick={onPrevious}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-30 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {hasNext && onNext && (
          <button
            onClick={onNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-30 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        {/* Video player */}
        <iframe
          ref={iframeRef}
          src={`https://customer-${process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID || 'f83anpt0jiknxr1e'}.cloudflarestream.com/${video.cloudflare_playback_id}/iframe?autoplay=true&loop=true&muted=false&preload=auto`}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
        />

        {/* Product overlay */}
        {product && (
          <div className="absolute bottom-0 left-0 right-0 p-3 z-20">
            <div className="flex items-center gap-3 p-3 bg-black/70 backdrop-blur-md rounded-2xl border border-white/20">
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Product info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-medium text-sm truncate">{product.title}</h3>
                <p className="text-pink-400 font-bold">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: product.currency,
                  }).format(product.price)}
                </p>
              </div>

              {/* Action button - all products now go directly to checkout */}
              <button
                onClick={() => handleProductAction(product)}
                disabled={cartLoading}
                className="shrink-0 px-4 py-2 bg-pink-500 hover:bg-pink-600 disabled:opacity-50 text-white font-semibold text-sm rounded-full transition-colors"
              >
                {cartLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Buy Now'
                )}
              </button>
            </div>

            {/* Checkout bar */}
            {itemCount > 0 && (
              <button
                onClick={handleCheckout}
                className="w-full mt-2 py-2.5 bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded-full text-sm transition-colors flex items-center justify-center gap-2"
              >
                Checkout ({itemCount})
              </button>
            )}
          </div>
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
        locale="en"
      />
    </div>
  );
}
