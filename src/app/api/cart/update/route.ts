import { NextResponse } from 'next/server';
import {
  createShopifyClient,
  UPDATE_CART_MUTATION,
} from '@/lib/shopify/client';

export async function POST(request: Request) {
  try {
    const { cartId, lineId, quantity } = await request.json();

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
      cartLinesUpdate: {
        cart: { id: string; checkoutUrl: string };
        userErrors: Array<{ message: string }>;
      };
    }>(UPDATE_CART_MUTATION, {
      cartId,
      lines: [
        {
          id: lineId,
          quantity,
        },
      ],
    });

    if (response.cartLinesUpdate.userErrors.length > 0) {
      return NextResponse.json(
        { error: response.cartLinesUpdate.userErrors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      cartId: response.cartLinesUpdate.cart.id,
      checkoutUrl: response.cartLinesUpdate.cart.checkoutUrl,
    });
  } catch (error) {
    console.error('Cart update error:', error);
    return NextResponse.json(
      { error: 'Failed to update cart' },
      { status: 500 }
    );
  }
}
