'use client';

import Image from 'next/image';
import type { ShowProduct } from '@/types/database';

interface ProductQuickSelectProps {
  products: ShowProduct[];
  activeProductId?: string;
  onSelectProduct: (productId: string, activate: boolean) => void;
  isLoading?: boolean;
}

/**
 * Horizontal strip of product thumbnails for quick selection
 * Allows host to quickly toggle which product is featured on screen
 */
export function ProductQuickSelect({
  products,
  activeProductId,
  onSelectProduct,
  isLoading,
}: ProductQuickSelectProps) {
  if (products.length === 0) {
    return (
      <div className="text-white/50 text-sm text-center py-4">
        No products added yet
      </div>
    );
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {products.map((sp) => {
        const isActive = sp.id === activeProductId || sp.is_active;

        return (
          <button
            key={sp.id}
            onClick={() => onSelectProduct(sp.id, !isActive)}
            disabled={isLoading}
            className={`relative shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
              isActive
                ? 'border-pink-500 scale-105 shadow-lg shadow-pink-500/30'
                : 'border-white/10 opacity-60 hover:opacity-100 hover:border-white/30'
            } ${isLoading ? 'cursor-not-allowed' : 'cursor-pointer'}`}
          >
            {sp.product?.image_url ? (
              <Image
                src={sp.product.image_url}
                alt={sp.product.title}
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

            {/* Active indicator */}
            {isActive && (
              <div className="absolute inset-0 bg-pink-500/20 flex items-center justify-center">
                <div className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
            )}

            {/* Product title tooltip on hover */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-white text-xs truncate block">
                {sp.product?.title}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
