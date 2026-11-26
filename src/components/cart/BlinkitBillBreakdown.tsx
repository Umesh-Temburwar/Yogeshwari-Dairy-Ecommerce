import React from 'react';
import { formatBlinkitPrice } from '@/utils/blinkitFormatters';
import { Sparkles } from 'lucide-react';

export interface BlinkitBillBreakdownProps {
  itemTotal: number;
  handlingCharge?: number;
  deliveryFee: number;
  tipAmount?: number;
  totalSavings?: number;
  grandTotal: number;
  className?: string;
}

export const BlinkitBillBreakdown: React.FC<BlinkitBillBreakdownProps> = ({
  itemTotal,
  handlingCharge = 2,
  deliveryFee,
  tipAmount = 0,
  totalSavings = 0,
  grandTotal,
  className = '',
}) => {
  return (
    <div
      className={`bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-2xs space-y-2.5 ${className}`}
      data-testid="blinkit-bill-breakdown"
    >
      <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
        Bill Details
      </h4>

      <div className="space-y-1.5 text-xs text-slate-600">
        <div className="flex items-center justify-between">
          <span>Items Total</span>
          <span className="font-semibold text-slate-800">{formatBlinkitPrice(itemTotal)}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1">
            Handling Charge
            <span className="text-[10px] text-slate-400">(Packaging & hygiene)</span>
          </span>
          <span className="font-semibold text-slate-800">{formatBlinkitPrice(handlingCharge)}</span>
        </div>

        <div className="flex items-center justify-between">
          <span>Delivery Fee</span>
          {deliveryFee === 0 ? (
            <span className="font-extrabold text-[#0C831F] uppercase">FREE</span>
          ) : (
            <span className="font-semibold text-slate-800">{formatBlinkitPrice(deliveryFee)}</span>
          )}
        </div>

        {tipAmount > 0 && (
          <div className="flex items-center justify-between text-rose-600 font-semibold">
            <span>Delivery Partner Tip</span>
            <span>{formatBlinkitPrice(tipAmount)}</span>
          </div>
        )}
      </div>

      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
        <span className="font-black text-sm text-slate-900">To Pay</span>
        <span className="font-black text-base text-slate-900">
          {formatBlinkitPrice(grandTotal)}
        </span>
      </div>

      {totalSavings > 0 && (
        <div className="bg-[#E7F7ED] border border-[#0C831F]/20 text-[#0C831F] rounded-lg p-2 flex items-center gap-1.5 text-xs font-bold justify-center">
          <Sparkles className="w-3.5 h-3.5 fill-[#0C831F]" />
          <span>You saved {formatBlinkitPrice(totalSavings)} on this order!</span>
        </div>
      )}
    </div>
  );
};
