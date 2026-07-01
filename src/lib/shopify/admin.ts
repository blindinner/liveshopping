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
 * Delete existing webhooks that match our app URL
 * This ensures we replace old webhooks with new ones during OAuth
 */
async function deleteExistingWebhooks(
  shop: string,
  accessToken: string,
  appUrl: string
): Promise<void> {
  try {
    // List all webhooks
    const response = await fetch(
      `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/webhooks.json`,
      {
        headers: {
          'X-Shopify-Access-Token': accessToken,
        },
      }
    );

    if (!response.ok) {
      console.error('Failed to list webhooks:', await response.text());
      return;
    }

    const data = await response.json();
    const webhooks = data.webhooks || [];

    // Delete only webhooks that point to our app URL
    for (const webhook of webhooks) {
      if (webhook.address && webhook.address.includes(appUrl)) {
        try {
          await fetch(
            `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/webhooks/${webhook.id}.json`,
            {
              method: 'DELETE',
              headers: {
                'X-Shopify-Access-Token': accessToken,
              },
            }
          );
          console.log(`Deleted existing webhook: ${webhook.topic} (${webhook.id})`);
        } catch (err) {
          console.error(`Failed to delete webhook ${webhook.id}:`, err);
        }
      }
    }
  } catch (error) {
    console.error('Error cleaning up existing webhooks:', error);
  }
}

/**
 * Register webhooks for a Shopify store using the Admin API
 * Deletes existing webhooks first to ensure clean state
 */
export async function registerShopifyWebhooks(
  shop: string,
  accessToken: string,
  appUrl: string
): Promise<void> {
  // First, delete any existing webhooks from our app
  await deleteExistingWebhooks(shop, accessToken, appUrl);

  // Only use orders/paid to avoid duplicate events
  // orders/paid fires after payment is confirmed, which is what we want for revenue tracking
  const webhooks: WebhookConfig[] = [
    {
      topic: 'orders/paid',
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
