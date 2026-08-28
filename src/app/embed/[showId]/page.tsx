'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { VideoPlayer } from '@/components/viewer/VideoPlayer';
import { CartDrawer } from '@/components/viewer/CartDrawer';
import { PollView, PollButton } from '@/components/viewer/PollCard';
import { BidderRegistration } from '@/components/viewer/BidderRegistration';
import { AuctionWinnerModal } from '@/components/viewer/AuctionWinnerModal';
import { Countdown } from '@/components/viewer/Countdown';
import {
  useShowProducts,
  useViewerPresence,
  useShowStatus,
} from '@/hooks/useRealtime';
import { useCart } from '@/hooks/useCart';
import { useActivePoll } from '@/hooks/usePolls';
import { useBidderRegistration, useAuction, useAuctionWins } from '@/hooks/useAuction';
import { usePrivateShowAccess } from '@/hooks/usePrivateShowAccess';
import { PrivateShowAccessDenied } from '@/components/viewer/PrivateShowAccessDenied';
import type { Product, ShowProduct, SaleType, AuctionStatus } from '@/types/database';
import { useParams, useSearchParams } from 'next/navigation';

interface AuctionInfo {
  sale_type: SaleType;
  auction_status: AuctionStatus | null;
  starting_price: number | null;
  bid_increment: number | null;
  current_bid: number | null;
  bid_count: number;
  is_highest_bidder: boolean;
}

// Instagram-style product card for mobile
function MobileProductCard({
  product,
  onAction,
  isLoading,
  locale,
  auctionInfo,
  onPlaceBid,
  onRegisterBidder,
  isRegisteredBidder,
  bidError,
}: {
  product: Product;
  onAction: () => void;
  isLoading: boolean;
  locale: 'he' | 'en';
  auctionInfo?: AuctionInfo;
  onPlaceBid?: (amount: number) => void;
  onRegisterBidder?: () => void;
  isRegisteredBidder?: boolean;
  bidError?: string | null;
}) {
  const [bidAmount, setBidAmount] = useState('');
  const isRTL = locale === 'he';
  const isManualProduct = product.source === 'manual';
  const isAuction = auctionInfo?.sale_type === 'auction';
  const isAuctionActive = auctionInfo?.auction_status === 'active';
  const isAuctionEnded = auctionInfo?.auction_status === 'ended';

  const t = {
    he: {
      buyNow: 'קנה עכשיו',
      addToCart: 'הוסף לסל',
      auction: 'מכירה פומבית',
      currentBid: 'הצעה נוכחית',
      startingBid: 'מחיר פתיחה',
      placeBid: 'הגש הצעה',
      registerToBid: 'הירשם להציע',
      bids: 'הצעות',
      youreWinning: 'אתה מוביל!',
      auctionEnded: 'המכירה הסתיימה',
      auctionPending: 'ממתין להתחלה',
    },
    en: {
      buyNow: 'Buy Now',
      addToCart: 'Add to Cart',
      auction: 'Auction',
      currentBid: 'Current Bid',
      startingBid: 'Starting Bid',
      placeBid: 'Bid',
      registerToBid: 'Register to Bid',
      bids: 'bids',
      youreWinning: "You're winning!",
      auctionEnded: 'Auction Ended',
      auctionPending: 'Starting Soon',
    },
  }[locale];

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat(locale === 'he' ? 'he-IL' : 'en-US', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  const getMinimumBid = () => {
    if (!auctionInfo) return 0;
    const currentBid = auctionInfo.current_bid || 0;
    const startingPrice = auctionInfo.starting_price || 0;
    const increment = auctionInfo.bid_increment || 1;
    return currentBid > 0 ? currentBid + increment : startingPrice;
  };

  const handlePlaceBid = () => {
    const amount = parseFloat(bidAmount);
    if (amount >= getMinimumBid() && onPlaceBid) {
      onPlaceBid(amount);
      setBidAmount('');
    }
  };

  return (
    <div
      className={`p-3 bg-black/70 backdrop-blur-md rounded-2xl border ${isAuction ? 'border-orange-500/30' : 'border-white/20'}`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="flex items-center gap-3">
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
          {/* Auction badge */}
          {isAuction && (
            <div className="absolute top-0 left-0 right-0 bg-orange-500 text-white text-[10px] font-bold text-center py-0.5">
              {t.auction}
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-medium text-sm leading-tight line-clamp-1">
            {product.title}
          </h3>

          {isAuction && auctionInfo ? (
            <div className="mt-0.5">
              <p className="text-white/50 text-[10px]">
                {auctionInfo.current_bid ? t.currentBid : t.startingBid}
              </p>
              <p className="text-orange-400 font-bold text-base">
                {formatPrice(
                  auctionInfo.current_bid || auctionInfo.starting_price || 0,
                  product.currency
                )}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                {auctionInfo.bid_count > 0 && (
                  <span className="text-white/50 text-[10px]">
                    {auctionInfo.bid_count} {t.bids}
                  </span>
                )}
                {auctionInfo.is_highest_bidder && isAuctionActive && (
                  <span className="text-green-400 text-[10px] font-medium">
                    {t.youreWinning}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <p className="text-pink-400 font-bold text-base mt-0.5">
              {formatPrice(product.price, product.currency)}
            </p>
          )}
        </div>

        {/* Action button - only for non-auction products */}
        {!isAuction && (
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
        )}
      </div>

      {/* Auction bidding section */}
      {isAuction && auctionInfo && (
        <div className="mt-3 pt-3 border-t border-white/10">
          {!isRegisteredBidder ? (
            <button
              onClick={onRegisterBidder}
              className="w-full py-2 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-semibold text-sm rounded-full transition-colors"
            >
              {t.registerToBid}
            </button>
          ) : isAuctionActive ? (
            <div className="flex gap-2">
              <input
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                placeholder={getMinimumBid().toString()}
                className="flex-1 bg-black/30 text-white text-sm rounded-full px-4 py-2 border border-white/10 focus:outline-none focus:border-orange-500 min-w-0"
              />
              <button
                onClick={handlePlaceBid}
                disabled={isLoading || !bidAmount || parseFloat(bidAmount) < getMinimumBid()}
                className="shrink-0 px-5 py-2 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 disabled:opacity-50 text-white font-semibold text-sm rounded-full transition-colors"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  t.placeBid
                )}
              </button>
            </div>
          ) : (
            <p className="text-center text-white/50 text-sm py-1">
              {isAuctionEnded ? t.auctionEnded : t.auctionPending}
            </p>
          )}
          {bidError && (
            <p className="text-red-400 text-xs text-center mt-2">{bidError}</p>
          )}
        </div>
      )}
    </div>
  );
}

export default function EmbedLiveViewerPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const showId = params.showId as string;

  // Configuration from URL params
  const locale = (searchParams.get('locale') || 'en') as 'he' | 'en';
  const token = searchParams.get('token');

  // Private show access control
  const {
    isAuthorized: isPrivateAuthorized,
    isValidating: isPrivateValidating,
    viewerId: invitedViewerId,
    guestProfile,
    needsRegistration,
    pendingToken,
  } = usePrivateShowAccess(showId, token);

  // Generate viewer ID (use invited ID for private shows, or generate one)
  const [generatedViewerId] = useState(() => `embed-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isPollOpen, setIsPollOpen] = useState(false);
  const [showBidderRegistration, setShowBidderRegistration] = useState(false);
  const [dismissedWinIds, setDismissedWinIds] = useState<string[]>([]);

  // Real-time hooks
  const { show, isLoading: showLoading } = useShowStatus(showId);

  // Determine effective viewer ID based on show type
  const isPrivateShow = show?.auction_type === 'private';
  const viewerId = isPrivateShow && invitedViewerId ? invitedViewerId : generatedViewerId;

  // For private shows with accepted invitations, bidder is already registered
  const isPreRegisteredBidder = isPrivateShow && isPrivateAuthorized && !!invitedViewerId;
  const { activeProduct } = useShowProducts(showId);
  const { viewerCount } = useViewerPresence(showId, viewerId);
  const { activePoll, hasVoted, submitVote } = useActivePoll(showId, viewerId);

  // Auction hooks
  const { isRegistered: isRegisteredBidder, register: registerBidder } = useBidderRegistration(showId, viewerId);
  const {
    currentBid,
    bidCount,
    isHighestBidder,
    isPlacingBid,
    bidError,
    placeBid,
  } = useAuction(activeProduct?.id || '', showId, viewerId);
  const { wins } = useAuctionWins(showId, viewerId);

  // Get the latest undismissed win
  const latestWin = wins.find(w => !dismissedWinIds.includes(w.id));

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

  // Handle checkout - uses checkout from useCart which tracks the event
  const handleCheckout = useCallback(() => {
    checkout();
  }, [checkout]);

  // Handle bidder registration
  const handleRegisterBidder = async (name: string, email: string, phone?: string) => {
    const bidder = await registerBidder(name, email, phone);
    return !!bidder;
  };

  // Handle place bid
  const handlePlaceBid = async (amount: number) => {
    await placeBid(amount);
  };

  // Build auction info for MobileProductCard
  const getAuctionInfo = (showProduct: ShowProduct) => {
    // Debug log - remove after testing
    console.log('[Auction Debug] ShowProduct:', {
      id: showProduct.id,
      sale_type: showProduct.sale_type,
      auction_status: showProduct.auction_status,
      starting_price: showProduct.starting_price,
      bid_increment: showProduct.bid_increment,
    });

    if (showProduct.sale_type !== 'auction') return undefined;
    return {
      sale_type: showProduct.sale_type,
      auction_status: showProduct.auction_status,
      starting_price: showProduct.starting_price,
      bid_increment: showProduct.bid_increment,
      current_bid: currentBid,
      bid_count: bidCount,
      is_highest_bidder: isHighestBidder,
    };
  };

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

  if (showLoading || !show || (isPrivateShow && isPrivateValidating)) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full" />
      </div>
    );
  }

  // Redirect to registration if needed for private shows
  if (needsRegistration && pendingToken) {
    // In embed mode, show a message to complete registration
    return (
      <div className="fixed inset-0 bg-gradient-to-b from-gray-900 to-black flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-pink-500/20 flex items-center justify-center">
          <svg className="w-8 h-8 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-white mb-2">Complete Your Registration</h1>
        <p className="text-white/60 mb-6">Please complete your registration to join this private auction.</p>
        <a
          href={`/invite/${pendingToken}?embed=true`}
          className="px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white font-medium rounded-full transition-colors"
        >
          Register Now
        </a>
      </div>
    );
  }

  // Access control for private shows
  if (isPrivateShow && !isPrivateAuthorized) {
    return <PrivateShowAccessDenied showTitle={show.title} />;
  }

  // Pre-show state (scheduled)
  if (show.status === 'scheduled') {
    // Generate Google Calendar URL
    const getCalendarUrl = () => {
      const startDate = new Date(show.scheduled_at);
      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

      const formatCalendarDate = (date: Date) => {
        return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
      };

      // Build the join URL - use embed_url or brand domain if available
      let joinUrl = window.location.href;
      const effectiveEmbedUrl = show.embed_url || (show._brandDomain ? `https://${show._brandDomain}` : null);

      if (effectiveEmbedUrl && token) {
        const url = new URL(effectiveEmbedUrl);
        url.searchParams.set('token', token);
        joinUrl = url.toString();
      } else if (effectiveEmbedUrl) {
        joinUrl = effectiveEmbedUrl;
      }

      const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: `${isPrivateShow ? 'Private Auction' : 'Live Show'}: ${show.title}`,
        dates: `${formatCalendarDate(startDate)}/${formatCalendarDate(endDate)}`,
        details: `Join the ${isPrivateShow ? 'private auction' : 'live show'} at ${joinUrl}`,
      });

      return `https://calendar.google.com/calendar/render?${params.toString()}`;
    };

    const calendarLabel = locale === 'he' ? 'הוסף ליומן' : 'Add to Calendar';

    return (
      <div className="fixed inset-0 bg-gradient-to-b from-gray-900 to-black flex flex-col items-center justify-center p-6">
        <h1 className="text-xl font-bold text-white mb-2 text-center">{show.title}</h1>
        <div className="mt-6">
          <Countdown targetDate={new Date(show.scheduled_at)} locale={locale} />
        </div>
        <a
          href={getCalendarUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white font-medium rounded-full transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {calendarLabel}
        </a>
      </div>
    );
  }

  // Ended state - show replay if available
  if (show.status === 'ended') {
    // If we have a playback ID, show the replay
    if (show.cloudflare_playback_id) {
      return (
        <div className="fixed inset-0 bg-black flex flex-col">
          {/* Video Player - plays the recording */}
          <div className="flex-1 relative min-h-0">
            <VideoPlayer
              playbackId={show.cloudflare_playback_id}
              isLive={false}
              viewerCount={0}
              locale={locale}
            />

            {/* Replay badge */}
            <div className="absolute top-3 left-3 z-20">
              <div className="px-2 py-1 bg-white/10 backdrop-blur-sm rounded-lg flex items-center gap-1.5">
                <svg className="w-3 h-3 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="text-white/70 text-xs font-medium">Replay</span>
              </div>
            </div>
          </div>

          {/* Bottom info */}
          <div className="shrink-0 p-3 pb-safe bg-gradient-to-t from-black/80 to-transparent">
            <h1 className="text-sm font-bold text-white">{show.title}</h1>
            <p className="text-white/60 text-xs">Recorded show</p>
          </div>
        </div>
      );
    }

    // No recording available
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

      {/* Poll full-screen view */}
      {activePoll && isPollOpen && (
        <PollView
          poll={activePoll}
          hasVoted={hasVoted}
          onVote={submitVote}
          onCollapse={() => setIsPollOpen(false)}
          locale={locale}
          videoElement={
            <VideoPlayer
              playbackId={show.cloudflare_playback_id}
              isLive={show.status === 'live'}
              viewerCount={viewerCount}
              locale={locale}
              hideOverlay={true}
            />
          }
        />
      )}

      {/* Bottom section - Product card (Instagram-style) */}
      <div className="shrink-0 p-3 pb-safe space-y-2">
        {/* Product card - hide when auction ended */}
        {activeProduct?.product && activeProduct.auction_status !== 'ended' && (
          <MobileProductCard
            product={activeProduct.product}
            onAction={() => handleProductAction(activeProduct.product!)}
            isLoading={cartLoading || isPlacingBid}
            locale={locale}
            auctionInfo={getAuctionInfo(activeProduct)}
            onPlaceBid={handlePlaceBid}
            onRegisterBidder={() => setShowBidderRegistration(true)}
            isRegisteredBidder={isRegisteredBidder || isPreRegisteredBidder}
            bidError={bidError}
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

      {/* Bidder Registration Modal */}
      <BidderRegistration
        isOpen={showBidderRegistration}
        onClose={() => setShowBidderRegistration(false)}
        onRegister={handleRegisterBidder}
        locale={locale}
      />

      {/* Auction Winner Modal */}
      {latestWin && (
        <AuctionWinnerModal
          winner={latestWin}
          isOpen={true}
          onClose={() => setDismissedWinIds(prev => [...prev, latestWin.id])}
          locale={locale}
        />
      )}
    </div>
  );
}
