import React from 'react';
import { RefreshCcw, ShieldCheck, HelpCircle } from 'lucide-react';

export const BlinkitReturnAndRefundInfo: React.FC<{ className?: string }> = ({
  className = '',
}) => {
  return (
    <div
      className={`bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-4 shadow-2xs space-y-2.5 ${className}`}
      data-testid="blinkit-refund-card"
    >
      <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-xs">
        <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
        <span>100% Freshness Guarantee & Hassle-Free Returns</span>
      </div>

      <div className="text-xs text-slate-600 leading-relaxed space-y-1">
        <p>
          • <strong>Instant Replacement:</strong> If milk is spoiled or leaked upon delivery, get an instant replacement or refund via UPI.
        </p>
        <p>
          • <strong>Cold-Chain Assured:</strong> All yogurts, milk, paneer, and sweets are packed from Ambajogai Mandi chilling units at 4°C.
        </p>
      </div>

      <div className="pt-2 border-t border-emerald-100 flex items-center justify-between text-[11px] text-emerald-800 font-bold">
        <span className="flex items-center gap-1">
          <RefreshCcw className="w-3 h-3 text-emerald-600" /> Doorstep Inspection Allowed
        </span>
        <span className="flex items-center gap-1">
          <HelpCircle className="w-3 h-3 text-emerald-600" /> Support: +91 93708 69896
        </span>
      </div>
    </div>
  );
};
