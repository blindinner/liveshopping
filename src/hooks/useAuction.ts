'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Bidder, Bid, AuctionWinner } from '@/types/database';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface AuctionState {
  currentBid: number | null;
  bidCount: number;
  highestBidder: { id: string; name: string; viewer_id: string } | null;
  bids: Bid[];
}

// Hook for bidder registration
export function useBidderRegistration(showId: string, viewerId: string) {
  const [bidder, setBidder] = useState<Bidder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);

  const validShowId = showId && showId.trim() !== '';
  const validViewerId = viewerId && viewerId.trim() !== '';

  useEffect(() => {
    if (!validShowId || !validViewerId) {
      setIsLoading(false);
      return;
    }

    async function checkRegistration() {
      try {
        const response = await fetch(
          `/api/shows/${showId}/bidders?viewer_id=${viewerId}`
        );
        const data = await response.json();
        setBidder(data.bidder || null);
      } catch (error) {
        console.error('Failed to check bidder registration:', error);
      } finally {
        setIsLoading(false);
      }
    }

    checkRegistration();
  }, [showId, viewerId, validShowId, validViewerId]);

  const register = useCallback(
    async (name: string, email: string, phone?: string) => {
      if (!validShowId || !validViewerId) return null;

      setIsRegistering(true);
      try {
        const response = await fetch(`/api/shows/${showId}/bidders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            viewer_id: viewerId,
            name,
            email,
            phone,
          }),
        });

        const data = await response.json();
        if (data.bidder) {
          setBidder(data.bidder);
          return data.bidder;
        }
        return null;
      } catch (error) {
        console.error('Failed to register bidder:', error);
        return null;
      } finally {
        setIsRegistering(false);
      }
    },
    [showId, viewerId, validShowId, validViewerId]
  );

  return {
    bidder,
    isRegistered: !!bidder,
    isApproved: bidder?.approved ?? false,
    isLoading,
    isRegistering,
    register,
  };
}

// Hook for auction state and bidding (viewer-facing)
export function useAuction(showProductId: string, showId: string, viewerId: string) {
  const [auctionState, setAuctionState] = useState<AuctionState>({
    currentBid: null,
    bidCount: 0,
    highestBidder: null,
    bids: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isPlacingBid, setIsPlacingBid] = useState(false);
  const [bidError, setBidError] = useState<string | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const validShowProductId = showProductId && showProductId.trim() !== '';
  const validShowId = showId && showId.trim() !== '';

  const loadBids = useCallback(async () => {
    if (!validShowProductId || !validShowId) return;

    try {
      const response = await fetch(
        `/api/shows/${showId}/products/${showProductId}/bids`
      );
      const data = await response.json();

      setAuctionState({
        currentBid: data.highest_bid,
        bidCount: data.bid_count,
        highestBidder: data.highest_bidder,
        bids: data.bids || [],
      });
    } catch (error) {
      console.error('Failed to load bids:', error);
    } finally {
      setIsLoading(false);
    }
  }, [showProductId, showId, validShowProductId, validShowId]);

  useEffect(() => {
    if (!validShowProductId || !validShowId) {
      setIsLoading(false);
      return;
    }

    const supabase = createClient();

    loadBids();

    // Subscribe to bid changes
    const channel = supabase
      .channel(`bids:${showProductId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bids',
          filter: `show_product_id=eq.${showProductId}`,
        },
        () => {
          // Reload bids on new bid
          loadBids();
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [showProductId, showId, validShowProductId, validShowId, loadBids]);

  const placeBid = useCallback(
    async (amount: number) => {
      if (!validShowProductId || !validShowId) return false;

      setIsPlacingBid(true);
      setBidError(null);

      try {
        const response = await fetch(
          `/api/shows/${showId}/products/${showProductId}/bids`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              viewer_id: viewerId,
              amount,
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          setBidError(data.error || 'Failed to place bid');
          return false;
        }

        // Bid placed successfully, state will update via subscription
        return true;
      } catch (error) {
        console.error('Failed to place bid:', error);
        setBidError('Failed to place bid');
        return false;
      } finally {
        setIsPlacingBid(false);
      }
    },
    [showProductId, showId, viewerId, validShowProductId, validShowId]
  );

  const isHighestBidder = auctionState.highestBidder?.viewer_id === viewerId;

  return {
    ...auctionState,
    isLoading,
    isPlacingBid,
    bidError,
    isHighestBidder,
    placeBid,
    refresh: loadBids,
  };
}

// Hook for checking if viewer won any auctions
export function useAuctionWins(showId: string, viewerId: string) {
  const [wins, setWins] = useState<AuctionWinner[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const validShowId = showId && showId.trim() !== '';
  const validViewerId = viewerId && viewerId.trim() !== '';

  useEffect(() => {
    if (!validShowId || !validViewerId) {
      setIsLoading(false);
      return;
    }

    const supabase = createClient();

    async function loadWins() {
      try {
        const response = await fetch(
          `/api/shows/${showId}/winners?viewer_id=${viewerId}`
        );
        const data = await response.json();
        setWins(data.winners || []);
      } catch (error) {
        console.error('Failed to load auction wins:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadWins();

    // Subscribe to auction winner changes
    const channel = supabase
      .channel(`wins:${showId}:${viewerId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'auction_winners',
        },
        () => {
          loadWins();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [showId, viewerId, validShowId, validViewerId]);

  return { wins, hasWins: wins.length > 0, isLoading };
}

// Hook for auction management (host-facing)
export function useAuctionManagement(showId: string) {
  const [bidders, setBidders] = useState<Bidder[]>([]);
  const [winners, setWinners] = useState<AuctionWinner[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const validShowId = showId && showId.trim() !== '';

  const loadData = useCallback(async () => {
    if (!validShowId) {
      setIsLoading(false);
      return;
    }

    try {
      const [biddersRes, winnersRes] = await Promise.all([
        fetch(`/api/shows/${showId}/bidders`),
        fetch(`/api/shows/${showId}/winners`),
      ]);

      const biddersData = await biddersRes.json();
      const winnersData = await winnersRes.json();

      setBidders(biddersData.bidders || []);
      setWinners(winnersData.winners || []);
    } catch (error) {
      console.error('Failed to load auction data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [showId, validShowId]);

  useEffect(() => {
    if (!validShowId) {
      setIsLoading(false);
      return;
    }

    const supabase = createClient();

    loadData();

    // Subscribe to bidder and winner changes
    const channel = supabase
      .channel(`auction-manage:${showId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bidders',
          filter: `show_id=eq.${showId}`,
        },
        () => loadData()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'auction_winners',
        },
        () => loadData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [showId, validShowId, loadData]);

  const approveBidder = useCallback(
    async (bidderId: string, approved: boolean) => {
      try {
        const response = await fetch(
          `/api/shows/${showId}/bidders/${bidderId}`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ approved }),
          }
        );

        const data = await response.json();
        if (data.bidder) {
          setBidders((prev) =>
            prev.map((b) => (b.id === bidderId ? data.bidder : b))
          );
        }
      } catch (error) {
        console.error('Failed to update bidder:', error);
      }
    },
    [showId]
  );

  const updatePaymentStatus = useCallback(
    async (winnerId: string, paymentStatus: 'pending' | 'paid') => {
      try {
        const response = await fetch(
          `/api/shows/${showId}/winners/${winnerId}`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ payment_status: paymentStatus }),
          }
        );

        const data = await response.json();
        if (data.winner) {
          setWinners((prev) =>
            prev.map((w) => (w.id === winnerId ? data.winner : w))
          );
        }
      } catch (error) {
        console.error('Failed to update payment status:', error);
      }
    },
    [showId]
  );

  return {
    bidders,
    winners,
    isLoading,
    approveBidder,
    updatePaymentStatus,
    refresh: loadData,
  };
}
