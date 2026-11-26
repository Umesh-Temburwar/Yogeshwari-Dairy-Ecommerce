import React from 'react';
import { Product } from '@/types/ecommerce';
import { formatBlinkitPrice } from '@/utils/blinkitFormatters';
import { BlinkitEtaBadge } from '@/components/product/BlinkitEtaBadge';
import { triggerHaptic } from '@/utils/haptics';

export interface BlinkitSearchProductPreviewProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  className?: string;
}

export const BlinkitSearchProductPreview: React.FC<BlinkitSearchProductPreviewProps> = ({
  products,
  onSelectProduct,
  className = '',
}) => {
  if (!products || products.length === 0) return null;

  return (
    <div
      className={`bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden divide-y divide-slate-100 ${className}`}
      data-testid="blinkit-search-preview"
    >
      <div className="px-3 py-1.5 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
        Quick Suggestions ({products.length})
      </div>
      {products.slice(0, 5).map((prod) => (
        <div
          key={prod.id}
          onClick={() => {
            triggerHaptic('light');
            onSelectProduct(prod);
          }}
          className="flex items-center gap-3 p-2.5 hover:bg-emerald-50/60 cursor-pointer transition-colors"
        >
          <img
            src={prod.imageUrl}
            alt={prod.name}
            className="w-10 h-10 object-contain rounded-lg bg-slate-50 shrink-0 border border-slate-100"
          />
          <div className="flex-1 min-w-0">
            <h5 className="text-xs font-bold text-slate-800 truncate leading-tight">
              {prod.name}
            </h5>
            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
              <span className="font-extrabold text-slate-900">{formatBlinkitPrice(prod.price)}</span>
              <span>•</span>
              <span className="truncate">{prod.packSize}</span>
            </div>
          </div>
          <BlinkitEtaBadge mins={10} size="sm" />
        </div>
      ))}
    </div>
  );
};
