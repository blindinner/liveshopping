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

    // Try to extract attribution from cart attributes (most reliable method)
    const attribution = ecommerceProvider.extractAttributionFromOrder(payload);

    console.log('Webhook received:', {
      platform,
      eventType,
      orderId: normalizedOrder.orderId,
      total: normalizedOrder.totalAmount,
      attribution,
    });

    // Skip if no attribution data (cart wasn't created during a live show or video)
    if (!attribution) {
      console.log('No attribution data in order, skipping');
      return NextResponse.json({ received: true, attributed: false });
    }

    const { showId, videoId, viewerId } = attribution;

    // Try to find and update existing cart session (if one was created)
    // Build query based on whether it's a show or video
    let sessionQuery = supabase
      .from('cart_sessions')
      .select('id')
      .eq('viewer_id', viewerId)
      .eq('platform', platform);

    if (showId) {
      sessionQuery = sessionQuery.eq('show_id', showId);
    } else if (videoId) {
      sessionQuery = sessionQuery.eq('video_id', videoId);
    }

    const { data: existingSession } = await sessionQuery.single();

    if (existingSession) {
      // Update the existing cart session with conversion data
      const { error: updateError } = await supabase
        .from('cart_sessions')
        .update({
          converted: true,
          order_id: normalizedOrder.orderId,
          order_total: normalizedOrder.totalAmount,
          order_currency: normalizedOrder.currency,
          converted_at: new Date().toISOString(),
        })
        .eq('id', existingSession.id);

      if (updateError) {
        console.error('Failed to update cart session:', updateError);
      }
    }

    // Check if we've already processed this order (deduplication)
    // This prevents duplicate events from orders/create AND orders/paid webhooks
    if (showId) {
      const { data: existingEvent } = await supabase
        .from('cart_events')
        .select('id')
        .eq('show_id', showId)
        .eq('event_type', 'order_completed')
        .eq('metadata->>order_id', normalizedOrder.orderId)
        .single();

      if (existingEvent) {
        console.log('Order already processed for show, skipping:', normalizedOrder.orderId);
        return NextResponse.json({ received: true, attributed: true, duplicate: true });
      }
    } else if (videoId) {
      const { data: existingEvent } = await supabase
        .from('video_events')
        .select('id')
        .eq('video_id', videoId)
        .eq('event_type', 'order_completed')
        .eq('metadata->>order_id', normalizedOrder.orderId)
        .single();

      if (existingEvent) {
        console.log('Order already processed for video, skipping:', normalizedOrder.orderId);
        return NextResponse.json({ received: true, attributed: true, duplicate: true });
      }
    }

    // Record order_completed event in the appropriate table
    const eventData = {
      viewer_id: viewerId,
      event_type: 'order_completed',
      unit_price: normalizedOrder.totalAmount,
      quantity: 1,
      currency: normalizedOrder.currency,
      metadata: {
        order_id: normalizedOrder.orderId,
        order_number: normalizedOrder.orderNumber,
        order_total: normalizedOrder.totalAmount,
        currency: normalizedOrder.currency,
        line_items: normalizedOrder.lineItems.length,
      },
    };

    if (showId) {
      // Record in cart_events for shows
      const { error: eventError } = await supabase.from('cart_events').insert({
        show_id: showId,
        ...eventData,
      });

      if (eventError) {
        console.error('Failed to insert show order event:', eventError);
      }

      // Record individual item_purchased events for each line item
      // This enables per-product purchase tracking in analytics
      for (const item of normalizedOrder.lineItems) {
        // Look up internal product ID from Shopify product ID
        // Products are stored with GID format (gid://shopify/Product/123) but webhook has numeric ID
        const shopifyGid = `gid://shopify/Product/${item.productId}`;
        const { data: product } = await supabase
          .from('products')
          .select('id')
          .eq('shopify_product_id', shopifyGid)
          .single();

        const { error: itemError } = await supabase.from('cart_events').insert({
          show_id: showId,
          viewer_id: viewerId,
          event_type: 'item_purchased',
          product_id: product?.id || null,
          unit_price: item.price,
          quantity: item.quantity,
          currency: normalizedOrder.currency,
          metadata: {
            order_id: normalizedOrder.orderId,
            shopify_product_id: item.productId,
            variant_id: item.variantId,
            product_title: item.title,
          },
        });

        if (itemError) {
          console.error('Failed to insert item_purchased event:', itemError);
        }
      }

      // Broadcast real-time sale notification to host dashboard
      const channel = supabase.channel(`host:${showId}`);
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

      console.log('Order attributed to show:', showId);
    } else if (videoId) {
      // Record in video_events for videos
      const { error: eventError } = await supabase.from('video_events').insert({
        video_id: videoId,
        ...eventData,
      });

      if (eventError) {
        console.error('Failed to insert video order event:', eventError);
      }

      // Record individual item_purchased events for each line item
      for (const item of normalizedOrder.lineItems) {
        // Look up internal product ID from Shopify product ID
        // Products are stored with GID format (gid://shopify/Product/123) but webhook has numeric ID
        const shopifyGid = `gid://shopify/Product/${item.productId}`;
        const { data: product } = await supabase
          .from('products')
          .select('id')
          .eq('shopify_product_id', shopifyGid)
          .single();

        const { error: itemError } = await supabase.from('video_events').insert({
          video_id: videoId,
          viewer_id: viewerId,
          event_type: 'item_purchased',
          product_id: product?.id || null,
          unit_price: item.price,
          quantity: item.quantity,
          currency: normalizedOrder.currency,
          metadata: {
            order_id: normalizedOrder.orderId,
            shopify_product_id: item.productId,
            variant_id: item.variantId,
            product_title: item.title,
          },
        });

        if (itemError) {
          console.error('Failed to insert video item_purchased event:', itemError);
        }
      }

      console.log('Order attributed to video:', videoId);
    }

    return NextResponse.json({
      received: true,
      attributed: true,
      showId,
      videoId,
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
