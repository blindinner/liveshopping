// Database types matching Supabase schema

export type ShowStatus = 'scheduled' | 'live' | 'ended';

export type PlatformType = 'shopify' | 'woocommerce' | 'bigcommerce' | 'magento';

export interface Brand {
  id: string;
  name: string;
  shopify_domain: string;
  shopify_storefront_token: string; // Server-only, never exposed to client
  platform: PlatformType;
  platform_config: Record<string, string>; // Platform-specific config (webhook_secret, etc.)
  created_at: string;
  updated_at: string;
}

export interface Show {
  id: string;
  brand_id: string;
  title: string;
  scheduled_at: string;
  status: ShowStatus;
  cloudflare_stream_id: string | null;
  cloudflare_playback_id: string | null;
  cloudflare_webrtc_url: string | null; // Host-only - WHIP URL for browser streaming
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
  updated_at: string;
}

export type ProductSource = 'shopify' | 'manual';

export interface Product {
  id: string;
  brand_id: string;
  shopify_product_id: string | null;
  shopify_variant_id: string | null;
  title: string;
  price: number;
  currency: string;
  image_url: string | null;
  source: ProductSource;
  checkout_url: string | null; // External URL for manual products
  created_at: string;
  updated_at: string;
}

export interface ShowProduct {
  id: string;
  show_id: string;
  product_id: string;
  display_order: number;
  is_active: boolean;
  host_notes: string | null;
  created_at: string;
  // Joined product data
  product?: Product;
}

export interface ChatMessage {
  id: string;
  show_id: string;
  viewer_name: string;
  message: string;
  hidden: boolean;
  created_at: string;
}

export interface Lead {
  id: string;
  show_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  consent: boolean;
  created_at: string;
}

// Realtime payload types
export interface RealtimePayload<T> {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: T;
  old: T | null;
}

// Viewer presence type
export interface ViewerPresence {
  viewer_id: string;
  viewer_name?: string;
  online_at: string;
}

// Reaction broadcast type
export interface ReactionBroadcast {
  type: 'reaction';
  emoji: string;
  viewer_id: string;
  x: number; // Position for animation
  y: number;
}

// Cart types (client-side, synced with Shopify)
export interface CartItem {
  product: Product;
  quantity: number;
  shopify_line_id?: string;
}

export interface Cart {
  id: string | null; // Shopify cart ID
  items: CartItem[];
  checkoutUrl: string | null;
}

// Analytics types
export type ShowEventType =
  | 'viewer_join'
  | 'viewer_leave'
  | 'add_to_cart'
  | 'checkout_click'
  | 'product_view'
  | 'reaction'
  | 'chat_message'
  | 'order_completed';

export interface ShowEvent {
  id: string;
  show_id: string;
  viewer_id: string;
  event_type: ShowEventType;
  product_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface CartSession {
  id: string;
  show_id: string;
  brand_id: string;
  viewer_id: string;
  platform_cart_id: string;
  platform: PlatformType;
  checkout_url: string | null;
  converted: boolean;
  order_id: string | null;
  order_total: number | null;
  order_currency: string | null;
  created_at: string;
  converted_at: string | null;
}

// Analytics metrics for dashboard
export interface ShowMetrics {
  // Viewer metrics
  viewerCount: number;
  peakViewers: number;
  uniqueViewers: number;

  // Engagement metrics
  chatCount: number;
  reactionCount: number;
  productViewCount: number;

  // Cart metrics
  addToCartCount: number;          // Total add-to-cart events
  uniqueAddToCartViewers: number;  // Unique viewers who added to cart
  addToCartValue: number;          // Total value of items added to cart
  averageCartValue: number;        // Average cart value per viewer

  // Checkout metrics
  checkoutClickCount: number;      // Total checkout clicks
  uniqueCheckoutViewers: number;   // Unique viewers who clicked checkout
  checkoutValue: number;           // Total value at checkout

  // Conversion rates
  viewerToCartRate: number;        // % of viewers who added to cart
  cartToCheckoutRate: number;      // % of add-to-cart who checked out

  // Sales metrics (from webhooks)
  salesCount: number;
  totalRevenue: number;

  currency: string;
}
