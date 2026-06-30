'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import type {
  ChatMessage,
  ShowProduct,
  ViewerPresence,
  ReactionBroadcast,
  Show,
} from '@/types/database';
import type { RealtimeChannel } from '@supabase/supabase-js';

// Helper to track engagement events
async function trackEngagementEvent(
  showId: string,
  viewerId: string,
  eventType: string,
  metadata?: Record<string, unknown>
) {
  try {
    await fetch(`/api/shows/${showId}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType,
        viewerId,
        metadata,
      }),
    });
  } catch (error) {
    console.error('Failed to track engagement event:', error);
  }
}

// Hook for real-time chat messages
export function useChatMessages(showId: string, viewerId?: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Guard against empty showId
  const validShowId = showId && showId.trim() !== '';

  useEffect(() => {
    if (!validShowId) {
      setIsLoading(false);
      return;
    }

    const supabase = createClient();

    // Load initial messages
    async function loadMessages() {
      const { data } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('show_id', showId)
        .eq('hidden', false)
        .order('created_at', { ascending: true })
        .limit(100);

      setMessages(data || []);
      setIsLoading(false);
    }

    loadMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`chat:${showId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `show_id=eq.${showId}`,
        },
        (payload) => {
          const newMessage = payload.new as ChatMessage;
          if (!newMessage.hidden) {
            setMessages((prev) => [...prev.slice(-99), newMessage]);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_messages',
          filter: `show_id=eq.${showId}`,
        },
        (payload) => {
          const updated = payload.new as ChatMessage;
          if (updated.hidden) {
            setMessages((prev) => prev.filter((m) => m.id !== updated.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [showId, validShowId]);

  const sendMessage = useCallback(
    async (viewerName: string, message: string) => {
      const supabase = createClient();
      await supabase.from('chat_messages').insert({
        show_id: showId,
        viewer_name: viewerName,
        message: message.slice(0, 500), // Limit message length
      });

      // Track chat_message event for analytics
      if (viewerId) {
        trackEngagementEvent(showId, viewerId, 'chat_message', {
          viewer_name: viewerName,
        });
      }
    },
    [showId, viewerId]
  );

  return { messages, isLoading, sendMessage };
}

// Hook for show products (featured products + active product)
export function useShowProducts(showId: string) {
  const [products, setProducts] = useState<ShowProduct[]>([]);
  const [activeProduct, setActiveProduct] = useState<ShowProduct | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Guard against empty showId
  const validShowId = showId && showId.trim() !== '';

  useEffect(() => {
    if (!validShowId) {
      setIsLoading(false);
      return;
    }

    const supabase = createClient();

    async function loadProducts() {
      const { data } = await supabase
        .from('show_products')
        .select('*, product:products(*)')
        .eq('show_id', showId)
        .order('display_order', { ascending: true });

      const showProducts = (data as ShowProduct[]) || [];
      setProducts(showProducts);
      setActiveProduct(showProducts.find((p) => p.is_active) || null);
      setIsLoading(false);
    }

    loadProducts();

    // Subscribe to product changes
    const channel = supabase
      .channel(`products:${showId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'show_products',
          filter: `show_id=eq.${showId}`,
        },
        async () => {
          // Reload all products on any change
          await loadProducts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [showId, validShowId]);

  return { products, activeProduct, isLoading };
}

// Hook for viewer presence (viewer count)
export function useViewerPresence(showId: string, viewerId: string) {
  const [viewerCount, setViewerCount] = useState(0);

  // Guard against empty showId or viewerId
  const validShowId = showId && showId.trim() !== '';
  const validViewerId = viewerId && viewerId.trim() !== '';

  useEffect(() => {
    if (!validShowId || !validViewerId) return;

    const supabase = createClient();
    let isActive = true;
    let channel: RealtimeChannel | null = null;

    // Use shared channel name so all viewers/hosts can see each other
    const channelName = `presence:${showId}`;

    // Remove any existing channel with this name first to avoid conflicts
    const existingChannels = supabase.getChannels();
    const existing = existingChannels.find((ch) => ch.topic === `realtime:${channelName}`);
    if (existing) {
      supabase.removeChannel(existing);
    }

    channel = supabase
      .channel(channelName, {
        config: {
          presence: {
            key: viewerId,
          },
        },
      })
      .on('presence', { event: 'sync' }, () => {
        if (!isActive || !channel) return;
        const state = channel.presenceState();
        const count = Object.keys(state).length;
        setViewerCount(count);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED' && isActive && channel) {
          await channel.track({
            viewer_id: viewerId,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      isActive = false;
      if (channel) {
        channel.untrack();
        supabase.removeChannel(channel);
      }
    };
  }, [showId, viewerId, validShowId, validViewerId]);

  return { viewerCount };
}

// Hook for reactions (ephemeral broadcasts)
export function useReactions(showId: string) {
  const [reactions, setReactions] = useState<
    Array<ReactionBroadcast & { id: string }>
  >([]);
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Guard against empty showId
  const validShowId = showId && showId.trim() !== '';

  useEffect(() => {
    if (!validShowId) return;

    const supabase = createClient();
    let isActive = true;

    const channelName = `reactions:${showId}:${Date.now()}`;
    const channel = supabase.channel(channelName);

    // Set up broadcast handler BEFORE subscribing
    channel.on('broadcast', { event: 'reaction' }, ({ payload }) => {
      if (!isActive) return;
      const reaction = payload as ReactionBroadcast;
      const id = `${Date.now()}-${Math.random()}`;
      setReactions((prev) => [...prev.slice(-20), { ...reaction, id }]);

      // Auto-remove after animation
      setTimeout(() => {
        setReactions((prev) => prev.filter((r) => r.id !== id));
      }, 2000);
    });

    // Subscribe to channel
    channel.subscribe();

    channelRef.current = channel;

    return () => {
      isActive = false;
      channelRef.current = null;
      supabase.removeChannel(channel);
    };
  }, [showId, validShowId]);

  const sendReaction = useCallback(
    async (emoji: string, viewerId: string) => {
      if (channelRef.current) {
        const x = 10 + Math.random() * 80; // Random horizontal position
        const y = 100; // Start from bottom
        await channelRef.current.send({
          type: 'broadcast',
          event: 'reaction',
          payload: { type: 'reaction', emoji, viewer_id: viewerId, x, y },
        });

        // Track reaction event for analytics
        trackEngagementEvent(showId, viewerId, 'reaction', { emoji });
      }
    },
    [showId]
  );

  return { reactions, sendReaction };
}

// Hook for show status changes
export function useShowStatus(showId: string) {
  const [show, setShow] = useState<Show | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Guard against empty showId
  const validShowId = showId && showId.trim() !== '';

  useEffect(() => {
    if (!validShowId) {
      setIsLoading(false);
      return;
    }

    const supabase = createClient();

    async function loadShow() {
      const { data } = await supabase
        .from('shows')
        .select('*')
        .eq('id', showId)
        .single();

      setShow(data);
      setIsLoading(false);
    }

    loadShow();

    // Subscribe to show changes
    const channel = supabase
      .channel(`show:${showId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'shows',
          filter: `id=eq.${showId}`,
        },
        (payload) => {
          setShow(payload.new as Show);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [showId, validShowId]);

  return { show, isLoading };
}
