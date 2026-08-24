'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { ShowProduct, Bid, Bidder } from '@/types/database';

interface AuctionControlProps {
  showProduct: ShowProduct;
  showId: string;
  onAuctionUpdate: (updates: Partial<ShowProduct>) => void;
}

export function AuctionControl({ showProduct, showId, onAuctionUpdate }: AuctionControlProps) {
  const [bids, setBids] = useState<Bid[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const currentBid = bids.length > 0 ? bids[0].amount : null;
  const highestBidder = bids.length > 0 ? bids[0].bidder : null;
  const bidCount = bids.length;

  // Load bids
  useEffect(() => {
    async function loadBids() {
      try {
        const response = await fetch(
          `/api/shows/${showId}/products/${showProduct.id}/bids`
        );
        const data = await response.json();
        setBids(data.bids || []);
      } catch (error) {
        console.error('Failed to load bids:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadBids();

    // Subscribe to bid changes
    const supabase = createClient();
    const channel = supabase
      .channel(`auction-control:${showProduct.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bids',
          filter: `show_product_id=eq.${showProduct.id}`,
        },
        () => {
          loadBids();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [showProduct.id, showId]);

  const startAuction = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/shows/${showId}/products/${showProduct.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auction_status: 'active' }),
      });

      if (response.ok) {
        onAuctionUpdate({ auction_status: 'active' });
      }
    } catch (error) {
      console.error('Failed to start auction:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const endAuction = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/shows/${showId}/products/${showProduct.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auction_status: 'ended' }),
      });

      if (response.ok) {
        const data = await response.json();
        onAuctionUpdate({
          auction_status: 'ended',
          auction_ended_at: data.showProduct.auction_ended_at,
          winner_bidder_id: data.showProduct.winner_bidder_id,
        });
      }
    } catch (error) {
      console.error('Failed to end auction:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (showProduct.sale_type !== 'auction') {
    return null;
  }

  return (
    <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            showProduct.auction_status === 'active' ? 'bg-green-500 animate-pulse' :
            showProduct.auction_status === 'ended' ? 'bg-gray-500' : 'bg-orange-500'
          }`} />
          <h3 className="text-white font-semibold">
            Auction: {showProduct.product?.title}
          </h3>
        </div>
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          showProduct.auction_status === 'active' ? 'bg-green-500/20 text-green-300' :
          showProduct.auction_status === 'ended' ? 'bg-gray-500/20 text-gray-300' :
          'bg-orange-500/20 text-orange-300'
        }`}>
          {showProduct.auction_status === 'active' ? 'Live' :
           showProduct.auction_status === 'ended' ? 'Ended' : 'Pending'}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-black/20 rounded-lg p-3">
          <p className="text-white/50 text-xs mb-1">Current Bid</p>
          <p className="text-2xl font-bold text-white">
            {currentBid ? `${showProduct.product?.currency} ${currentBid}` : '-'}
          </p>
        </div>
        <div className="bg-black/20 rounded-lg p-3">
          <p className="text-white/50 text-xs mb-1">Starting Price</p>
          <p className="text-lg font-semibold text-white/70">
            {showProduct.product?.currency} {showProduct.starting_price}
          </p>
        </div>
        <div className="bg-black/20 rounded-lg p-3">
          <p className="text-white/50 text-xs mb-1">Total Bids</p>
          <p className="text-2xl font-bold text-white">{bidCount}</p>
        </div>
      </div>

      {highestBidder && (
        <div className="bg-black/20 rounded-lg p-3 mb-4">
          <p className="text-white/50 text-xs mb-1">Highest Bidder</p>
          <p className="text-white font-medium">{highestBidder.name}</p>
        </div>
      )}

      {/* Recent Bids */}
      {bids.length > 0 && (
        <div className="mb-4">
          <p className="text-white/50 text-xs mb-2">Recent Bids</p>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {bids.slice(0, 5).map((bid) => (
              <div key={bid.id} className="flex items-center justify-between text-sm bg-black/10 rounded px-2 py-1">
                <span className="text-white/70">{bid.bidder?.name}</span>
                <span className="text-white font-medium">
                  {showProduct.product?.currency} {bid.amount}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex gap-2">
        {showProduct.auction_status === 'pending' && (
          <button
            onClick={startAuction}
            disabled={isUpdating}
            className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
          >
            {isUpdating ? 'Starting...' : 'Start Auction'}
          </button>
        )}

        {showProduct.auction_status === 'active' && (
          <button
            onClick={endAuction}
            disabled={isUpdating}
            className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
          >
            {isUpdating ? 'Ending...' : 'End Auction'}
          </button>
        )}

        {showProduct.auction_status === 'ended' && (
          <div className="flex-1 text-center py-2 text-white/50">
            Auction ended
            {showProduct.winner_bidder_id && highestBidder && (
              <span className="block text-green-400 font-medium">
                Winner: {highestBidder.name} - {showProduct.product?.currency} {currentBid}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
