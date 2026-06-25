'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { VideoPlayer } from '@/components/viewer/VideoPlayer';
import { CartDrawer } from '@/components/viewer/CartDrawer';
import { PollCard, PollButton } from '@/components/viewer/PollCard';
import { Countdown } from '@/components/viewer/Countdown';
import { Chat } from '@/components/viewer/Chat';
import {
  useShowProducts,
  useViewerPresence,
  useChatMessages,
} from '@/hooks/useRealtime';
import { useCart } from '@/hooks/useCart';
import { useActivePoll } from '@/hooks/usePolls';
import type { Product, Show } from '@/types/database';
import { useParams, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

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

// Hook to find and subscribe to the current/next show for a brand
function useBrandShow(brandId: string) {
  const [show, setShow] = useState<Show | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function findShow() {
      // First, try to find a live show
      const { data: liveShow } = await supabase
        .from('shows')
        .select('*')
        .eq('brand_id', brandId)
        .eq('status', 'live')
        .limit(1)
        .single();

      if (liveShow) {
        setShow(liveShow);
        setIsLoading(false);
        return;
      }

      // If no live show, find the next scheduled show
      const { data: scheduledShow } = await supabase
        .from('shows')
        .select('*')
        .eq('brand_id', brandId)
        .eq('status', 'scheduled')
        .gte('scheduled_at', new Date().toISOString())
        .order('scheduled_at', { ascending: true })
        .limit(1)
        .single();

      setShow(scheduledShow || null);
      setIsLoading(false);
    }

    findShow();

    // Subscribe to show changes for this brand
    const channel = supabase
      .channel(`brand-shows:${brandId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'shows',
          filter: `brand_id=eq.${brandId}`,
        },
        async (payload) => {
          console.log('[Realtime] Show change detected:', payload);
          // Refetch the current show when any show changes
          await findShow();
        }
      )
      .subscribe((status) => {
        console.log('[Realtime] Brand shows subscription:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [brandId]);

  return { show, isLoading };
}

export default function BrandEmbedPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const brandId = params.brandId as string;

  // Configuration from URL params
  const locale = (searchParams.get('locale') || 'en') as 'he' | 'en';
  const isMiniMode = searchParams.get('mode') === 'mini';

  // Generate viewer ID (persisted in memory for the session)
  const [viewerId] = useState(() => `embed-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isPollOpen, setIsPollOpen] = useState(false);
  const [viewerName, setViewerName] = useState<string | null>(null);
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [showShareToast, setShowShareToast] = useState(false);

  // Find current/next show for this brand
  const { show, isLoading: showLoading } = useBrandShow(brandId);

  // Real-time hooks (only active when we have a show)
  const { activeProduct } = useShowProducts(show?.id || '');
  const { viewerCount } = useViewerPresence(show?.id || '', show ? viewerId : '');
  const { messages, sendMessage } = useChatMessages(show?.id || '', viewerId);
  const { activePoll, hasVoted, submitVote } = useActivePoll(show?.id || '', viewerId);

  // Cart hook
  const {
    cart,
    itemCount,
    total,
    isLoading: cartLoading,
    addToCart,
    updateQuantity,
    removeFromCart,
  } = useCart({ showId: show?.id || '', viewerId });

  // Track viewer_join event when viewer loads the live show
  useEffect(() => {
    if (show?.status === 'live') {
      fetch(`/api/shows/${show.id}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: 'viewer_join',
          viewerId,
        }),
      }).catch((err) => console.error('Failed to track viewer_join:', err));
    }
  }, [show?.status, show?.id, viewerId]);

  // Handle product action (add to cart or buy now)
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

  // Handle share
  const handleShare = useCallback(async () => {
    const shareUrl = window.location.href.split('?')[0]; // Remove query params

    // Check if native share is available (mobile)
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: show?.title || 'Live Shopping',
          url: shareUrl,
        });
        return; // Success - exit
      } catch {
        // User cancelled or not supported - fall through to clipboard
      }
    }

    // Desktop or share failed: copy to clipboard
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [show?.title]);

  // Handle chat send
  const handleSendMessage = useCallback((message: string) => {
    if (viewerName) {
      sendMessage(viewerName, message);
    }
  }, [viewerName, sendMessage]);

  // Handle name submission
  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nameInput.trim()) {
      setViewerName(nameInput.trim());
      setShowNamePrompt(false);
      setNameInput('');
    }
  };

  // Translations
  const t = {
    he: {
      loading: 'טוען...',
      showEnded: 'השידור הסתיים',
      checkout: 'לתשלום',
      live: 'לייב',
      noShows: 'אין שידורים קרובים',
      stayTuned: 'עקבו אחרינו לעדכונים',
      enterName: 'Enter your name to chat',
      yourName: 'Your name',
      join: 'Join',
      linkCopied: 'Link copied!',
    },
    en: {
      loading: 'Loading...',
      showEnded: 'Show ended',
      checkout: 'Checkout',
      live: 'LIVE',
      noShows: 'No upcoming shows',
      stayTuned: 'Stay tuned for updates',
      enterName: 'Enter your name to chat',
      yourName: 'Your name',
      join: 'Join',
      linkCopied: 'Link copied!',
    },
  }[locale];

  // Loading state
  if (showLoading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full" />
      </div>
    );
  }

  // No shows available
  if (!show) {
    return (
      <div className="fixed inset-0 bg-gradient-to-b from-gray-900 to-black flex flex-col items-center justify-center p-6">
        <svg
          className="w-12 h-12 text-white/30 mb-3"
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
        <p className="text-white/60 text-base font-medium">{t.noShows}</p>
        <p className="text-white/40 text-sm mt-1">{t.stayTuned}</p>
      </div>
    );
  }

  // Scheduled show - show countdown
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

  // Ended show (shouldn't happen often as we prioritize live/scheduled)
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
  // In mini mode, show only the video with VideoPlayer's built-in overlay (LIVE + viewer count)
  if (isMiniMode) {
    return (
      <div className="fixed inset-0 bg-black">
        <VideoPlayer
          playbackId={show.cloudflare_playback_id}
          isLive={show.status === 'live'}
          viewerCount={viewerCount}
          locale={locale}
        />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black">
      {/* Video Player (fills entire screen) */}
      <VideoPlayer
        playbackId={show.cloudflare_playback_id}
        isLive={show.status === 'live'}
        viewerCount={viewerCount}
        locale={locale}
        hideOverlay={true}
      />

      {/* Top bar - Viewer count and cart */}
      <div className="absolute top-0 left-0 right-0 p-3 flex items-center justify-between z-20 pointer-events-none">
        {/* Viewer count and poll button */}
        <div className="flex items-center gap-2 pointer-events-auto">
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

        {/* Action buttons */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Share button */}
          <button
            onClick={handleShare}
            className="p-2 bg-black/50 backdrop-blur-sm rounded-full"
          >
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
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
              />
            </svg>
          </button>

          {/* Cart button */}
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

      {/* Share toast notification */}
      {showShareToast && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 px-4 py-2 bg-black/80 backdrop-blur-sm rounded-full">
          <span className="text-white text-sm font-medium">{t.linkCopied}</span>
        </div>
      )}

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

      {/* Bottom overlays - Product card, checkout, and chat */}
      <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none flex flex-col">
        {/* Product card - only shows when product is featured */}
        {activeProduct?.product && (
          <div className="px-3 pb-2 pointer-events-auto">
            <MobileProductCard
              product={activeProduct.product}
              onAction={() => handleProductAction(activeProduct.product!)}
              isLoading={cartLoading}
              locale={locale}
            />
          </div>
        )}

        {/* Checkout bar when cart has items */}
        {itemCount > 0 && (
          <div className="px-3 pb-2 pointer-events-auto">
            <button
              onClick={handleCheckout}
              className="w-full py-3 bg-pink-500 hover:bg-pink-600 active:bg-pink-700 text-white font-semibold rounded-full text-sm transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {t.checkout} ({itemCount})
            </button>
          </div>
        )}

        {/* Chat overlay */}
        <div className="pointer-events-auto">
          <Chat
            messages={messages}
            onSendMessage={handleSendMessage}
            viewerName={viewerName}
            onRequestName={() => setShowNamePrompt(true)}
            locale={locale}
          />
        </div>
      </div>

      {/* Name prompt modal */}
      {showNamePrompt && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-30 flex items-center justify-center p-4">
          <form onSubmit={handleNameSubmit} className="bg-gray-900 rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-white font-semibold text-lg mb-4">{t.enterName}</h3>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder={t.yourName}
              maxLength={30}
              autoFocus
              className="w-full bg-white/10 text-white placeholder-white/50 px-4 py-3 rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-pink-500 mb-4"
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowNamePrompt(false)}
                className="flex-1 py-3 bg-white/10 text-white rounded-xl font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!nameInput.trim()}
                className="flex-1 py-3 bg-pink-500 text-white rounded-xl font-medium disabled:opacity-50"
              >
                {t.join}
              </button>
            </div>
          </form>
        </div>
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
