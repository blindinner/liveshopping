// E-commerce Module
// Platform-agnostic e-commerce integration layer

// Types
export type {
  PlatformType,
  PlatformConfig,
  NormalizedProduct,
  NormalizedCart,
  NormalizedCartItem,
  NormalizedOrder,
  NormalizedOrderLineItem,
  WebhookPayload,
  FetchProductsOptions,
  CartItemInput,
  ProviderCapabilities,
} from './types';

// Provider base class (for extending)
export { EcommerceProvider } from './providers/base';

// Provider registry
export {
  getProvider,
  isPlatformSupported,
  getSupportedPlatforms,
} from './registry';

// Shopify provider (direct access if needed)
export { ShopifyProvider } from './providers/shopify';
