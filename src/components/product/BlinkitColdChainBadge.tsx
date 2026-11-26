import React from 'react';
import { Snowflake } from 'lucide-react';

export interface BlinkitColdChainBadgeProps {
  temperature?: string;
  className?: string;
  showText?: boolean;
}

export const BlinkitColdChainBadge: React.FC<BlinkitColdChainBadgeProps> = ({
  temperature = '4°C',
  className = '',
  showText = true,
}) => {
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-bold text-sky-800 bg-sky-50 border border-sky-200 px-1.5 py-0.5 rounded-md ${className}`}
      title={`Stored & Delivered cold at ${temperature}`}
      data-testid="blinkit-cold-chain-badge"
    >
      <Snowflake className="w-2.5 h-2.5 text-sky-600 animate-spin-slow" />
      {showText && <span>{temperature} Chilled</span>}
    </span>
  );
};
