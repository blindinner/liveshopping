'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

export interface VideoMetrics {
  // View metrics
  videoViews: number;
  uniqueViewers: number;

  // Product click metrics
  productClickCount: number;
  uniqueProductClickViewers: number;

  // Cart metrics
  addToCartCount: number;
  uniqueAddToCartViewers: number;
  addToCartValue: number;

  // Checkout metrics
  checkoutClickCount: number;
  uniqueCheckoutViewers: number;
  checkoutValue: number;

  // Conversion rates
  viewerToCartRate: number;
  cartToCheckoutRate: number;

  // Sales metrics
  salesCount: number;
  totalRevenue: number;

  currency: string;
}

export interface VideoProductMetrics {
  productId: string;
  addToCartCount: number;
  addToCartValue: number;
  uniqueViewers: number;
}

interface VideoEvent {
  id: string;
  video_id: string;
  viewer_id: string;
  event_type: string;
  product_id: string | null;
  quantity: number | null;
  unit_price: number | null;
  currency: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

const initialMetrics: VideoMetrics = {
  videoViews: 0,
  uniqueViewers: 0,
  productClickCount: 0,
  uniqueProductClickViewers: 0,
  addToCartCount: 0,
  uniqueAddToCartViewers: 0,
  addToCartValue: 0,
  checkoutClickCount: 0,
  uniqueCheckoutViewers: 0,
  checkoutValue: 0,
  viewerToCartRate: 0,
  cartToCheckoutRate: 0,
  salesCount: 0,
  totalRevenue: 0,
  currency: 'ILS',
};

function aggregateEvents(events: VideoEvent[]): {
  metrics: VideoMetrics;
  productMetrics: VideoProductMetrics[];
} {
  const uniqueViewers = new Set<string>();
  const uniqueProductClickViewers = new Set<string>();
  const uniqueCartViewers = new Set<string>();
  const uniqueCheckoutViewers = new Set<string>();
  const productMetricsMap = new Map<string, {
    addToCartCount: number;
    addToCartValue: number;
    uniqueViewers: Set<string>;
  }>();

  let videoViews = 0;
  let productClickCount = 0;
  let addToCartCount = 0;
  let addToCartValue = 0;
  let checkoutClickCount = 0;
  let checkoutValue = 0;
  let salesCount = 0;
  let totalRevenue = 0;
  let currency = 'ILS';

  for (const event of events) {
    // Track video views
    if (event.event_type === 'video_view') {
      videoViews++;
      uniqueViewers.add(event.viewer_id);
    }

    // Track product clicks
    if (event.event_type === 'product_click') {
      productClickCount++;
      uniqueProductClickViewers.add(event.viewer_id);
    }

    // Track add to cart
    if (event.event_type === 'add_to_cart') {
      addToCartCount++;
      uniqueCartViewers.add(event.viewer_id);

      const value = event.unit_price
        ? event.unit_price * (event.quantity || 1)
        : (event.metadata?.value as number) || 0;
      addToCartValue += value;

      if (event.currency) {
        currency = event.currency;
      }

      // Track per-product metrics
      if (event.product_id) {
        const existing = productMetricsMap.get(event.product_id) || {
          addToCartCount: 0,
          addToCartValue: 0,
          uniqueViewers: new Set<string>(),
        };
        existing.addToCartCount++;
        existing.addToCartValue += value;
        existing.uniqueViewers.add(event.viewer_id);
        productMetricsMap.set(event.product_id, existing);
      }
    }

    // Track checkout clicks
    if (event.event_type === 'checkout_start' || event.event_type === 'checkout_click') {
      checkoutClickCount++;
      uniqueCheckoutViewers.add(event.viewer_id);

      const value = (event.metadata?.value as number) || 0;
      checkoutValue += value;
    }

    // Track completed orders
    if (event.event_type === 'order_completed') {
      salesCount++;
      const orderTotal = (event.metadata?.order_total as number) || 0;
      totalRevenue += orderTotal;

      if (event.metadata?.currency) {
        currency = event.metadata.currency as string;
      }
    }
  }

  // Calculate conversion rates
  const viewerToCartRate = uniqueViewers.size > 0
    ? (uniqueCartViewers.size / uniqueViewers.size) * 100
    : 0;

  const cartToCheckoutRate = uniqueCartViewers.size > 0
    ? (uniqueCheckoutViewers.size / uniqueCartViewers.size) * 100
    : 0;

  // Convert product metrics map to sorted array
  const productMetrics = Array.from(productMetricsMap.entries())
    .map(([productId, data]) => ({
      productId,
      addToCartCount: data.addToCartCount,
      addToCartValue: data.addToCartValue,
      uniqueViewers: data.uniqueViewers.size,
    }))
    .sort((a, b) => b.addToCartCount - a.addToCartCount);

  return {
    metrics: {
      videoViews,
      uniqueViewers: uniqueViewers.size,
      productClickCount,
      uniqueProductClickViewers: uniqueProductClickViewers.size,
      addToCartCount,
      uniqueAddToCartViewers: uniqueCartViewers.size,
      addToCartValue,
      checkoutClickCount,
      uniqueCheckoutViewers: uniqueCheckoutViewers.size,
      checkoutValue,
      viewerToCartRate,
      cartToCheckoutRate,
      salesCount,
      totalRevenue,
      currency,
    },
    productMetrics,
  };
}

/**
 * Hook for video analytics
 * Fetches and aggregates events from video_events table
 */
export function useVideoAnalytics(videoId: string) {
  const [metrics, setMetrics] = useState<VideoMetrics>(initialMetrics);
  const [productMetrics, setProductMetrics] = useState<VideoProductMetrics[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Guard against empty videoId
  const validVideoId = videoId && videoId.trim() !== '';

  const loadMetrics = useCallback(async () => {
    if (!validVideoId) {
      setIsLoading(false);
      return;
    }

    const supabase = createClient();

    try {
      const { data: events, error } = await supabase
        .from('video_events')
        .select('*')
        .eq('video_id', videoId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Failed to load video analytics:', error);
        return;
      }

      const { metrics: newMetrics, productMetrics: newProductMetrics } = aggregateEvents(events || []);
      setMetrics(newMetrics);
      setProductMetrics(newProductMetrics);
    } catch (error) {
      console.error('Failed to load video analytics:', error);
    } finally {
      setIsLoading(false);
    }
  }, [videoId, validVideoId]);

  useEffect(() => {
    if (!validVideoId) return;

    loadMetrics();

    // Subscribe to real-time updates
    const supabase = createClient();
    const channel = supabase
      .channel(`video-analytics:${videoId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'video_events',
          filter: `video_id=eq.${videoId}`,
        },
        () => {
          // Reload all metrics on new event
          loadMetrics();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [videoId, validVideoId, loadMetrics]);

  const refresh = useCallback(() => {
    setIsLoading(true);
    loadMetrics();
  }, [loadMetrics]);

  return {
    metrics,
    productMetrics,
    isLoading,
    refresh,
  };
}
