'use client';

import Image from 'next/image';
import type { ShowProduct } from '@/types/database';

interface ProductTrayProps {
  products: ShowProduct[];
  onSelectProduct: (product: ShowProduct) => void;
  locale: 'he' | 'en';
}

export function ProductTray({
  products,
  onSelectProduct,
  locale,
}: ProductTrayProps) {
  const isRTL = locale === 'he';

  const t = {
    he: {
      shopAll: 'כל המוצרים',
    },
    en: {
      shopAll: 'Shop All',
    },
  }[locale];

  if (products.length === 0) return null;

  return (
    <div
      className="absolute bottom-20 inset-x-4 z-30 pointer-events-auto"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="bg-black/40 backdrop-blur-md rounded-2xl p-3">
        <div className="flex items-center gap-2 mb-2">
          <svg
            className="w-4 h-4 text-white/70"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
          <span className="text-white/70 text-xs font-medium">
            {t.shopAll}
          </span>
        </div>

        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {products.map((showProduct) => (
            <button
              key={showProduct.id}
              onClick={() => onSelectProduct(showProduct)}
              className={`
                relative w-14 h-14 rounded-xl overflow-hidden shrink-0
                border-2 transition-all
                ${
                  showProduct.is_active
                    ? 'border-pink-500 ring-2 ring-pink-500/50'
                    : 'border-transparent hover:border-white/30'
                }
              `}
            >
              {showProduct.product?.image_url ? (
                <Image
                  src={showProduct.product.image_url}
                  alt={showProduct.product.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-white/10 flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-white/40"
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

              {/* Active indicator dot */}
              {showProduct.is_active && (
                <div className="absolute top-1 end-1 w-2 h-2 bg-pink-500 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
