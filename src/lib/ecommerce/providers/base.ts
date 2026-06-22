// Abstract base class for e-commerce providers
// All platform integrations must implement this interface

import type {
  PlatformType,
  PlatformConfig,
  NormalizedProduct,
  NormalizedCart,
  NormalizedOrder,
  FetchProductsOptions,
  CartItemInput,
  ProviderCapabilities,
} from '../types';

export abstract class EcommerceProvider {
  abstract readonly platform: PlatformType;
  abstract readonly capabilities: ProviderCapabilities;

  protected config: PlatformConfig | null = null;

  /**
   * Initialize the provider with platform-specific credentials
   */
  initialize(config: PlatformConfig): void {
    if (config.platform !== this.platform) {
      throw new Error(
        `Config platform "${config.platform}" does not match provider platform "${this.platform}"`
      );
    }
    this.config = config;
    this.validateConfig();
  }

  /**
   * Validate that required credentials are present
   */
  protected abstract validateConfig(): void;

  // ============================================
  // Product Operations
  // ============================================

  /**
   * Fetch products from the platform
   */
  abstract fetchProducts(options?: FetchProductsOptions): Promise<NormalizedProduct[]>;

  /**
   * Fetch a single product by ID
   */
  abstract fetchProduct(productId: string): Promise<NormalizedProduct | null>;

  // ============================================
  // Cart Operations
  // ============================================

  /**
   * Create a new cart with initial items
   */
  abstract createCart(items: CartItemInput[]): Promise<NormalizedCart>;

  /**
   * Add items to an existing cart
   */
  abstract addToCart(cartId: string, items: CartItemInput[]): Promise<NormalizedCart>;

  /**
   * Update quantity of an item in the cart
   */
  abstract updateCartItem(
    cartId: string,
    lineId: string,
    quantity: number
  ): Promise<NormalizedCart>;

  /**
   * Remove items from the cart
   */
  abstract removeFromCart(cartId: string, lineIds: string[]): Promise<NormalizedCart>;

  /**
   * Get the current state of a cart
   */
  abstract getCart(cartId: string): Promise<NormalizedCart | null>;

  // ============================================
  // Webhook Operations
  // ============================================

  /**
   * Verify webhook signature is authentic
   */
  abstract verifyWebhook(
    headers: Record<string, string>,
    body: string | Buffer,
    secret: string
  ): boolean;

  /**
   * Parse webhook payload into normalized order
   */
  abstract parseOrderWebhook(
    eventType: string,
    payload: unknown
  ): NormalizedOrder;

  /**
   * Extract cart ID from order for attribution
   * Returns null if platform doesn't support cart tracking
   */
  abstract extractCartIdFromOrder(order: NormalizedOrder | unknown): string | null;
}
