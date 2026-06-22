// Shopify Webhook Verification and Parsing
// Uses HMAC-SHA256 for signature verification

import crypto from 'crypto';

/**
 * Verify that a webhook request came from Shopify
 * Uses HMAC-SHA256 with the webhook secret
 */
export function verifyShopifyWebhook(
  headers: Record<string, string>,
  body: string | Buffer,
  secret: string
): boolean {
  const hmacHeader = headers['x-shopify-hmac-sha256'];

  if (!hmacHeader) {
    console.error('Missing x-shopify-hmac-sha256 header');
    return false;
  }

  const bodyString = typeof body === 'string' ? body : body.toString('utf8');

  const hash = crypto
    .createHmac('sha256', secret)
    .update(bodyString, 'utf8')
    .digest('base64');

  try {
    // Use timing-safe comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(hmacHeader),
      Buffer.from(hash)
    );
  } catch {
    // If buffers are different lengths, timingSafeEqual throws
    return false;
  }
}

/**
 * Get the Shopify event type from webhook headers
 */
export function getShopifyWebhookTopic(headers: Record<string, string>): string | null {
  return headers['x-shopify-topic'] || null;
}

/**
 * Get the Shopify shop domain from webhook headers
 */
export function getShopifyShopDomain(headers: Record<string, string>): string | null {
  return headers['x-shopify-shop-domain'] || null;
}

/**
 * Map Shopify webhook topic to our normalized event type
 */
export function mapShopifyTopicToEventType(
  topic: string
): 'order.created' | 'order.updated' | 'order.paid' | 'order.cancelled' | null {
  switch (topic) {
    case 'orders/create':
      return 'order.created';
    case 'orders/updated':
      return 'order.updated';
    case 'orders/paid':
      return 'order.paid';
    case 'orders/cancelled':
      return 'order.cancelled';
    default:
      return null;
  }
}
