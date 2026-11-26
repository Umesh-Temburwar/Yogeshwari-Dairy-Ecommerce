import React from 'react';
import { Clock } from 'lucide-react';

export interface BlinkitShelfLifeBadgeProps {
  shelfLife?: string;
  isMorningBatch?: boolean;
  className?: string;
}

export const BlinkitShelfLifeBadge: React.FC<BlinkitShelfLifeBadgeProps> = ({
  shelfLife = '2 Days',
  isMorningBatch = false,
  className = '',
}) => {
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-1.5 py-0.5 rounded-md ${className}`}
      title={isMorningBatch ? 'Fresh Morning Batch' : `Best consumed within ${shelfLife}`}
      data-testid="blinkit-shelflife-badge"
    >
      <Clock className="w-2.5 h-2.5 text-emerald-700" />
      <span>{isMorningBatch ? 'Morning Batch' : shelfLife}</span>
    </span>
  );
};
