'use client';

import { useState, useEffect, useMemo } from 'react';
import type { VideoProduct, Product } from '@/types/database';

interface UseVideoProductsOptions {
  videoId: string;
  currentTime?: number;  // Current playback time in seconds
  videoDuration?: number;  // Total video duration in seconds
}

interface UseVideoProductsReturn {
  allProducts: VideoProduct[];
  visibleProducts: VideoProduct[];
  currentProduct: VideoProduct | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch video products and filter by current playback time
 *
 * Behavior:
 * - If only 1 product: Always show it
 * - If multiple products: Show based on timestamps
 */
export function useVideoProducts({
  videoId,
  currentTime = 0,
  videoDuration,
}: UseVideoProductsOptions): UseVideoProductsReturn {
  const [allProducts, setAllProducts] = useState<VideoProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/videos/${videoId}/products`);
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const { videoProducts } = await response.json();
      setAllProducts(videoProducts || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (videoId) {
      fetchProducts();
    }
  }, [videoId]);

  // Filter products visible at current time
  const visibleProducts = useMemo(() => {
    // If only 1 product, always show it
    if (allProducts.length <= 1) {
      return allProducts;
    }

    // Filter by timestamp
    return allProducts.filter((vp) => {
      const startTime = vp.start_time_seconds || 0;
      const endTime = vp.end_time_seconds ?? (videoDuration || Infinity);

      return currentTime >= startTime && currentTime < endTime;
    });
  }, [allProducts, currentTime, videoDuration]);

  // Get the primary visible product (first in display order)
  const currentProduct = useMemo(() => {
    if (visibleProducts.length === 0) return null;
    return visibleProducts.reduce((prev, curr) =>
      curr.display_order < prev.display_order ? curr : prev
    );
  }, [visibleProducts]);

  return {
    allProducts,
    visibleProducts,
    currentProduct,
    isLoading,
    error,
    refetch: fetchProducts,
  };
}

/**
 * Get products that will be visible at a specific time
 * Useful for timeline preview
 */
export function getProductsAtTime(
  products: VideoProduct[],
  time: number,
  videoDuration?: number
): VideoProduct[] {
  if (products.length <= 1) {
    return products;
  }

  return products.filter((vp) => {
    const startTime = vp.start_time_seconds || 0;
    const endTime = vp.end_time_seconds ?? (videoDuration || Infinity);
    return time >= startTime && time < endTime;
  });
}

/**
 * Format seconds as MM:SS for display
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
