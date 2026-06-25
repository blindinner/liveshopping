'use client';

import { useEffect, useState, useCallback } from 'react';
import { VideoPlayer } from '@/components/viewer/VideoPlayer';
import { Chat } from '@/components/viewer/Chat';
import { Reactions } from '@/components/viewer/Reactions';
import { ProductCard } from '@/components/viewer/ProductCard';
import { PollCard, PollButton } from '@/components/viewer/PollCard';
import { CartDrawer } from '@/components/viewer/CartDrawer';
import { CheckoutBar } from '@/components/viewer/CheckoutBar';
// TODO: Re-enable lead capture form after testing
// import { LeadCaptureForm } from '@/components/viewer/LeadCaptureForm';
import { Countdown } from '@/components/viewer/Countdown';
import {
  useChatMessages,
  useShowProducts,
  useViewerPresence,
  useReactions,
  useShowStatus,
} from '@/hooks/useRealtime';
import { useCart } from '@/hooks/useCart';
import { useActivePoll } from '@/hooks/usePolls';
import type { ShowProduct } from '@/types/database';
import { useParams } from 'next/navigation';

export default function LiveViewerPage() {
  const params = useParams();
  const showId = params.showId as string;
  const locale = 'en' as const;

  // Generate viewer ID (persisted in memory for the session)
  const [viewerId] = useState(() => `viewer-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  // TODO: Re-enable lead capture form after testing
  const [viewerName, setViewerName] = useState<string | null>('Guest');
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isPollOpen, setIsPollOpen] = useState(false);

  // Real-time hooks
  const { show, isLoading: showLoading } = useShowStatus(showId);
  const { messages, sendMessage } = useChatMessages(showId, viewerId);
  const { activeProduct } = useShowProducts(showId);
  const { viewerCount } = useViewerPresence(showId, viewerId);
  const { reactions, sendReaction } = useReactions(showId);
  const { activePoll, hasVoted, submitVote } = useActivePoll(showId, viewerId);

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

  // Show lead capture on first interaction if no name
  const handleFirstInteraction = useCallback(() => {
    if (!viewerName) {
      setShowLeadForm(true);
    }
  }, [viewerName]);

  // Handle lead form completion
  const handleLeadComplete = (name: string) => {
    setViewerName(name);
    setShowLeadForm(false);
  };

  // Handle add to cart
  const handleAddToCart = useCallback(
    async (showProduct: ShowProduct) => {
      if (!viewerName) {
        setShowLeadForm(true);
        return;
      }

      if (showProduct.product) {
        await addToCart(showProduct.product);
      }
    },
    [viewerName, addToCart]
  );

  // Handle send chat message
  const handleSendMessage = useCallback(
    (message: string) => {
      if (viewerName) {
        sendMessage(viewerName, message);
      }
    },
    [viewerName, sendMessage]
  );


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
        <div className="mt-8 mb-12">
          <Countdown targetDate={new Date(show.scheduled_at)} locale={locale} />
        </div>
        {/* TODO: Re-enable lead capture form after testing */}
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
        <p className="text-white/60">Show ended</p>
      </div>
    );
  }

  // Live state
  return (
    <div className="fixed inset-0 bg-black">
      {/* Video Player (full screen background) */}
      <VideoPlayer
        playbackId={show.cloudflare_playback_id}
        isLive={show.status === 'live'}
        viewerCount={viewerCount}
        locale={locale}
      />

      {/* Reactions overlay */}
      <Reactions
        reactions={reactions}
        onReact={(emoji) => {
          handleFirstInteraction();
          sendReaction(emoji, viewerId);
        }}
      />

      {/* Active product card - only shows when host features a product */}
      {activeProduct?.product && (
        <ProductCard
          product={activeProduct.product}
          onAddToCart={() => handleAddToCart(activeProduct)}
          isLoading={cartLoading}
          locale={locale}
        />
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

      {/* Chat overlay - positioned above checkout bar */}
      <div className={`absolute inset-x-0 z-40 pointer-events-auto ${itemCount > 0 ? 'bottom-20' : 'bottom-0'}`}>
        <Chat
          messages={messages}
          onSendMessage={handleSendMessage}
          viewerName={viewerName}
          onRequestName={handleFirstInteraction}
          locale={locale}
        />
      </div>

      {/* Top bar - Poll button and cart */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20 pointer-events-none">
        {/* Left side - Poll button */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {activePoll && (
            <PollButton
              poll={activePoll}
              hasVoted={hasVoted}
              onClick={() => setIsPollOpen(true)}
              locale={locale}
            />
          )}
        </div>

        {/* Right side - Cart button (only when cart is empty) */}
        {itemCount === 0 && (
          <button
            onClick={() => setIsCartOpen(true)}
            className="p-3 bg-white/10 backdrop-blur-sm rounded-full pointer-events-auto"
          >
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
          </button>
        )}
      </div>

      {/* Sticky checkout bar - shows when cart has items */}
      <CheckoutBar
        itemCount={itemCount}
        total={total}
        currency={cart.items[0]?.product.currency || 'ILS'}
        onCheckout={checkout}
        onViewCart={() => setIsCartOpen(true)}
        isLoading={cartLoading}
        locale={locale}
      />

      {/* Cart drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart.items}
        total={total}
        currency={cart.items[0]?.product.currency || 'ILS'}
        onUpdateQuantity={updateQuantity}
        onRemove={removeFromCart}
        onCheckout={checkout}
        isLoading={cartLoading}
        locale={locale}
      />

      {/* TODO: Re-enable lead capture form after testing */}
    </div>
  );
}
