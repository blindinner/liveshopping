'use client';

interface CheckoutBarProps {
  itemCount: number;
  total: number;
  currency: string;
  onCheckout: () => void;
  onViewCart: () => void;
  isLoading?: boolean;
  locale: 'he' | 'en';
}

export function CheckoutBar({
  itemCount,
  total,
  currency,
  onCheckout,
  onViewCart,
  isLoading = false,
  locale,
}: CheckoutBarProps) {
  const isRTL = locale === 'he';

  const t = {
    he: {
      items: 'פריטים',
      item: 'פריט',
      checkout: 'לתשלום',
      viewCart: 'צפה בעגלה',
    },
    en: {
      items: 'items',
      item: 'item',
      checkout: 'Checkout',
      viewCart: 'View Cart',
    },
  }[locale];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(locale === 'he' ? 'he-IL' : 'en-US', {
      style: 'currency',
      currency: currency || 'ILS',
    }).format(price);
  };

  if (itemCount === 0) return null;

  return (
    <div
      className="absolute bottom-0 inset-x-0 z-50 pointer-events-auto animate-slide-up"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="bg-gray-900/95 backdrop-blur-lg border-t border-white/10 px-4 py-3 safe-area-bottom">
        <div className="flex items-center gap-3">
          {/* Cart summary - clickable to view cart */}
          <button
            onClick={onViewCart}
            className="flex-1 flex items-center gap-3 text-start"
          >
            {/* Cart icon with count badge */}
            <div className="relative">
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
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
              </div>
              <span className="absolute -top-1 -end-1 bg-pink-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {itemCount}
              </span>
            </div>

            {/* Item count and total */}
            <div>
              <p className="text-white/70 text-xs">
                {itemCount} {itemCount === 1 ? t.item : t.items}
              </p>
              <p className="text-white font-bold text-lg">
                {formatPrice(total)}
              </p>
            </div>
          </button>

          {/* Checkout button */}
          <button
            onClick={onCheckout}
            disabled={isLoading}
            className="bg-pink-500 hover:bg-pink-600 disabled:opacity-50 text-white font-semibold px-6 py-3 rounded-xl transition-colors flex items-center gap-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                {t.checkout}
                <svg
                  className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
