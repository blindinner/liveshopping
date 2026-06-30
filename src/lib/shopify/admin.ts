/**
 * Shopify Admin API helpers
 * Used for operations that require the Admin API (webhooks, storefront tokens, etc.)
 */

const SHOPIFY_API_VERSION = '2024-01';

interface WebhookConfig {
  topic: string;
  address: string;
}

/**
 * Register webhooks for a Shopify store using the Admin API
 */
export async function registerShopifyWebhooks(
  shop: string,
  accessToken: string,
  appUrl: string
): Promise<void> {
  const webhooks: WebhookConfig[] = [
    {
      topic: 'orders/create',
      address: `${appUrl}/api/webhooks/shopify/orders`,
    },
    {
      topic: 'orders/paid',
      address: `${appUrl}/api/webhooks/shopify/orders`,
    },
    {
      topic: 'orders/cancelled',
      address: `${appUrl}/api/webhooks/shopify/orders`,
    },
    {
      topic: 'app/uninstalled',
      address: `${appUrl}/api/shopify/webhooks/app-uninstalled`,
    },
  ];

  for (const webhook of webhooks) {
    try {
      const response = await fetch(
        `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/webhooks.json`,
        {
          method: 'POST',
          headers: {
            'X-Shopify-Access-Token': accessToken,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            webhook: {
              topic: webhook.topic,
              address: webhook.address,
              format: 'json',
            },
          }),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        console.error(`Failed to register webhook ${webhook.topic}:`, error);
        // Continue with other webhooks even if one fails
      } else {
        console.log(`Registered webhook: ${webhook.topic}`);
      }
    } catch (error) {
      console.error(`Error registering webhook ${webhook.topic}:`, error);
    }
  }
}

/**
 * Create a Storefront API access token using the Admin API
 * This allows us to fully automate the setup without manual token creation
 */
export async function createStorefrontToken(
  shop: string,
  accessToken: string,
  title: string = 'Live Shopping App'
): Promise<string> {
  const response = await fetch(
    `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/storefront_access_tokens.json`,
    {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        storefront_access_token: {
          title,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create storefront token: ${error}`);
  }

  const data = await response.json();
  return data.storefront_access_token.access_token;
}

/**
 * Get shop information using the Admin API
 */
export async function getShopInfo(
  shop: string,
  accessToken: string
): Promise<{ name: string; email: string; domain: string }> {
  const response = await fetch(
    `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/shop.json`,
    {
      headers: {
        'X-Shopify-Access-Token': accessToken,
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get shop info: ${error}`);
  }

  const data = await response.json();
  return {
    name: data.shop.name,
    email: data.shop.email,
    domain: data.shop.domain,
  };
}
