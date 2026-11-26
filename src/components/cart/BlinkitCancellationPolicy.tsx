import React from 'react';
import { AlertCircle } from 'lucide-react';

export const BlinkitCancellationPolicy: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={`bg-slate-50 border border-slate-200/60 rounded-xl p-3 flex items-start gap-2 text-slate-500 text-[11px] leading-tight ${className}`}
      data-testid="blinkit-cancellation-policy"
    >
      <AlertCircle className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
      <div>
        <span className="font-bold text-slate-700">Cancellation Policy: </span>
        To protect cold-chain dairy quality and prevent food wastage, orders cannot be cancelled once packed by our Ambajogai Mandi dark store team.
      </div>
    </div>
  );
};
