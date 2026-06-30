import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import {
  isValidShopifyDomain,
  generateOAuthState,
  buildOAuthUrl,
} from '@/lib/shopify/oauth';

/**
 * GET /api/shopify/auth?shop=store.myshopify.com
 *
 * Initiates the Shopify OAuth flow.
 * Store owners are redirected here to install the app.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const shop = searchParams.get('shop');
  const redirectUrl = searchParams.get('redirect') || '/host';

  // Validate required environment variables
  const apiKey = process.env.SHOPIFY_API_KEY;
  const scopes = process.env.SHOPIFY_APP_SCOPES;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!apiKey || !scopes || !appUrl) {
    console.error('Missing Shopify app configuration');
    return NextResponse.json(
      { error: 'Shopify app not configured' },
      { status: 500 }
    );
  }

  // Validate shop parameter
  if (!shop) {
    return NextResponse.json(
      { error: 'Missing shop parameter. Use ?shop=your-store.myshopify.com' },
      { status: 400 }
    );
  }

  if (!isValidShopifyDomain(shop)) {
    return NextResponse.json(
      { error: 'Invalid shop parameter. Must be a valid myshopify.com domain.' },
      { status: 400 }
    );
  }

  try {
    // Get current user (optional - for associating install with a host account)
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Generate random state for CSRF protection
    const state = generateOAuthState();

    // Store state in database with 10-minute expiry
    const supabaseService = createServiceClient();
    const { error: stateError } = await supabaseService
      .from('shopify_oauth_states')
      .insert({
        state,
        shop,
        user_id: user?.id || null,
        redirect_url: redirectUrl,
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      });

    if (stateError) {
      console.error('Failed to store OAuth state:', stateError);
      return NextResponse.json(
        { error: 'Failed to initiate OAuth flow' },
        { status: 500 }
      );
    }

    // Build OAuth URL and redirect
    const callbackUrl = `${appUrl}/api/shopify/callback`;
    const authUrl = buildOAuthUrl(shop, apiKey, scopes, callbackUrl, state);

    console.log(`OAuth redirect for ${shop} with scopes: ${scopes}`);
    console.log(`Auth URL: ${authUrl}`);

    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('OAuth initiation error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate OAuth flow' },
      { status: 500 }
    );
  }
}
