import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getProvider, type PlatformType } from '@/lib/ecommerce';
import {
  getShopifyWebhookTopic,
  mapShopifyTopicToEventType,
} from '@/lib/ecommerce/providers/shopify/webhooks';

// Create a service role client for webhook processing
function createServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// POST /api/webhooks/[provider]/orders
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;
  const platform = provider as PlatformType;

  // Validate platform
  if (!['shopify', 'woocommerce', 'bigcommerce', 'magento'].includes(platform)) {
    return NextResponse.json(
      { error: `Unsupported platform: ${platform}` },
      { status: 400 }
    );
  }

  try {
    // Get raw body for signature verification
    const rawBody = await request.text();
    const headers = Object.fromEntries(request.headers.entries());

    const supabase = createServiceClient();

    // Find brands using this platform
    const { data: brands, error: brandsError } = await supabase
      .from('brands')
      .select('id, platform, platform_config, shopify_domain')
      .eq('platform', platform);

    if (brandsError || !brands?.length) {
      console.error('No brands found for platform:', platform);
      return NextResponse.json(
        { error: 'No brands configured for this platform' },
        { status: 404 }
      );
    }

    // Try to verify webhook against each brand's secret
    let matchedBrand: typeof brands[0] | null = null;
    let ecommerceProvider: ReturnType<typeof getProvider> | null = null;

    for (const brand of brands) {
      try {
        // Get webhook secret from platform_config
        const webhookSecret = (brand.platform_config as Record<string, string>)?.webhook_secret;

        if (!webhookSecret) {
          console.log(`Brand ${brand.id} has no webhook secret configured`);
          continue;
        }

        // Build provider config - support legacy Shopify fields
        const config = {
          platform: brand.platform as PlatformType,
          credentials: {
            ...(brand.platform_config as Record<string, string>),
            // Support legacy Shopify domain field
            domain: brand.shopify_domain || (brand.platform_config as Record<string, string>)?.domain,
          },
        };

        const tempProvider = getProvider(config);

        if (tempProvider.verifyWebhook(headers, rawBody, webhookSecret)) {
          matchedBrand = brand;
          ecommerceProvider = tempProvider;
          break;
        }
      } catch (error) {
        console.error(`Error verifying webhook for brand ${brand.id}:`, error);
        continue;
      }
    }

    if (!matchedBrand || !ecommerceProvider) {
      console.error('Webhook signature verification failed for all brands');
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 401 }
      );
    }

    // Parse webhook payload
    const payload = JSON.parse(rawBody);

    // Get event type from headers (platform-specific)
    let eventType: string;
    if (platform === 'shopify') {
      const topic = getShopifyWebhookTopic(headers);
      eventType = mapShopifyTopicToEventType(topic || '') || 'order.created';
    } else {
      eventType = 'order.created'; // Default for other platforms
    }

    // Parse order using provider
    const normalizedOrder = ecommerceProvider.parseOrderWebhook(eventType, payload);
    const cartId = ecommerceProvider.extractCartIdFromOrder(payload);

    console.log('Webhook received:', {
      platform,
      eventType,
      orderId: normalizedOrder.orderId,
      cartId,
      total: normalizedOrder.totalAmount,
    });

    // Skip if no cart ID (can't attribute)
    if (!cartId) {
      console.log('No cart ID in order, skipping attribution');
      return NextResponse.json({ received: true, attributed: false });
    }

    // Find cart session for attribution
    const { data: cartSession, error: cartError } = await supabase
      .from('cart_sessions')
      .select('id, show_id, viewer_id')
      .eq('platform_cart_id', cartId)
      .eq('platform', platform)
      .single();

    if (cartError || !cartSession) {
      console.log('No cart session found for cart:', cartId);
      return NextResponse.json({ received: true, attributed: false });
    }

    // Update cart session with conversion
    const { error: updateError } = await supabase
      .from('cart_sessions')
      .update({
        converted: true,
        order_id: normalizedOrder.orderId,
        order_total: normalizedOrder.totalAmount,
        order_currency: normalizedOrder.currency,
        converted_at: new Date().toISOString(),
      })
      .eq('id', cartSession.id);

    if (updateError) {
      console.error('Failed to update cart session:', updateError);
    }

    // Record order_completed event
    const { error: eventError } = await supabase.from('show_events').insert({
      show_id: cartSession.show_id,
      viewer_id: cartSession.viewer_id,
      event_type: 'order_completed',
      metadata: {
        order_id: normalizedOrder.orderId,
        order_number: normalizedOrder.orderNumber,
        order_total: normalizedOrder.totalAmount,
        currency: normalizedOrder.currency,
        line_items: normalizedOrder.lineItems.length,
      },
    });

    if (eventError) {
      console.error('Failed to insert order event:', eventError);
    }

    // Broadcast real-time sale notification to host dashboard
    const channel = supabase.channel(`host:${cartSession.show_id}`);
    await channel.send({
      type: 'broadcast',
      event: 'sale',
      payload: {
        order_id: normalizedOrder.orderId,
        order_number: normalizedOrder.orderNumber,
        amount: normalizedOrder.totalAmount,
        currency: normalizedOrder.currency,
      },
    });
    await supabase.removeChannel(channel);

    console.log('Order attributed to show:', cartSession.show_id);

    return NextResponse.json({
      received: true,
      attributed: true,
      showId: cartSession.show_id,
    });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// HEAD request for webhook verification (some platforms send this)
export async function HEAD() {
  return new NextResponse(null, { status: 200 });
}
