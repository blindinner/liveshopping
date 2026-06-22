'use client';

import type { ShowProduct } from '@/types/database';

interface HostNotesProps {
  showProducts: ShowProduct[];
  activeProductId?: string;
}

export function HostNotes({ showProducts, activeProductId }: HostNotesProps) {
  const activeProduct = showProducts.find(
    (sp) => sp.id === activeProductId || sp.is_active
  );
  const activeIndex = showProducts.findIndex(
    (sp) => sp.id === activeProductId || sp.is_active
  );
  const nextProduct = activeIndex >= 0 ? showProducts[activeIndex + 1] : showProducts[0];

  if (showProducts.length === 0) {
    return (
      <section className="bg-white/5 rounded-2xl p-4">
        <h2 className="text-base font-semibold text-white mb-3">Host Notes</h2>
        <p className="text-white/50 text-sm">Add products to see notes here</p>
      </section>
    );
  }

  return (
    <section className="bg-white/5 rounded-2xl p-4">
      <h2 className="text-base font-semibold text-white mb-4">Host Notes</h2>

      <div className="space-y-4">
        {/* Current Product Notes */}
        {activeProduct ? (
          <div className="bg-pink-500/20 border border-pink-500/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 bg-pink-500 text-white text-xs font-bold rounded">
                NOW
              </span>
              <span className="text-white font-medium text-sm truncate">
                {activeProduct.product?.title}
              </span>
            </div>
            {activeProduct.host_notes ? (
              <p className="text-white text-lg leading-relaxed whitespace-pre-wrap">
                {activeProduct.host_notes}
              </p>
            ) : (
              <p className="text-white/40 text-sm italic">
                No notes for this product
              </p>
            )}
          </div>
        ) : (
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-white/50 text-sm">
              Select a product to see its notes
            </p>
          </div>
        )}

        {/* Next Product Preview */}
        {nextProduct && (
          <div className="bg-white/5 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 bg-white/20 text-white/70 text-xs font-medium rounded">
                NEXT
              </span>
              <span className="text-white/70 text-sm truncate">
                {nextProduct.product?.title}
              </span>
            </div>
            {nextProduct.host_notes ? (
              <p className="text-white/60 text-sm line-clamp-2">
                {nextProduct.host_notes}
              </p>
            ) : (
              <p className="text-white/30 text-xs italic">No notes</p>
            )}
          </div>
        )}

        {/* Quick reference: All products with notes */}
        <details className="group">
          <summary className="cursor-pointer text-white/50 text-xs hover:text-white/70 transition-colors">
            View all product notes ({showProducts.filter(sp => sp.host_notes).length}/{showProducts.length})
          </summary>
          <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
            {showProducts.map((sp, index) => (
              <div
                key={sp.id}
                className={`p-2 rounded-lg text-sm ${
                  sp.id === activeProductId || sp.is_active
                    ? 'bg-pink-500/10 border border-pink-500/20'
                    : 'bg-black/20'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white/40 text-xs font-mono">
                    #{index + 1}
                  </span>
                  <span className="text-white/80 text-xs truncate flex-1">
                    {sp.product?.title}
                  </span>
                </div>
                {sp.host_notes ? (
                  <p className="text-white/60 text-xs line-clamp-2">
                    {sp.host_notes}
                  </p>
                ) : (
                  <p className="text-white/30 text-xs italic">No notes</p>
                )}
              </div>
            ))}
          </div>
        </details>
      </div>
    </section>
  );
}
