import crypto from 'crypto';

/**
 * Validate that a shop parameter is a valid Shopify domain
 */
export function isValidShopifyDomain(shop: string): boolean {
  const shopRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/;
  return shopRegex.test(shop);
}

/**
 * Generate a cryptographically secure random state for OAuth CSRF protection
 */
export function generateOAuthState(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Verify the HMAC signature on Shopify OAuth callbacks
 */
export function verifyOAuthHmac(
  searchParams: URLSearchParams,
  secret: string
): boolean {
  const hmac = searchParams.get('hmac');
  if (!hmac) {
    return false;
  }

  // Create a copy without the hmac parameter
  const paramsWithoutHmac = new URLSearchParams(searchParams);
  paramsWithoutHmac.delete('hmac');

  // Sort params alphabetically and create query string
  const sortedParams = Array.from(paramsWithoutHmac.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('&');

  const hash = crypto
    .createHmac('sha256', secret)
    .update(sortedParams)
    .digest('hex');

  try {
    return crypto.timingSafeEqual(
      Buffer.from(hmac),
      Buffer.from(hash)
    );
  } catch {
    return false;
  }
}

/**
 * Build the Shopify OAuth authorization URL
 */
export function buildOAuthUrl(
  shop: string,
  apiKey: string,
  scopes: string,
  redirectUri: string,
  state: string
): string {
  const params = new URLSearchParams({
    client_id: apiKey,
    scope: scopes,
    redirect_uri: redirectUri,
    state: state,
  });

  return `https://${shop}/admin/oauth/authorize?${params.toString()}`;
}

/**
 * Exchange an OAuth authorization code for an access token
 */
export async function exchangeCodeForToken(
  shop: string,
  code: string,
  apiKey: string,
  apiSecret: string
): Promise<{ access_token: string; scope: string }> {
  const response = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: apiKey,
      client_secret: apiSecret,
      code,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to exchange code for token: ${error}`);
  }

  return response.json();
}
