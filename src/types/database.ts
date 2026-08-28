// Database types matching Supabase schema

export type ShowStatus = 'scheduled' | 'live' | 'ended';

export type AuctionType = 'public' | 'private';

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
  auction_type: AuctionType;
  cloudflare_stream_id: string | null;
  cloudflare_playback_id: string | null;
  cloudflare_webrtc_url: string | null; // Host-only - WHIP URL for browser streaming
  embed_url: string | null; // Optional URL where show is embedded (for white-label redirects)
  _brandDomain?: string | null; // Populated by useShowStatus hook from brand.shopify_domain
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
  handle: string | null; // Product URL slug for Shopify products
  price: number;
  currency: string;
  image_url: string | null;
  source: ProductSource;
  checkout_url: string | null; // External URL for manual products
  created_at: string;
  updated_at: string;
}

// Auction types
export type SaleType = 'buy_now' | 'auction';
export type AuctionStatus = 'pending' | 'active' | 'ended';

export interface ShowProduct {
  id: string;
  show_id: string;
  product_id: string;
  display_order: number;
  is_active: boolean;
  host_notes: string | null;
  created_at: string;
  // Auction fields
  sale_type: SaleType;
  starting_price: number | null;
  bid_increment: number | null;
  auction_status: AuctionStatus | null;
  auction_ended_at: string | null;
  winner_bidder_id: string | null;
  // Joined product data
  product?: Product;
  // Computed auction data (from queries)
  current_bid?: number;
  bid_count?: number;
  highest_bidder?: Bidder;
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

// Poll types
export type PollStatus = 'draft' | 'active' | 'ended';

export interface Poll {
  id: string;
  show_id: string;
  question: string;
  status: PollStatus;
  show_results_live: boolean;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  options?: PollOption[];
}

export interface PollOption {
  id: string;
  poll_id: string;
  option_text: string;
  display_order: number;
  created_at: string;
  // Computed (from aggregation)
  vote_count?: number;
}

export interface PollVote {
  id: string;
  poll_id: string;
  option_id: string;
  viewer_id: string;
  created_at: string;
}

// Poll with computed results for display
export interface PollWithResults extends Poll {
  options: PollOption[];
  total_votes: number;
  viewer_vote?: string; // option_id the current viewer voted for
}

// Guest profile for private auctions (persistent across shows)
export interface GuestProfile {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  company_name: string | null;
  vat_number: string | null;
  is_business: boolean;
  billing_address: string | null;
  billing_city: string | null;
  billing_postal_code: string | null;
  billing_country: string | null;
  created_at: string;
  updated_at: string;
}

// Invitation status for private auctions
export type InvitationStatus = 'pending' | 'accepted' | 'declined';

// Invitation for private auctions
export interface Invitation {
  id: string;
  show_id: string;
  guest_profile_id: string | null;
  email: string;
  invite_token: string;
  status: InvitationStatus;
  sent_at: string | null;
  accepted_at: string | null;
  declined_at: string | null;
  created_at: string;
  // Joined data
  guest_profile?: GuestProfile;
  show?: Show;
}

// Bidder types
export interface Bidder {
  id: string;
  show_id: string;
  viewer_id: string;
  name: string;
  email: string;
  phone: string | null;
  approved: boolean;
  invitation_id: string | null;
  created_at: string;
  // Joined data
  invitation?: Invitation;
}

export interface Bid {
  id: string;
  show_product_id: string;
  bidder_id: string;
  amount: number;
  created_at: string;
  // Joined data
  bidder?: Bidder;
}

export interface AuctionWinner {
  id: string;
  show_product_id: string;
  bidder_id: string;
  winning_amount: number;
  payment_status: 'pending' | 'paid';
  paid_at: string | null;
  created_at: string;
  // Joined data
  bidder?: Bidder;
  show_product?: ShowProduct;
}

// Video types (for shoppable videos feature)
export type VideoStatus = 'processing' | 'ready' | 'error';

export interface Video {
  id: string;
  brand_id: string;
  title: string;
  description: string | null;
  product_id: string | null;  // Legacy - use video_products instead
  cloudflare_stream_id: string | null;
  cloudflare_playback_id: string | null;
  thumbnail_url: string | null;
  cover_image_url: string | null;  // Custom thumbnail for carousel
  duration_seconds: number | null;
  status: VideoStatus;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  // Joined data
  product?: Product;  // Legacy single product
  products?: VideoProduct[];  // Multiple products with timestamps
}

export interface VideoProduct {
  id: string;
  video_id: string;
  product_id: string;
  start_time_seconds: number;  // When product appears (0 = start)
  end_time_seconds: number | null;  // When product disappears (null = until end)
  display_order: number;
  created_at: string;
  // Joined data
  product?: Product;
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
  | 'order_completed'
  | 'item_purchased'
  | 'poll_vote'
  | 'video_view'
  | 'video_play'
  | 'video_complete'
  | 'bid_placed'
  | 'auction_won';

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
