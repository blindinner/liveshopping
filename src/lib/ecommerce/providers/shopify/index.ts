// Shopify Provider Implementation
// Implements the EcommerceProvider interface for Shopify stores

import { EcommerceProvider } from '../base';
import type {
  PlatformType,
  NormalizedProduct,
  NormalizedCart,
  NormalizedOrder,
  FetchProductsOptions,
  CartItemInput,
  ProviderCapabilities,
} from '../../types';
import {
  createShopifyClient,
  PRODUCTS_QUERY,
  PRODUCT_BY_ID_QUERY,
  CREATE_CART_MUTATION,
  ADD_TO_CART_MUTATION,
  UPDATE_CART_MUTATION,
  REMOVE_FROM_CART_MUTATION,
  GET_CART_QUERY,
  type ShopifyProduct,
  type ShopifyCart,
  type ShopifyOrderWebhook,
} from './client';
import { verifyShopifyWebhook } from './webhooks';
import type { GraphQLClient } from 'graphql-request';

export class ShopifyProvider extends EcommerceProvider {
  readonly platform: PlatformType = 'shopify';
  readonly capabilities: ProviderCapabilities = {
    supportsCartToken: true, // Shopify includes cart_token in orders
    supportsWebhooks: true,
    supportsInventory: true,
    supportsVariants: true,
  };

  private client: GraphQLClient | null = null;
  private domain: string = '';

  protected validateConfig(): void {
    if (!this.config) {
      throw new Error('Provider not initialized');
    }

    const { domain, storefront_token } = this.config.credentials;

    if (!domain) {
      throw new Error('Shopify domain is required');
    }

    this.domain = domain;

    // Only create client if storefront_token is available
    // Webhook verification doesn't need the client
    if (storefront_token) {
      this.client = createShopifyClient(domain, storefront_token);
    }
  }

  private getClient(): GraphQLClient {
    if (!this.client) {
      throw new Error('Shopify storefront token is required for this operation');
    }
    return this.client;
  }

  // ============================================
  // Product Operations
  // ============================================

  async fetchProducts(options?: FetchProductsOptions): Promise<NormalizedProduct[]> {
    const client = this.getClient();
    const first = options?.first ?? 20;
    const query = options?.query ?? '';

    const response = await client.request<{
      products: { edges: Array<{ node: ShopifyProduct }> };
    }>(PRODUCTS_QUERY, { first, query });

    return response.products.edges.flatMap((edge) =>
      this.normalizeProduct(edge.node)
    );
  }

  async fetchProduct(productId: string): Promise<NormalizedProduct | null> {
    const client = this.getClient();

    try {
      const response = await client.request<{ product: ShopifyProduct | null }>(
        PRODUCT_BY_ID_QUERY,
        { id: productId }
      );

      if (!response.product) return null;

      const products = this.normalizeProduct(response.product);
      return products[0] || null;
    } catch {
      return null;
    }
  }

  private normalizeProduct(product: ShopifyProduct): NormalizedProduct[] {
    // Shopify products can have multiple variants
    // We normalize each variant as a separate "product" for simplicity
    return product.variants.edges.map((variantEdge) => {
      const variant = variantEdge.node;
      return {
        platformProductId: product.id,
        platformVariantId: variant.id,
        title: variant.title !== 'Default Title'
          ? `${product.title} - ${variant.title}`
          : product.title,
        description: product.description,
        price: parseFloat(variant.price.amount),
        compareAtPrice: variant.compareAtPrice
          ? parseFloat(variant.compareAtPrice.amount)
          : undefined,
        currency: variant.price.currencyCode,
        imageUrl: product.featuredImage?.url,
        available: variant.availableForSale,
        platform: 'shopify',
      };
    });
  }

  // ============================================
  // Cart Operations
  // ============================================

  async createCart(items: CartItemInput[]): Promise<NormalizedCart> {
    const client = this.getClient();

    const response = await client.request<{
      cartCreate: {
        cart: ShopifyCart;
        userErrors: Array<{ field: string[]; message: string }>;
      };
    }>(CREATE_CART_MUTATION, {
      input: {
        lines: items.map((item) => ({
          merchandiseId: item.variantId,
          quantity: item.quantity,
        })),
      },
    });

    if (response.cartCreate.userErrors.length > 0) {
      throw new Error(response.cartCreate.userErrors[0].message);
    }

    return this.normalizeCart(response.cartCreate.cart);
  }

  async addToCart(cartId: string, items: CartItemInput[]): Promise<NormalizedCart> {
    const client = this.getClient();

    const response = await client.request<{
      cartLinesAdd: {
        cart: ShopifyCart;
        userErrors: Array<{ field: string[]; message: string }>;
      };
    }>(ADD_TO_CART_MUTATION, {
      cartId,
      lines: items.map((item) => ({
        merchandiseId: item.variantId,
        quantity: item.quantity,
      })),
    });

    if (response.cartLinesAdd.userErrors.length > 0) {
      throw new Error(response.cartLinesAdd.userErrors[0].message);
    }

    return this.normalizeCart(response.cartLinesAdd.cart);
  }

  async updateCartItem(
    cartId: string,
    lineId: string,
    quantity: number
  ): Promise<NormalizedCart> {
    const client = this.getClient();

    const response = await client.request<{
      cartLinesUpdate: {
        cart: ShopifyCart;
        userErrors: Array<{ field: string[]; message: string }>;
      };
    }>(UPDATE_CART_MUTATION, {
      cartId,
      lines: [{ id: lineId, quantity }],
    });

    if (response.cartLinesUpdate.userErrors.length > 0) {
      throw new Error(response.cartLinesUpdate.userErrors[0].message);
    }

    return this.normalizeCart(response.cartLinesUpdate.cart);
  }

  async removeFromCart(cartId: string, lineIds: string[]): Promise<NormalizedCart> {
    const client = this.getClient();

    const response = await client.request<{
      cartLinesRemove: {
        cart: ShopifyCart;
        userErrors: Array<{ field: string[]; message: string }>;
      };
    }>(REMOVE_FROM_CART_MUTATION, {
      cartId,
      lineIds,
    });

    if (response.cartLinesRemove.userErrors.length > 0) {
      throw new Error(response.cartLinesRemove.userErrors[0].message);
    }

    return this.normalizeCart(response.cartLinesRemove.cart);
  }

  async getCart(cartId: string): Promise<NormalizedCart | null> {
    const client = this.getClient();

    try {
      const response = await client.request<{ cart: ShopifyCart | null }>(
        GET_CART_QUERY,
        { cartId }
      );

      if (!response.cart) return null;

      return this.normalizeCart(response.cart);
    } catch {
      return null;
    }
  }

  private normalizeCart(cart: ShopifyCart): NormalizedCart {
    return {
      cartId: cart.id,
      checkoutUrl: cart.checkoutUrl,
      items: cart.lines.edges.map((edge) => ({
        lineId: edge.node.id,
        productId: edge.node.merchandise.product.id,
        variantId: edge.node.merchandise.id,
        title: edge.node.merchandise.product.title,
        price: parseFloat(edge.node.merchandise.price.amount),
        quantity: edge.node.quantity,
        imageUrl: edge.node.merchandise.product.featuredImage?.url,
      })),
      totalAmount: parseFloat(cart.cost.totalAmount.amount),
      currency: cart.cost.totalAmount.currencyCode,
    };
  }

  // ============================================
  // Webhook Operations
  // ============================================

  verifyWebhook(
    headers: Record<string, string>,
    body: string | Buffer,
    secret: string
  ): boolean {
    return verifyShopifyWebhook(headers, body, secret);
  }

  parseOrderWebhook(eventType: string, payload: unknown): NormalizedOrder {
    const order = payload as ShopifyOrderWebhook;

    return {
      orderId: order.id.toString(),
      cartId: order.cart_token || undefined,
      orderNumber: order.name,
      customerEmail: order.email,
      totalAmount: parseFloat(order.total_price),
      subtotalAmount: parseFloat(order.subtotal_price),
      taxAmount: parseFloat(order.total_tax),
      shippingAmount: order.total_shipping_price_set
        ? parseFloat(order.total_shipping_price_set.shop_money.amount)
        : undefined,
      currency: order.currency,
      lineItems: order.line_items.map((item) => ({
        productId: item.product_id?.toString() ?? '',
        variantId: item.variant_id?.toString() ?? '',
        title: item.title,
        quantity: item.quantity,
        price: parseFloat(item.price),
      })),
      createdAt: new Date(order.created_at),
      status: this.mapOrderStatus(order.financial_status, order.fulfillment_status),
    };
  }

  extractCartIdFromOrder(order: NormalizedOrder | unknown): string | null {
    // If it's already normalized, use cartId
    if (typeof order === 'object' && order !== null && 'cartId' in order) {
      return (order as NormalizedOrder).cartId || null;
    }

    // If it's raw Shopify payload, extract cart_token
    if (typeof order === 'object' && order !== null && 'cart_token' in order) {
      return (order as ShopifyOrderWebhook).cart_token || null;
    }

    return null;
  }

  /**
   * Extract live shopping attribution data from order.
   *
   * For live shows: Uses note_attributes with _live_shopping_* prefix
   * For shoppable videos: Uses note_attributes with _ssv_* prefix (injected by tracking.js)
   * Fallback: Parses landing_site URL params
   *
   * Supports both live shows (showId) and shoppable videos (videoId).
   */
  extractAttributionFromOrder(order: unknown): { showId?: string; videoId?: string; viewerId: string } | null {
    if (typeof order !== 'object' || order === null) {
      return null;
    }

    const shopifyOrder = order as ShopifyOrderWebhook;
    const noteAttributes = shopifyOrder.note_attributes || [];

    let showId: string | null = null;
    let videoId: string | null = null;
    let viewerId: string | null = null;

    // First, try to extract from note_attributes
    for (const attr of noteAttributes) {
      // Live shows use _live_shopping_* prefix
      if (attr.name === '_live_shopping_show_id') {
        showId = attr.value;
      }
      if (attr.name === '_live_shopping_video_id') {
        videoId = attr.value;
      }
      if (attr.name === '_live_shopping_viewer_id') {
        viewerId = attr.value;
      }
      // Shoppable videos use _ssv_* prefix (injected by tracking.js widget)
      if (attr.name === '_ssv_video_id') {
        videoId = attr.value;
      }
      if (attr.name === '_ssv_viewer_id') {
        viewerId = attr.value;
      }
    }

    // If found in note_attributes, return it
    if (viewerId && (showId || videoId)) {
      return {
        showId: showId || undefined,
        videoId: videoId || undefined,
        viewerId,
      };
    }

    // Fallback: Parse landing_site URL for shoppable video attribution
    // Shoppable videos append params like ?ssvid=VIDEO_ID&ssvwr=VIEWER_ID
    if (shopifyOrder.landing_site) {
      try {
        // landing_site is usually just the path with query string, e.g., "/products/item?ssvid=xxx"
        const url = new URL(shopifyOrder.landing_site, 'https://placeholder.com');
        const ssvid = url.searchParams.get('ssvid'); // shoppable video id
        const ssvwr = url.searchParams.get('ssvwr'); // viewer id

        // Also check utm_campaign as fallback for video id
        const utmCampaign = url.searchParams.get('utm_campaign');
        const utmSource = url.searchParams.get('utm_source');

        if (ssvid && ssvwr) {
          return {
            videoId: ssvid,
            viewerId: ssvwr,
          };
        }

        // Fallback to utm_campaign if it looks like a video ID and source is shoppable_video
        if (utmSource === 'shoppable_video' && utmCampaign) {
          // Generate a viewer ID based on order info since we don't have the original
          const generatedViewerId = `order-${shopifyOrder.id}`;
          return {
            videoId: utmCampaign,
            viewerId: generatedViewerId,
          };
        }
      } catch {
        // Invalid URL, continue
      }
    }

    return null;
  }

  private mapOrderStatus(
    financialStatus: string,
    fulfillmentStatus: string | null
  ): 'pending' | 'paid' | 'fulfilled' | 'cancelled' {
    if (financialStatus === 'refunded' || financialStatus === 'voided') {
      return 'cancelled';
    }
    if (fulfillmentStatus === 'fulfilled') {
      return 'fulfilled';
    }
    if (financialStatus === 'paid' || financialStatus === 'partially_paid') {
      return 'paid';
    }
    return 'pending';
  }
}
