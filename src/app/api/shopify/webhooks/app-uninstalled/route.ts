import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyShopifyWebhook } from '@/lib/ecommerce/providers/shopify/webhooks';

// Create a service role client for webhook processing
function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

/**
 * POST /api/shopify/webhooks/app-uninstalled
 *
 * Handles the app/uninstalled webhook from Shopify.
 * Marks the brand as uninstalled (soft delete) and clears sensitive tokens.
 */
export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const headers = Object.fromEntries(request.headers.entries());

  // Get the shop domain from headers
  const shop = headers['x-shopify-shop-domain'];

  if (!shop) {
    console.error('Missing shop domain in uninstall webhook');
    return NextResponse.json({ error: 'Missing shop domain' }, { status: 400 });
  }

  // Verify webhook signature using the app secret
  const apiSecret = process.env.SHOPIFY_API_SECRET;
  if (!apiSecret) {
    console.error('Missing SHOPIFY_API_SECRET');
    return NextResponse.json({ error: 'Configuration error' }, { status: 500 });
  }

  if (!verifyShopifyWebhook(headers, rawBody, apiSecret)) {
    console.error('Invalid webhook signature on app uninstall');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  console.log(`App uninstalled for shop: ${shop}`);

  try {
    const supabase = createServiceClient();

    // Mark brand as uninstalled and clear sensitive tokens
    const { error } = await supabase
      .from('brands')
      .update({
        shopify_admin_token: null,
        shopify_storefront_token: null,
        shopify_app_uninstalled_at: new Date().toISOString(),
      })
      .eq('shopify_domain', shop);

    if (error) {
      console.error('Failed to update brand on uninstall:', error);
      // Still return 200 to Shopify to acknowledge receipt
    } else {
      console.log(`Successfully marked ${shop} as uninstalled`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing uninstall webhook:', error);
    // Return 200 to acknowledge - Shopify will retry on errors
    return NextResponse.json({ received: true });
  }
}
