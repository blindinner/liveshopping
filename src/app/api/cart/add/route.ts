import { NextResponse } from 'next/server';
import {
  createShopifyClient,
  CREATE_CART_MUTATION,
  ADD_TO_CART_MUTATION,
} from '@/lib/shopify/client';

export async function POST(request: Request) {
  try {
    const { cartId, variantId, quantity, showId, videoId, viewerId } = await request.json();

    // For MVP, use env vars. Later, fetch from brands table
    const domain = process.env.SHOPIFY_STORE_DOMAIN!;
    const accessToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN!;

    const client = createShopifyClient(domain, accessToken);

    if (!cartId) {
      // Build cart attributes for attribution tracking
      const attributes: Array<{ key: string; value: string }> = [];
      if (showId) {
        attributes.push({ key: '_live_shopping_show_id', value: showId });
      }
      if (videoId) {
        attributes.push({ key: '_live_shopping_video_id', value: videoId });
      }
      if (viewerId) {
        attributes.push({ key: '_live_shopping_viewer_id', value: viewerId });
      }

      // Create new cart with item and tracking attributes
      const response = await client.request<{
        cartCreate: {
          cart: { id: string; checkoutUrl: string; lines: { edges: Array<{ node: { id: string } }> } };
          userErrors: Array<{ message: string }>;
        };
      }>(CREATE_CART_MUTATION, {
        input: {
          lines: [
            {
              merchandiseId: variantId,
              quantity,
            },
          ],
          attributes,
        },
      });

      if (response.cartCreate.userErrors.length > 0) {
        return NextResponse.json(
          { error: response.cartCreate.userErrors[0].message },
          { status: 400 }
        );
      }

      return NextResponse.json({
        cartId: response.cartCreate.cart.id,
        checkoutUrl: response.cartCreate.cart.checkoutUrl,
        lineId: response.cartCreate.cart.lines.edges[0]?.node.id,
      });
    }

    // Add to existing cart
    const response = await client.request<{
      cartLinesAdd: {
        cart: { id: string; checkoutUrl: string; lines: { edges: Array<{ node: { id: string; merchandise: { id: string } } }> } };
        userErrors: Array<{ message: string }>;
      };
    }>(ADD_TO_CART_MUTATION, {
      cartId,
      lines: [
        {
          merchandiseId: variantId,
          quantity,
        },
      ],
    });

    if (response.cartLinesAdd.userErrors.length > 0) {
      return NextResponse.json(
        { error: response.cartLinesAdd.userErrors[0].message },
        { status: 400 }
      );
    }

    // Find the line ID for this variant
    const lineId = response.cartLinesAdd.cart.lines.edges.find(
      (edge) => edge.node.merchandise.id === variantId
    )?.node.id;

    return NextResponse.json({
      cartId: response.cartLinesAdd.cart.id,
      checkoutUrl: response.cartLinesAdd.cart.checkoutUrl,
      lineId,
    });
  } catch (error) {
    console.error('Cart add error:', error);
    return NextResponse.json(
      { error: 'Failed to add to cart' },
      { status: 500 }
    );
  }
}
