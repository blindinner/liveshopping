'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { ShowMetrics, ShowEvent } from '@/types/database';

const initialMetrics: ShowMetrics = {
  // Viewer metrics
  viewerCount: 0,
  peakViewers: 0,
  uniqueViewers: 0,

  // Engagement metrics
  chatCount: 0,
  reactionCount: 0,
  productViewCount: 0,

  // Cart metrics
  addToCartCount: 0,
  uniqueAddToCartViewers: 0,
  addToCartValue: 0,
  averageCartValue: 0,

  // Checkout metrics
  checkoutClickCount: 0,
  uniqueCheckoutViewers: 0,
  checkoutValue: 0,

  // Conversion rates
  viewerToCartRate: 0,
  cartToCheckoutRate: 0,

  // Sales metrics
  salesCount: 0,
  totalRevenue: 0,

  currency: 'ILS',
};

interface EventAggregation {
  events: ShowEvent[];
  counts: Record<string, number>;
  uniqueViewers: Set<string>;
  uniqueCartViewers: Set<string>;
  uniqueCheckoutViewers: Set<string>;
  addToCartValue: number;
  checkoutValue: number;
  revenue: number;
  currency: string;
}

function aggregateEvents(events: ShowEvent[]): EventAggregation {
  const counts: Record<string, number> = {};
  const uniqueViewers = new Set<string>();
  const uniqueCartViewers = new Set<string>();
  const uniqueCheckoutViewers = new Set<string>();
  let addToCartValue = 0;
  let checkoutValue = 0;
  let revenue = 0;
  let currency = 'ILS';

  for (const event of events) {
    // Count by event type
    counts[event.event_type] = (counts[event.event_type] || 0) + 1;

    // Track unique viewers
    if (event.event_type === 'viewer_join') {
      uniqueViewers.add(event.viewer_id);
    }

    // Track add to cart
    if (event.event_type === 'add_to_cart') {
      uniqueCartViewers.add(event.viewer_id);
      const meta = event.metadata as Record<string, unknown>;
      if (typeof meta?.value === 'number') {
        addToCartValue += meta.value;
      }
      if (typeof meta?.currency === 'string') {
        currency = meta.currency;
      }
    }

    // Track checkout clicks
    if (event.event_type === 'checkout_click') {
      uniqueCheckoutViewers.add(event.viewer_id);
      const meta = event.metadata as Record<string, unknown>;
      if (typeof meta?.value === 'number') {
        checkoutValue += meta.value;
      }
      if (typeof meta?.currency === 'string') {
        currency = meta.currency;
      }
    }

    // Track revenue from completed orders
    if (event.event_type === 'order_completed') {
      const meta = event.metadata as Record<string, unknown>;
      if (typeof meta?.order_total === 'number') {
        revenue += meta.order_total;
      }
      if (typeof meta?.currency === 'string') {
        currency = meta.currency;
      }
    }
  }

  return {
    events,
    counts,
    uniqueViewers,
    uniqueCartViewers,
    uniqueCheckoutViewers,
    addToCartValue,
    checkoutValue,
    revenue,
    currency,
  };
}

function calculateMetrics(agg: EventAggregation): ShowMetrics {
  const uniqueViewerCount = agg.uniqueViewers.size;
  const uniqueCartCount = agg.uniqueCartViewers.size;
  const uniqueCheckoutCount = agg.uniqueCheckoutViewers.size;

  // Calculate conversion rates
  const viewerToCartRate = uniqueViewerCount > 0
    ? (uniqueCartCount / uniqueViewerCount) * 100
    : 0;

  const cartToCheckoutRate = uniqueCartCount > 0
    ? (uniqueCheckoutCount / uniqueCartCount) * 100
    : 0;

  // Calculate average cart value
  const averageCartValue = uniqueCartCount > 0
    ? agg.addToCartValue / uniqueCartCount
    : 0;

  return {
    // Viewer metrics
    viewerCount: uniqueViewerCount,
    peakViewers: uniqueViewerCount, // Will be updated with current presence
    uniqueViewers: uniqueViewerCount,

    // Engagement metrics
    chatCount: agg.counts['chat_message'] || 0,
    reactionCount: agg.counts['reaction'] || 0,
    productViewCount: agg.counts['product_view'] || 0,

    // Cart metrics
    addToCartCount: agg.counts['add_to_cart'] || 0,
    uniqueAddToCartViewers: uniqueCartCount,
    addToCartValue: agg.addToCartValue,
    averageCartValue,

    // Checkout metrics
    checkoutClickCount: agg.counts['checkout_click'] || 0,
    uniqueCheckoutViewers: uniqueCheckoutCount,
    checkoutValue: agg.checkoutValue,

    // Conversion rates
    viewerToCartRate,
    cartToCheckoutRate,

    // Sales metrics
    salesCount: agg.counts['order_completed'] || 0,
    totalRevenue: agg.revenue,

    currency: agg.currency,
  };
}

/**
 * Hook for real-time show analytics
 * Subscribes to engagement_events and cart_events for real-time metrics
 */
export function useShowAnalytics(showId: string) {
  const [metrics, setMetrics] = useState<ShowMetrics>(initialMetrics);
  const [isLoading, setIsLoading] = useState(true);
  const [allEvents, setAllEvents] = useState<ShowEvent[]>([]);

  // Load initial metrics from database
  const loadInitialMetrics = useCallback(async () => {
    const supabase = createClient();

    try {
      // Fetch engagement events
      const { data: engagementEvents } = await supabase
        .from('engagement_events')
        .select('*')
        .eq('show_id', showId)
        .order('created_at', { ascending: true });

      // Fetch cart events
      const { data: cartEvents } = await supabase
        .from('cart_events')
        .select('*')
        .eq('show_id', showId)
        .order('created_at', { ascending: true });

      // Normalize cart events to ShowEvent format
      const normalizedCartEvents: ShowEvent[] = (cartEvents || []).map((e) => {
        const originalMetadata = (e.metadata as Record<string, unknown>) || {};
        // Preserve original value from metadata (for checkout events),
        // or calculate from unit_price * quantity (for add_to_cart events)
        const calculatedValue = e.unit_price ? e.unit_price * (e.quantity || 1) : 0;
        const value = typeof originalMetadata.value === 'number'
          ? originalMetadata.value
          : calculatedValue;

        return {
          id: e.id,
          show_id: e.show_id,
          viewer_id: e.viewer_id,
          event_type: e.event_type === 'checkout_start' ? 'checkout_click' : e.event_type,
          product_id: e.product_id,
          metadata: {
            ...originalMetadata,
            value,
            price: e.unit_price,
            quantity: e.quantity,
            currency: e.currency || originalMetadata.currency,
          },
          created_at: e.created_at,
        };
      });

      // Normalize engagement events to ShowEvent format
      const normalizedEngagementEvents: ShowEvent[] = (engagementEvents || []).map((e) => ({
        id: e.id,
        show_id: e.show_id,
        viewer_id: e.viewer_id,
        event_type: e.event_type,
        product_id: null,
        metadata: (e.metadata as Record<string, unknown>) || {},
        created_at: e.created_at,
      }));

      const allEvts = [...normalizedEngagementEvents, ...normalizedCartEvents];
      setAllEvents(allEvts);
      const aggregation = aggregateEvents(allEvts);
      setMetrics(calculateMetrics(aggregation));
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setIsLoading(false);
    }
  }, [showId]);

  useEffect(() => {
    loadInitialMetrics();

    const supabase = createClient();

    // Subscribe to engagement events
    const engagementChannel = supabase
      .channel(`analytics-engagement:${showId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'engagement_events',
          filter: `show_id=eq.${showId}`,
        },
        (payload) => {
          const newEvent: ShowEvent = {
            id: payload.new.id,
            show_id: payload.new.show_id,
            viewer_id: payload.new.viewer_id,
            event_type: payload.new.event_type,
            product_id: null,
            metadata: (payload.new.metadata as Record<string, unknown>) || {},
            created_at: payload.new.created_at,
          };

          setAllEvents((prev) => {
            const updated = [...prev, newEvent];
            const aggregation = aggregateEvents(updated);
            setMetrics(calculateMetrics(aggregation));
            return updated;
          });
        }
      )
      .subscribe();

    // Subscribe to cart events
    const cartChannel = supabase
      .channel(`analytics-cart:${showId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'cart_events',
          filter: `show_id=eq.${showId}`,
        },
        (payload) => {
          const e = payload.new;
          const originalMetadata = (e.metadata as Record<string, unknown>) || {};
          const calculatedValue = e.unit_price ? e.unit_price * (e.quantity || 1) : 0;
          const value = typeof originalMetadata.value === 'number'
            ? originalMetadata.value
            : calculatedValue;

          const newEvent: ShowEvent = {
            id: e.id,
            show_id: e.show_id,
            viewer_id: e.viewer_id,
            event_type: e.event_type === 'checkout_start' ? 'checkout_click' : e.event_type,
            product_id: e.product_id,
            metadata: {
              ...originalMetadata,
              value,
              price: e.unit_price,
              quantity: e.quantity,
              currency: e.currency || originalMetadata.currency,
            },
            created_at: e.created_at,
          };

          setAllEvents((prev) => {
            const updated = [...prev, newEvent];
            const aggregation = aggregateEvents(updated);
            setMetrics(calculateMetrics(aggregation));
            return updated;
          });
        }
      )
      // Also listen for broadcast events (e.g., from webhooks)
      .on('broadcast', { event: 'sale' }, ({ payload }) => {
        setMetrics((prev) => ({
          ...prev,
          salesCount: prev.salesCount + 1,
          totalRevenue: prev.totalRevenue + (payload?.amount || 0),
          currency: payload?.currency || prev.currency,
        }));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(engagementChannel);
      supabase.removeChannel(cartChannel);
    };
  }, [showId, loadInitialMetrics]);

  // Helper to refresh metrics manually
  const refresh = useCallback(() => {
    setIsLoading(true);
    loadInitialMetrics();
  }, [loadInitialMetrics]);

  return {
    metrics,
    isLoading,
    refresh,
  };
}
