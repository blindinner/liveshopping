'use client';

import { useState, useCallback, useRef } from 'react';
import type { Cart, CartItem, Product } from '@/types/database';

// Helper to track events (fire and forget)
async function trackEvent(
  showId: string | undefined,
  viewerId: string | undefined,
  eventType: string,
  productId?: string,
  metadata?: Record<string, unknown>
) {
  if (!showId || !viewerId) {
    console.warn('[Analytics] Missing showId or viewerId:', { showId, viewerId, eventType });
    return;
  }

  try {
    console.log('[Analytics] Tracking event:', { showId, viewerId, eventType, productId });
    const response = await fetch(`/api/shows/${showId}/events`, {
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
  showId: string | undefined,
  viewerId: string | undefined,
  platformCartId: string,
  checkoutUrl?: string
) {
  if (!showId || !viewerId) return;

  try {
    await fetch('/api/cart-sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        showId,
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
  viewerId?: string;
}

// Cart state managed client-side, synced with Shopify via API routes
export function useCart(options: UseCartOptions = {}) {
  const { showId, viewerId } = options;

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
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add to cart');
      }

      const data = await response.json();

      // Track add_to_cart event with value
      trackEvent(showId, viewerId, 'add_to_cart', product.id, {
        quantity,
        price: product.price,
        value: product.price * quantity,
        currency: product.currency,
        product_title: product.title,
      });

      // Create cart session for attribution (only once per cart)
      if (!cartSessionCreated.current && data.cartId) {
        cartSessionCreated.current = true;
        createCartSession(showId, viewerId, data.cartId, data.checkoutUrl);
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
      trackEvent(showId, viewerId, 'checkout_click', undefined, {
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
  }, [cart.checkoutUrl, showId, viewerId, total, itemCount]);

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
  };
}
