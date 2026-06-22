'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import type { Product } from '@/types/database';

interface ProductCardProps {
  product: Product;
  onAddToCart: () => void;
  isLoading?: boolean;
  locale: 'he' | 'en';
}

export function ProductCard({
  product,
  onAddToCart,
  isLoading = false,
  locale,
}: ProductCardProps) {
  const isRTL = locale === 'he';

  const t = {
    he: {
      addToCart: 'הוסף לעגלה',
    },
    en: {
      addToCart: 'Add to Cart',
    },
  }[locale];

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat(locale === 'he' ? 'he-IL' : 'en-US', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  return (
    <div
      className="absolute bottom-56 inset-x-4 animate-slide-up z-30 pointer-events-auto"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20">
        <div className="flex gap-4">
          {/* Product image */}
          <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-white/10 shrink-0">
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/40">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            )}
          </div>

          {/* Product info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold text-base truncate">
              {product.title}
            </h3>
            <p className="text-pink-400 font-bold text-lg mt-1">
              {formatPrice(product.price, product.currency)}
            </p>
          </div>

          {/* Add to cart button */}
          <div className="flex items-center">
            <Button
              onClick={onAddToCart}
              isLoading={isLoading}
              size="md"
              className="whitespace-nowrap"
            >
              {t.addToCart}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
