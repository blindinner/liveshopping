// Platform-agnostic e-commerce types
// Supports Shopify, WooCommerce, BigCommerce, Magento, and future platforms

export type PlatformType = 'shopify' | 'woocommerce' | 'bigcommerce' | 'magento';

export interface PlatformConfig {
  platform: PlatformType;
  credentials: Record<string, string>;
}

// Normalized product representation across all platforms
export interface NormalizedProduct {
  platformProductId: string;
  platformVariantId: string;
  title: string;
  description?: string;
  price: number;
  compareAtPrice?: number;
  currency: string;
  imageUrl?: string;
  available: boolean;
  platform: PlatformType;
}

// Normalized cart representation
export interface NormalizedCart {
  cartId: string;
  checkoutUrl: string;
  items: NormalizedCartItem[];
  totalAmount: number;
  currency: string;
}

export interface NormalizedCartItem {
  lineId: string;
  productId: string;
  variantId: string;
  title: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

// Normalized order from webhooks
export interface NormalizedOrder {
  orderId: string;
  cartId?: string; // For attribution - not all platforms include this
  orderNumber?: string;
  customerEmail?: string;
  totalAmount: number;
  subtotalAmount?: number;
  taxAmount?: number;
  shippingAmount?: number;
  currency: string;
  lineItems: NormalizedOrderLineItem[];
  createdAt: Date;
  status: 'pending' | 'paid' | 'fulfilled' | 'cancelled';
}

export interface NormalizedOrderLineItem {
  productId: string;
  variantId: string;
  title: string;
  quantity: number;
  price: number;
}

// Webhook payload wrapper
export interface WebhookPayload {
  provider: PlatformType;
  eventType: 'order.created' | 'order.updated' | 'order.paid' | 'order.cancelled';
  rawPayload: unknown;
  normalizedOrder: NormalizedOrder;
}

// Options for fetching products
export interface FetchProductsOptions {
  query?: string;
  first?: number;
  productIds?: string[];
}

// Cart item input
export interface CartItemInput {
  variantId: string;
  quantity: number;
}

// Provider capabilities - what each platform supports
export interface ProviderCapabilities {
  supportsCartToken: boolean; // Can we track cart → order?
  supportsWebhooks: boolean;
  supportsInventory: boolean;
  supportsVariants: boolean;
}
