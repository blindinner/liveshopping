'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import type { Product, SaleType, AuctionStatus } from '@/types/database';

interface AuctionInfo {
  sale_type: SaleType;
  auction_status: AuctionStatus | null;
  starting_price: number | null;
  bid_increment: number | null;
  current_bid: number | null;
  bid_count: number;
  is_highest_bidder: boolean;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: () => void;
  isLoading?: boolean;
  locale: 'he' | 'en';
  onBuyNow?: (url: string) => void; // For manual products with checkout_url
  // Auction props
  auctionInfo?: AuctionInfo;
  onPlaceBid?: (amount: number) => void;
  onRegisterBidder?: () => void;
  isRegisteredBidder?: boolean;
  bidError?: string | null;
}

export function ProductCard({
  product,
  onAddToCart,
  isLoading = false,
  locale,
  onBuyNow,
  auctionInfo,
  onPlaceBid,
  onRegisterBidder,
  isRegisteredBidder = false,
  bidError,
}: ProductCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [bidAmount, setBidAmount] = useState('');
  const [showCustomBid, setShowCustomBid] = useState(false);
  const isRTL = locale === 'he';
  const isManualProduct = product.source === 'manual';
  const isAuction = auctionInfo?.sale_type === 'auction';
  const isAuctionActive = auctionInfo?.auction_status === 'active';
  const isAuctionEnded = auctionInfo?.auction_status === 'ended';

  const t = {
    he: {
      addToCart: 'הוסף',
      buyNow: 'קנה עכשיו',
      featured: 'מוצר מומלץ',
      auction: 'מכירה פומבית',
      currentBid: 'הצעה נוכחית',
      startingBid: 'הצעה פתיחה',
      placeBid: 'הגש הצעה',
      quickBid: 'הצע',
      customBid: 'יותר',
      registerToBid: 'הירשם להצעות',
      bids: 'הצעות',
      youreWinning: 'אתה מוביל!',
      auctionEnded: 'המכירה הסתיימה',
      auctionPending: 'ממתין להתחלה',
    },
    en: {
      addToCart: 'Add',
      buyNow: 'Buy Now',
      featured: 'Featured',
      auction: 'Auction',
      currentBid: 'Current Bid',
      startingBid: 'Starting Bid',
      placeBid: 'Place Bid',
      quickBid: 'Bid',
      customBid: 'More',
      registerToBid: 'Register to Bid',
      bids: 'bids',
      youreWinning: "You're winning!",
      auctionEnded: 'Auction Ended',
      auctionPending: 'Starting Soon',
    },
  }[locale];

  const handleAction = () => {
    if (isManualProduct && product.checkout_url) {
      if (onBuyNow) {
        onBuyNow(product.checkout_url);
      } else {
        window.open(product.checkout_url, '_blank', 'noopener,noreferrer');
      }
    } else {
      onAddToCart();
    }
  };

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
      setShowCustomBid(false);
    }
  };

  const handleQuickBid = () => {
    if (onPlaceBid) {
      onPlaceBid(getMinimumBid());
      setShowCustomBid(false);
    }
  };

  return (
    <div
      className={`absolute top-1/2 -translate-y-1/2 z-30 pointer-events-auto transition-all duration-300 ${
        isRTL ? 'left-2' : 'right-2'
      } ${isExpanded ? 'w-24' : 'w-14'}`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="bg-black/60 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden">
        {/* Collapse/expand button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`w-full py-1.5 px-2 flex items-center justify-center gap-1 border-b border-white/10 ${
            isAuction ? 'bg-orange-500/20' : 'bg-pink-500/20'
          }`}
        >
          <span className={`text-[10px] font-medium uppercase tracking-wide ${
            isAuction ? 'text-orange-400' : 'text-pink-400'
          }`}>
            {isAuction ? t.auction : t.featured}
          </span>
          <svg
            className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''} ${
              isAuction ? 'text-orange-400' : 'text-pink-400'
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isExpanded && (
          <div className="p-2 flex flex-col items-center gap-2">
            {/* Product image */}
            <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-white/10 shrink-0">
              {product.image_url ? (
                <Image
                  src={product.image_url}
                  alt={product.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/40">
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
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
            <div className="text-center w-full">
              <h3 className="text-white font-medium text-xs leading-tight line-clamp-2">
                {product.title}
              </h3>

              {isAuction && auctionInfo ? (
                <>
                  {/* Auction status */}
                  {isAuctionEnded && (
                    <p className="text-gray-400 text-[10px] mt-1">{t.auctionEnded}</p>
                  )}
                  {auctionInfo.auction_status === 'pending' && (
                    <p className="text-orange-400 text-[10px] mt-1">{t.auctionPending}</p>
                  )}

                  {/* Current bid or starting price */}
                  <div className="mt-1">
                    <p className="text-white/50 text-[10px]">
                      {auctionInfo.current_bid ? t.currentBid : t.startingBid}
                    </p>
                    <p className="text-orange-400 font-bold text-sm">
                      {formatPrice(
                        auctionInfo.current_bid || auctionInfo.starting_price || 0,
                        product.currency
                      )}
                    </p>
                  </div>

                  {/* Bid count */}
                  {auctionInfo.bid_count > 0 && (
                    <p className="text-white/50 text-[10px]">
                      {auctionInfo.bid_count} {t.bids}
                    </p>
                  )}

                  {/* Winning indicator */}
                  {auctionInfo.is_highest_bidder && isAuctionActive && (
                    <p className="text-green-400 text-[10px] font-medium mt-1">
                      {t.youreWinning}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-pink-400 font-bold text-sm mt-1">
                  {formatPrice(product.price, product.currency)}
                </p>
              )}
            </div>

            {/* Action button */}
            {isAuction && auctionInfo ? (
              <div className="w-full space-y-1.5">
                {!isRegisteredBidder ? (
                  <Button
                    onClick={onRegisterBidder}
                    size="sm"
                    variant="secondary"
                    className="w-full text-xs bg-orange-500 hover:bg-orange-600"
                  >
                    {t.registerToBid}
                  </Button>
                ) : isAuctionActive ? (
                  <>
                    {/* Quick bid button */}
                    <Button
                      onClick={handleQuickBid}
                      isLoading={isLoading}
                      size="sm"
                      className="w-full text-xs bg-orange-500 hover:bg-orange-600"
                    >
                      {t.quickBid} {formatPrice(getMinimumBid(), product.currency)}
                    </Button>
                    {/* Custom bid toggle */}
                    <button
                      onClick={() => setShowCustomBid(!showCustomBid)}
                      className="w-full text-white/50 text-[10px] hover:text-white/70 underline"
                    >
                      {t.customBid}
                    </button>
                    {/* Custom bid input - must be higher than quick bid */}
                    {showCustomBid && (
                      <div className="flex gap-1">
                        <input
                          type="number"
                          value={bidAmount}
                          onChange={(e) => setBidAmount(e.target.value)}
                          placeholder={(getMinimumBid() + 1).toString()}
                          min={getMinimumBid() + 1}
                          className="flex-1 bg-black/30 text-white text-xs rounded px-2 py-1.5 w-0 min-w-0 border border-white/10 focus:outline-none focus:border-orange-500"
                        />
                        <Button
                          onClick={handlePlaceBid}
                          isLoading={isLoading}
                          size="sm"
                          disabled={!bidAmount || parseFloat(bidAmount) <= getMinimumBid()}
                          className="text-xs bg-orange-500 hover:bg-orange-600 px-2"
                        >
                          {t.placeBid}
                        </Button>
                      </div>
                    )}
                    {bidError && (
                      <p className="text-red-400 text-[10px] text-center">{bidError}</p>
                    )}
                  </>
                ) : (
                  <p className="text-white/50 text-[10px] text-center">
                    {isAuctionEnded ? t.auctionEnded : t.auctionPending}
                  </p>
                )}
              </div>
            ) : (
              <Button
                onClick={handleAction}
                isLoading={isLoading}
                size="sm"
                className="w-full text-xs"
              >
                {isManualProduct ? t.buyNow : t.addToCart}
              </Button>
            )}
          </div>
        )}

        {/* Collapsed state - just show image thumbnail */}
        {!isExpanded && (
          <button
            onClick={() => setIsExpanded(true)}
            className="p-1.5"
          >
            <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-white/10">
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
          </button>
        )}
      </div>
    </div>
  );
}
