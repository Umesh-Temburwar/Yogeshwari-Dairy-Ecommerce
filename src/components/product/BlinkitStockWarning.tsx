import React from 'react';
import { AlertCircle } from 'lucide-react';

export interface BlinkitStockWarningProps {
  stockQuantity: number;
  className?: string;
}

export const BlinkitStockWarning: React.FC<BlinkitStockWarningProps> = ({
  stockQuantity,
  className = '',
}) => {
  if (stockQuantity <= 0 || stockQuantity > 5) return null;

  return (
    <span
      className={`inline-flex items-center gap-1 text-[9px] font-bold text-rose-600 bg-rose-50 border border-rose-200/80 px-1.5 py-0.5 rounded-md animate-pulse leading-none ${className}`}
      data-testid="blinkit-stock-warning"
    >
      <AlertCircle className="w-2.5 h-2.5" />
      <span>Only {stockQuantity} left</span>
    </span>
  );
};
