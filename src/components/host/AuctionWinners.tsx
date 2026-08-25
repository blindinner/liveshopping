'use client';

import { useEffect, useState } from 'react';
import type { Bidder, Product } from '@/types/database';

interface BidWithBidder {
  id: string;
  show_product_id: string;
  bidder_id: string;
  amount: number;
  created_at: string;
  bidder: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    viewer_id: string;
  };
}

interface AuctionWinner {
  id: string;
  show_product_id: string;
  bidder_id: string;
  winning_amount: number;
  payment_status: 'pending' | 'paid';
  paid_at: string | null;
  created_at: string;
  bidder: Bidder;
  show_product: {
    id: string;
    product: Product;
  };
}

interface AuctionWinnersProps {
  showId: string;
}

export function AuctionWinners({ showId }: AuctionWinnersProps) {
  const [winners, setWinners] = useState<AuctionWinner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(null);
  const [bidHistory, setBidHistory] = useState<Record<string, BidWithBidder[]>>({});
  const [loadingHistory, setLoadingHistory] = useState<string | null>(null);

  useEffect(() => {
    loadWinners();
  }, [showId]);

  const loadWinners = async () => {
    try {
      const response = await fetch(`/api/shows/${showId}/winners`);
      const data = await response.json();
      setWinners(data.winners || []);
    } catch (error) {
      console.error('Failed to load winners:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadBidHistory = async (showProductId: string) => {
    if (bidHistory[showProductId]) {
      // Already loaded
      setExpandedHistoryId(expandedHistoryId === showProductId ? null : showProductId);
      return;
    }

    setLoadingHistory(showProductId);
    try {
      const response = await fetch(`/api/shows/${showId}/products/${showProductId}/bids`);
      const data = await response.json();
      setBidHistory(prev => ({ ...prev, [showProductId]: data.bids || [] }));
      setExpandedHistoryId(showProductId);
    } catch (error) {
      console.error('Failed to load bid history:', error);
    } finally {
      setLoadingHistory(null);
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const copyWinnerInfo = (winner: AuctionWinner) => {
    const info = `Item: ${winner.show_product.product.title}
Winner: ${winner.bidder.name}
Email: ${winner.bidder.email}
Phone: ${winner.bidder.phone || 'N/A'}
Final Price: ${formatPrice(winner.winning_amount, winner.show_product.product.currency)}
Date: ${formatDate(winner.created_at)}`;

    navigator.clipboard.writeText(info);
    setCopiedId(winner.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const copyBidderInfo = (bid: BidWithBidder, productTitle: string, currency: string) => {
    const info = `Item: ${productTitle}
Bidder: ${bid.bidder.name}
Email: ${bid.bidder.email}
Phone: ${bid.bidder.phone || 'N/A'}
Bid Amount: ${formatPrice(bid.amount, currency)}
Date: ${formatDate(bid.created_at)}`;

    navigator.clipboard.writeText(info);
    setCopiedId(bid.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const markAsPaid = async (winnerId: string) => {
    try {
      const response = await fetch(`/api/shows/${showId}/winners/${winnerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_status: 'paid' }),
      });

      if (response.ok) {
        setWinners(prev =>
          prev.map(w =>
            w.id === winnerId
              ? { ...w, payment_status: 'paid' as const, paid_at: new Date().toISOString() }
              : w
          )
        );
      }
    } catch (error) {
      console.error('Failed to update payment status:', error);
    }
  };

  if (isLoading) {
    return (
      <section className="bg-white/5 rounded-2xl p-4">
        <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Auction Winners
        </h2>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full" />
        </div>
      </section>
    );
  }

  if (winners.length === 0) {
    return (
      <section className="bg-white/5 rounded-2xl p-4">
        <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Auction Winners
        </h2>
        <p className="text-white/50 text-center py-4 text-sm">No completed auctions yet</p>
      </section>
    );
  }

  return (
    <section className="bg-white/5 rounded-2xl p-4">
      <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Auction Winners
        <span className="ml-auto text-xs text-white/50">{winners.length} completed</span>
      </h2>

      <div className="space-y-3 max-h-[500px] overflow-y-auto">
        {winners.map((winner) => (
          <div
            key={winner.id}
            className="bg-black/30 rounded-xl p-3 border border-white/10"
          >
            {/* Product info */}
            <div className="flex items-start gap-3 mb-3">
              {winner.show_product.product.image_url && (
                <img
                  src={winner.show_product.product.image_url}
                  alt={winner.show_product.product.title}
                  className="w-12 h-12 rounded-lg object-cover"
                />
              )}
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-medium text-sm truncate">
                  {winner.show_product.product.title}
                </h3>
                <p className="text-orange-400 font-bold text-lg">
                  {formatPrice(winner.winning_amount, winner.show_product.product.currency)}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {winner.payment_status === 'paid' ? (
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                    Paid
                  </span>
                ) : (
                  <button
                    onClick={() => markAsPaid(winner.id)}
                    className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full hover:bg-yellow-500/30 transition-colors"
                  >
                    Mark Paid
                  </button>
                )}
              </div>
            </div>

            {/* Winner details */}
            <div className="bg-black/20 rounded-lg p-2 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-green-400 text-xs font-medium">WINNER</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-white text-sm">{winner.bidder.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href={`mailto:${winner.bidder.email}`} className="text-blue-400 text-sm hover:underline">
                  {winner.bidder.email}
                </a>
              </div>
              {winner.bidder.phone && (
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <a href={`tel:${winner.bidder.phone}`} className="text-blue-400 text-sm hover:underline">
                    {winner.bidder.phone}
                  </a>
                </div>
              )}
              <div className="flex items-center gap-2 text-white/40 text-xs pt-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {formatDate(winner.created_at)}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => copyWinnerInfo(winner)}
                className="flex-1 py-1.5 px-3 bg-white/10 hover:bg-white/20 text-white text-xs rounded-lg transition-colors flex items-center justify-center gap-1"
              >
                {copiedId === winner.id ? (
                  <>
                    <svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy Info
                  </>
                )}
              </button>
              <button
                onClick={() => loadBidHistory(winner.show_product_id)}
                className="flex-1 py-1.5 px-3 bg-white/10 hover:bg-white/20 text-white text-xs rounded-lg transition-colors flex items-center justify-center gap-1"
              >
                {loadingHistory === winner.show_product_id ? (
                  <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {expandedHistoryId === winner.show_product_id ? 'Hide' : 'Bid'} History
                  </>
                )}
              </button>
            </div>

            {/* Bid History - Expandable */}
            {expandedHistoryId === winner.show_product_id && bidHistory[winner.show_product_id] && (
              <div className="mt-3 border-t border-white/10 pt-3">
                <h4 className="text-white/70 text-xs font-medium mb-2 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  All Bids ({bidHistory[winner.show_product_id].length})
                </h4>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {bidHistory[winner.show_product_id].map((bid, index) => (
                    <div
                      key={bid.id}
                      className={`p-2 rounded-lg ${
                        index === 0
                          ? 'bg-green-500/10 border border-green-500/20'
                          : 'bg-black/20'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold text-sm ${index === 0 ? 'text-green-400' : 'text-white'}`}>
                            {formatPrice(bid.amount, winner.show_product.product.currency)}
                          </span>
                          {index === 0 && (
                            <span className="text-green-400 text-[10px] bg-green-500/20 px-1.5 py-0.5 rounded">
                              WINNER
                            </span>
                          )}
                          {index > 0 && (
                            <span className="text-white/40 text-[10px]">
                              #{index + 1}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => copyBidderInfo(bid, winner.show_product.product.title, winner.show_product.product.currency)}
                          className="p-1 text-white/40 hover:text-white/70 transition-colors"
                          title="Copy bidder info"
                        >
                          {copiedId === bid.id ? (
                            <svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          )}
                        </button>
                      </div>
                      <div className="text-xs space-y-0.5">
                        <div className="text-white">{bid.bidder.name}</div>
                        <div className="text-blue-400">{bid.bidder.email}</div>
                        {bid.bidder.phone && (
                          <div className="text-blue-400">{bid.bidder.phone}</div>
                        )}
                        <div className="text-white/40 text-[10px]">
                          {formatDate(bid.created_at)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
