'use client';

import Image from 'next/image';
import { Drawer } from '@/components/ui/Drawer';
import { Button } from '@/components/ui/Button';
import type { CartItem } from '@/types/database';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  total: number;
  currency: string;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
  onCheckout: () => void;
  isLoading: boolean;
  locale: 'he' | 'en';
}

export function CartDrawer({
  isOpen,
  onClose,
  items,
  total,
  currency,
  onUpdateQuantity,
  onRemove,
  onCheckout,
  isLoading,
  locale,
}: CartDrawerProps) {
  const isRTL = locale === 'he';

  const t = {
    he: {
      title: 'עגלת קניות',
      empty: 'העגלה ריקה',
      total: 'סה״כ',
      checkout: 'לתשלום',
      remove: 'הסר',
    },
    en: {
      title: 'Shopping Cart',
      empty: 'Your cart is empty',
      total: 'Total',
      checkout: 'Checkout',
      remove: 'Remove',
    },
  }[locale];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(locale === 'he' ? 'he-IL' : 'en-US', {
      style: 'currency',
      currency: currency || 'ILS',
    }).format(price);
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title={t.title} side="bottom">
      <div className="flex flex-col h-full" dir={isRTL ? 'rtl' : 'ltr'}>
        {items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center text-white/60">
              <svg
                className="w-16 h-16 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              <p>{t.empty}</p>
            </div>
          </div>
        ) : (
          <>
            {/* Cart items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {items.map((item) => (
                <div
                  key={item.product.id}
                  className="flex gap-4 bg-white/5 rounded-xl p-3"
                >
                  {/* Product image */}
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-white/10 shrink-0">
                    {item.product.image_url ? (
                      <Image
                        src={item.product.image_url}
                        alt={item.product.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/40">
                        <svg
                          className="w-6 h-6"
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
                    <h4 className="text-white font-medium text-sm truncate">
                      {item.product.title}
                    </h4>
                    <p className="text-pink-400 font-semibold text-sm mt-0.5">
                      {formatPrice(item.product.price)}
                    </p>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() =>
                          onUpdateQuantity(item.product.id, item.quantity - 1)
                        }
                        className="w-7 h-7 flex items-center justify-center bg-white/10 rounded-lg text-white hover:bg-white/20"
                      >
                        -
                      </button>
                      <span className="text-white text-sm w-8 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          onUpdateQuantity(item.product.id, item.quantity + 1)
                        }
                        className="w-7 h-7 flex items-center justify-center bg-white/10 rounded-lg text-white hover:bg-white/20"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Remove button */}
                  <button
                    onClick={() => onRemove(item.product.id)}
                    className="p-2 text-white/50 hover:text-red-400"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            {/* Footer with total and checkout */}
            <div className="p-4 border-t border-white/10 bg-gray-900/50">
              <div className="flex items-center justify-between mb-4">
                <span className="text-white/70">{t.total}</span>
                <span className="text-white font-bold text-xl">
                  {formatPrice(total)}
                </span>
              </div>
              <Button
                onClick={onCheckout}
                isLoading={isLoading}
                className="w-full"
                size="lg"
              >
                {t.checkout}
              </Button>
            </div>
          </>
        )}
      </div>
    </Drawer>
  );
}
