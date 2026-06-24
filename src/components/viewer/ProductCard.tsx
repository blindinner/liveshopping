'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import type { Product } from '@/types/database';

interface ProductCardProps {
  product: Product;
  onAddToCart: () => void;
  isLoading?: boolean;
  locale: 'he' | 'en';
  onBuyNow?: (url: string) => void; // For manual products with checkout_url
}

export function ProductCard({
  product,
  onAddToCart,
  isLoading = false,
  locale,
  onBuyNow,
}: ProductCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const isRTL = locale === 'he';
  const isManualProduct = product.source === 'manual';

  const t = {
    he: {
      addToCart: 'הוסף',
      buyNow: 'קנה עכשיו',
      featured: 'מוצר מומלץ',
    },
    en: {
      addToCart: 'Add',
      buyNow: 'Buy Now',
      featured: 'Featured',
    },
  }[locale];

  const handleAction = () => {
    if (isManualProduct && product.checkout_url) {
      if (onBuyNow) {
        onBuyNow(product.checkout_url);
      } else {
        window.open(product.checkout_url, '_blank', 'noopener,noreferrer');
      }
    } else {
      onAddToCart();
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat(locale === 'he' ? 'he-IL' : 'en-US', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  return (
    <div
      className={`absolute top-1/2 -translate-y-1/2 z-30 pointer-events-auto transition-all duration-300 ${
        isRTL ? 'left-2' : 'right-2'
      } ${isExpanded ? 'w-24' : 'w-14'}`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="bg-black/60 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden">
        {/* Collapse/expand button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full py-1.5 px-2 flex items-center justify-center gap-1 bg-pink-500/20 border-b border-white/10"
        >
          <span className="text-pink-400 text-[10px] font-medium uppercase tracking-wide">
            {t.featured}
          </span>
          <svg
            className={`w-3 h-3 text-pink-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isExpanded && (
          <div className="p-2 flex flex-col items-center gap-2">
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
            <div className="text-center w-full">
              <h3 className="text-white font-medium text-xs leading-tight line-clamp-2">
                {product.title}
              </h3>
              <p className="text-pink-400 font-bold text-sm mt-1">
                {formatPrice(product.price, product.currency)}
              </p>
            </div>

            {/* Action button */}
            <Button
              onClick={handleAction}
              isLoading={isLoading}
              size="sm"
              className="w-full text-xs"
            >
              {isManualProduct ? t.buyNow : t.addToCart}
            </Button>
          </div>
        )}

        {/* Collapsed state - just show image thumbnail */}
        {!isExpanded && (
          <button
            onClick={() => setIsExpanded(true)}
            className="p-1.5"
          >
            <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-white/10">
              {product.image_url ? (
                <Image
                  src={product.image_url}
                  alt={product.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/40">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>
          </button>
        )}
      </div>
    </div>
  );
}
