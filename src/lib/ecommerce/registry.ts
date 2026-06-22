// E-commerce Provider Registry
// Factory for creating platform-specific providers

import { ShopifyProvider } from './providers/shopify';
import type { EcommerceProvider } from './providers/base';
import type { PlatformType, PlatformConfig } from './types';

// Placeholder for unimplemented providers
class NotImplementedProvider {
  constructor() {
    throw new Error('This e-commerce platform is not yet implemented');
  }
}

// Registry of available providers
const providers: Record<PlatformType, new () => EcommerceProvider> = {
  shopify: ShopifyProvider,
  woocommerce: NotImplementedProvider as unknown as new () => EcommerceProvider,
  bigcommerce: NotImplementedProvider as unknown as new () => EcommerceProvider,
  magento: NotImplementedProvider as unknown as new () => EcommerceProvider,
};

/**
 * Get a provider instance for the given configuration
 */
export function getProvider(config: PlatformConfig): EcommerceProvider {
  const ProviderClass = providers[config.platform];

  if (!ProviderClass) {
    throw new Error(`Unsupported platform: ${config.platform}`);
  }

  const provider = new ProviderClass();
  provider.initialize(config);
  return provider;
}

/**
 * Check if a platform is supported
 */
export function isPlatformSupported(platform: PlatformType): boolean {
  return platform === 'shopify'; // Only Shopify is implemented for now
}

/**
 * Get list of supported platforms
 */
export function getSupportedPlatforms(): PlatformType[] {
  return ['shopify'];
}
