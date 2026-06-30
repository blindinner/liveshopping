import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { verifyOAuthHmac, exchangeCodeForToken } from '@/lib/shopify/oauth';
import {
  registerShopifyWebhooks,
  createStorefrontToken,
  getShopInfo,
} from '@/lib/shopify/admin';

/**
 * GET /api/shopify/callback
 *
 * Handles the OAuth callback from Shopify after user authorizes the app.
 * - Verifies HMAC signature
 * - Validates state parameter (CSRF protection)
 * - Exchanges code for access token
 * - Creates/updates brand in database
 * - Registers webhooks
 * - Redirects to success page
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const shop = searchParams.get('shop');
  const state = searchParams.get('state');
  const hmac = searchParams.get('hmac');

  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
  const apiKey = process.env.SHOPIFY_API_KEY!;
  const apiSecret = process.env.SHOPIFY_API_SECRET!;

  // Helper to redirect to error page
  const redirectToError = (message: string) => {
    const errorUrl = new URL('/login', appUrl);
    errorUrl.searchParams.set('error', message);
    return NextResponse.redirect(errorUrl.toString());
  };

  // Validate required parameters
  if (!code || !shop || !state || !hmac) {
    console.error('Missing OAuth callback parameters');
    return redirectToError('missing_parameters');
  }

  // Verify HMAC signature
  if (!verifyOAuthHmac(searchParams, apiSecret)) {
    console.error('Invalid HMAC signature on OAuth callback');
    return redirectToError('invalid_signature');
  }

  const supabase = createServiceClient();

  try {
    // Verify state (CSRF protection)
    const { data: oauthState, error: stateError } = await supabase
      .from('shopify_oauth_states')
      .select('*')
      .eq('state', state)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (stateError || !oauthState) {
      console.error('Invalid or expired OAuth state');
      return redirectToError('invalid_state');
    }

    // Delete used state (one-time use)
    await supabase
      .from('shopify_oauth_states')
      .delete()
      .eq('id', oauthState.id);

    // Exchange code for access token
    const { access_token, scope } = await exchangeCodeForToken(
      shop,
      code,
      apiKey,
      apiSecret
    );

    console.log(`OAuth successful for ${shop}, scopes: ${scope}`);

    // Get shop info for brand name
    let shopName = shop.replace('.myshopify.com', '');
    try {
      const shopInfo = await getShopInfo(shop, access_token);
      shopName = shopInfo.name || shopName;
    } catch (error) {
      console.warn('Could not fetch shop info:', error);
    }

    // Create storefront token for product/cart operations
    let storefrontToken: string | null = null;
    try {
      storefrontToken = await createStorefrontToken(shop, access_token);
      console.log(`Created storefront token for ${shop}`);
    } catch (error) {
      console.warn('Could not create storefront token:', error);
      // Continue without storefront token - can be added manually later
    }

    // Check if brand already exists
    const { data: existingBrand } = await supabase
      .from('brands')
      .select('id')
      .eq('shopify_domain', shop)
      .single();

    const brandData = {
      shopify_domain: shop,
      shopify_admin_token: access_token,
      shopify_scopes: scope,
      shopify_app_installed_at: new Date().toISOString(),
      shopify_app_uninstalled_at: null,
      platform: 'shopify',
      platform_config: {
        webhook_secret: apiSecret,
        domain: shop,
      },
      ...(storefrontToken && { shopify_storefront_token: storefrontToken }),
    };

    let brandId: string;

    if (existingBrand) {
      // Update existing brand
      await supabase
        .from('brands')
        .update(brandData)
        .eq('id', existingBrand.id);
      brandId = existingBrand.id;
      console.log(`Updated existing brand ${brandId} for ${shop}`);
    } else {
      // Create new brand
      const { data: newBrand, error: createError } = await supabase
        .from('brands')
        .insert({
          ...brandData,
          name: shopName,
        })
        .select('id')
        .single();

      if (createError || !newBrand) {
        console.error('Failed to create brand:', createError);
        return redirectToError('brand_creation_failed');
      }

      brandId = newBrand.id;
      console.log(`Created new brand ${brandId} for ${shop}`);
    }

    // Register webhooks
    try {
      await registerShopifyWebhooks(shop, access_token, appUrl);
      console.log(`Registered webhooks for ${shop}`);
    } catch (error) {
      console.error('Failed to register webhooks:', error);
      // Continue even if webhook registration fails
    }

    // Redirect to success page
    const redirectUrl = oauthState.redirect_url || '/host';
    const successUrl = new URL(redirectUrl, appUrl);
    successUrl.searchParams.set('installed', 'true');
    successUrl.searchParams.set('shop', shop);

    return NextResponse.redirect(successUrl.toString());
  } catch (error) {
    console.error('OAuth callback error:', error);
    return redirectToError('oauth_failed');
  }
}
