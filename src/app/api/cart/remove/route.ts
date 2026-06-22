import { NextResponse } from 'next/server';
import {
  createShopifyClient,
  REMOVE_FROM_CART_MUTATION,
} from '@/lib/shopify/client';

export async function POST(request: Request) {
  try {
    const { cartId, lineId } = await request.json();

    if (!cartId || !lineId) {
      return NextResponse.json(
        { error: 'Missing cartId or lineId' },
        { status: 400 }
      );
    }

    const domain = process.env.SHOPIFY_STORE_DOMAIN!;
    const accessToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN!;

    const client = createShopifyClient(domain, accessToken);

    const response = await client.request<{
      cartLinesRemove: {
        cart: { id: string; checkoutUrl: string };
        userErrors: Array<{ message: string }>;
      };
    }>(REMOVE_FROM_CART_MUTATION, {
      cartId,
      lineIds: [lineId],
    });

    if (response.cartLinesRemove.userErrors.length > 0) {
      return NextResponse.json(
        { error: response.cartLinesRemove.userErrors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      cartId: response.cartLinesRemove.cart.id,
      checkoutUrl: response.cartLinesRemove.cart.checkoutUrl,
    });
  } catch (error) {
    console.error('Cart remove error:', error);
    return NextResponse.json(
      { error: 'Failed to remove from cart' },
      { status: 500 }
    );
  }
}
