import React from 'react';
import { Zap } from 'lucide-react';

export interface BlinkitEtaBadgeProps {
  mins?: number | string;
  className?: string;
  size?: 'sm' | 'md';
}

export const BlinkitEtaBadge: React.FC<BlinkitEtaBadgeProps> = ({
  mins = 10,
  className = '',
  size = 'sm',
}) => {
  const isSm = size === 'sm';
  return (
    <span
      className={`inline-flex items-center gap-1 font-extrabold uppercase tracking-wider rounded-md ${
        isSm
          ? 'text-[10px] px-1.5 py-0.5 bg-[#E7F7ED] text-[#0C831F] border border-[#0C831F]/20'
          : 'text-xs px-2 py-1 bg-[#E7F7ED] text-[#0C831F] border border-[#0C831F]/30'
      } ${className}`}
      data-testid="blinkit-eta-badge"
    >
      <Zap className={isSm ? 'w-2.5 h-2.5 fill-[#0C831F]' : 'w-3.5 h-3.5 fill-[#0C831F]'} />
      <span>{typeof mins === 'number' ? `${mins} MINS` : mins}</span>
    </span>
  );
};
