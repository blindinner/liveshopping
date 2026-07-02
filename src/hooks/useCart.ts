'use client';

import { useState, useCallback, useRef } from 'react';
import type { Cart, CartItem, Product } from '@/types/database';

// Helper to track events (fire and forget)
// Supports both show and video contexts
async function trackEvent(
  context: { showId?: string; videoId?: string },
  viewerId: string | undefined,
  eventType: string,
  productId?: string,
  metadata?: Record<string, unknown>
) {
  const { showId, videoId } = context;

  if (!viewerId || (!showId && !videoId)) {
    console.warn('[Analytics] Missing viewerId or context:', { showId, videoId, viewerId, eventType });
    return;
  }

  try {
    // Determine which endpoint to use
    const endpoint = showId
      ? `/api/shows/${showId}/events`
      : `/api/videos/${videoId}/events`;

    console.log('[Analytics] Tracking event:', { showId, videoId, viewerId, eventType, productId });
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType,
        viewerId,
        productId,
        metadata,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('[Analytics] Failed to track event:', error);
    } else {
      console.log('[Analytics] Event tracked successfully');
    }
  } catch (error) {
    console.error('[Analytics] Failed to track event:', error);
  }
}

// Helper to create/update cart session for attribution
async function createCartSession(
  context: { showId?: string; videoId?: string },
  viewerId: string | undefined,
  platformCartId: string,
  checkoutUrl?: string
) {
  const { showId, videoId } = context;
  if ((!showId && !videoId) || !viewerId) return;

  try {
    await fetch('/api/cart-sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        showId,
        videoId,
        viewerId,
        platformCartId,
        checkoutUrl,
        platform: 'shopify',
      }),
    });
  } catch (error) {
    console.error('Failed to create cart session:', error);
  }
}

interface UseCartOptions {
  showId?: string;
  videoId?: string;
  viewerId?: string;
}

// Cart state managed client-side, synced with Shopify via API routes
export function useCart(options: UseCartOptions = {}) {
  const { showId, videoId, viewerId } = options;

  // Context object for tracking - supports both shows and videos
  const trackingContext = { showId, videoId };

  const [cart, setCart] = useState<Cart>({
    id: null,
    items: [],
    checkoutUrl: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track if we've already created a cart session
  const cartSessionCreated = useRef(false);

  const addToCart = useCallback(async (product: Product, quantity: number = 1) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartId: cart.id,
          variantId: product.shopify_variant_id,
          quantity,
          // Pass tracking data for attribution (only used when creating new cart)
          showId,
          videoId,
          viewerId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add to cart');
      }

      const data = await response.json();

      // Track add_to_cart event with value
      trackEvent(trackingContext, viewerId, 'add_to_cart', product.id, {
        quantity,
        price: product.price,
        value: product.price * quantity,
        currency: product.currency,
        product_title: product.title,
      });

      // Create cart session for attribution (only once per cart)
      if (!cartSessionCreated.current && data.cartId) {
        cartSessionCreated.current = true;
        createCartSession(trackingContext, viewerId, data.cartId, data.checkoutUrl);
      }

      // Update local cart state
      setCart((prev) => {
        const existingItem = prev.items.find(
          (item) => item.product.id === product.id
        );

        if (existingItem) {
          return {
            ...prev,
            id: data.cartId,
            checkoutUrl: data.checkoutUrl,
            items: prev.items.map((item) =>
              item.product.id === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
          };
        }

        return {
          ...prev,
          id: data.cartId,
          checkoutUrl: data.checkoutUrl,
          items: [...prev.items, { product, quantity, shopify_line_id: data.lineId }],
        };
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error adding to cart');
    } finally {
      setIsLoading(false);
    }
  }, [cart.id, showId, viewerId]);

  const updateQuantity = useCallback(
    async (productId: string, quantity: number) => {
      if (quantity < 1) {
        return removeFromCart(productId);
      }

      setIsLoading(true);
      setError(null);

      try {
        const item = cart.items.find((i) => i.product.id === productId);
        if (!item?.shopify_line_id || !cart.id) return;

        const response = await fetch('/api/cart/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cartId: cart.id,
            lineId: item.shopify_line_id,
            quantity,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to update cart');
        }

        setCart((prev) => ({
          ...prev,
          items: prev.items.map((i) =>
            i.product.id === productId ? { ...i, quantity } : i
          ),
        }));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error updating cart');
      } finally {
        setIsLoading(false);
      }
    },
    [cart.id, cart.items]
  );

  const removeFromCart = useCallback(
    async (productId: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const item = cart.items.find((i) => i.product.id === productId);
        if (!item?.shopify_line_id || !cart.id) {
          // Item not yet synced to Shopify, just remove locally
          setCart((prev) => ({
            ...prev,
            items: prev.items.filter((i) => i.product.id !== productId),
          }));
          return;
        }

        const response = await fetch('/api/cart/remove', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cartId: cart.id,
            lineId: item.shopify_line_id,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to remove from cart');
        }

        const data = await response.json();

        setCart((prev) => ({
          ...prev,
          checkoutUrl: data.checkoutUrl,
          items: prev.items.filter((i) => i.product.id !== productId),
        }));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error removing from cart');
      } finally {
        setIsLoading(false);
      }
    },
    [cart.id, cart.items]
  );

  const clearCart = useCallback(() => {
    setCart({
      id: null,
      items: [],
      checkoutUrl: null,
    });
  }, []);

  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  const total = cart.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const checkout = useCallback(() => {
    if (cart.checkoutUrl) {
      // Track checkout_click event with full value details
      trackEvent(trackingContext, viewerId, 'checkout_click', undefined, {
        cart_total: total,
        value: total,
        item_count: itemCount,
        currency: cart.items[0]?.product.currency || 'ILS',
      });

      // Open Shopify checkout in popup window so stream keeps playing
      const width = 450;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      window.open(
        cart.checkoutUrl,
        'shopify-checkout',
        `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
      );
    }
  }, [cart.checkoutUrl, trackingContext, viewerId, total, itemCount]);

  // Buy Now - creates cart with attribution and immediately redirects to checkout
  // This provides a one-click checkout experience while maintaining attribution tracking
  const buyNow = useCallback(async (product: Product, quantity: number = 1) => {
    setIsLoading(true);
    setError(null);

    try {
      // Create cart with product and attribution data
      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartId: null, // Always create a new cart for buy now
          variantId: product.shopify_variant_id,
          quantity,
          showId,
          videoId,
          viewerId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create cart');
      }

      const data = await response.json();

      // Track add_to_cart event
      trackEvent(trackingContext, viewerId, 'add_to_cart', product.id, {
        quantity,
        price: product.price,
        value: product.price * quantity,
        currency: product.currency,
        product_title: product.title,
      });

      // Create cart session for attribution
      if (data.cartId) {
        createCartSession(trackingContext, viewerId, data.cartId, data.checkoutUrl);
      }

      // Track checkout_click event
      trackEvent(trackingContext, viewerId, 'checkout_click', undefined, {
        cart_total: product.price * quantity,
        value: product.price * quantity,
        item_count: quantity,
        currency: product.currency,
      });

      // Open checkout immediately
      if (data.checkoutUrl) {
        const width = 450;
        const height = 700;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;

        window.open(
          data.checkoutUrl,
          'shopify-checkout',
          `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error processing purchase');
    } finally {
      setIsLoading(false);
    }
  }, [showId, videoId, viewerId, trackingContext]);

  return {
    cart,
    itemCount,
    total,
    isLoading,
    error,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    checkout,
    buyNow,
  };
}
