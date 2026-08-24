'use client';

import { Button } from '@/components/ui/Button';
import type { AuctionWinner } from '@/types/database';

interface AuctionWinnerModalProps {
  winner: AuctionWinner;
  isOpen: boolean;
  onClose: () => void;
  locale: 'he' | 'en';
}

export function AuctionWinnerModal({
  winner,
  isOpen,
  onClose,
  locale,
}: AuctionWinnerModalProps) {
  const isRTL = locale === 'he';

  const t = {
    he: {
      congratulations: 'מזל טוב!',
      youWon: 'זכית במכירה הפומבית!',
      item: 'פריט',
      winningBid: 'הצעה זוכה',
      nextSteps: 'השלבים הבאים',
      nextStepsText: 'ניצור איתך קשר בקרוב עם פרטי התשלום והמשלוח.',
      gotIt: 'הבנתי',
    },
    en: {
      congratulations: 'Congratulations!',
      youWon: 'You won the auction!',
      item: 'Item',
      winningBid: 'Winning Bid',
      nextSteps: 'Next Steps',
      nextStepsText: "We'll contact you shortly with payment and shipping details.",
      gotIt: 'Got it',
    },
  }[locale];

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat(locale === 'he' ? 'he-IL' : 'en-US', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  if (!isOpen) return null;

  const product = winner.show_product?.product;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative bg-gradient-to-b from-gray-900 to-black rounded-2xl border border-green-500/30 w-full max-w-sm overflow-hidden"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* Header with celebration */}
        <div className="bg-green-500/20 border-b border-green-500/30 px-4 py-6 text-center">
          <div className="text-4xl mb-2">🎉</div>
          <h2 className="text-green-400 font-bold text-xl">{t.congratulations}</h2>
          <p className="text-white text-sm mt-1">{t.youWon}</p>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Item info */}
          {product && (
            <div className="bg-black/20 rounded-xl p-3">
              <p className="text-white/50 text-xs mb-1">{t.item}</p>
              <p className="text-white font-medium">{product.title}</p>
            </div>
          )}

          {/* Winning amount */}
          <div className="bg-black/20 rounded-xl p-3">
            <p className="text-white/50 text-xs mb-1">{t.winningBid}</p>
            <p className="text-green-400 font-bold text-2xl">
              {formatPrice(winner.winning_amount, product?.currency || 'USD')}
            </p>
          </div>

          {/* Next steps */}
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3">
            <p className="text-orange-400 font-medium text-sm mb-1">{t.nextSteps}</p>
            <p className="text-white/70 text-sm">{t.nextStepsText}</p>
          </div>

          <Button
            onClick={onClose}
            className="w-full bg-green-500 hover:bg-green-600"
          >
            {t.gotIt}
          </Button>
        </div>
      </div>
    </div>
  );
}
