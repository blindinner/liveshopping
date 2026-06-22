// DEPRECATED: Use @/lib/ecommerce instead
// This file is kept for backward compatibility during migration

// Re-export from new location
export {
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
} from '@/lib/ecommerce/providers/shopify/client';

import { GraphQLClient } from 'graphql-request';

// Keep original function for existing imports that destructure
// @deprecated Use getProvider('shopify') from @/lib/ecommerce instead
export function createShopifyClientLegacy(domain: string, accessToken: string) {
  const endpoint = `https://${domain}/api/2024-01/graphql.json`;

  return new GraphQLClient(endpoint, {
    headers: {
      'X-Shopify-Storefront-Access-Token': accessToken,
      'Content-Type': 'application/json',
    },
  });
}

// Legacy type aliases for backward compatibility
// These are re-exported from the new location above
