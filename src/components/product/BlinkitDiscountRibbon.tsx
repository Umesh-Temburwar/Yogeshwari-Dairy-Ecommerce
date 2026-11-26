import React from 'react';

export interface BlinkitDiscountRibbonProps {
  discountPercentage: number;
  className?: string;
}

export const BlinkitDiscountRibbon: React.FC<BlinkitDiscountRibbonProps> = ({
  discountPercentage,
  className = '',
}) => {
  if (!discountPercentage || discountPercentage <= 0) return null;

  return (
    <div
      className={`inline-flex items-center justify-center font-black text-white text-[9px] sm:text-[10px] tracking-wide px-1.5 py-0.5 rounded-br-md rounded-tl-md shadow-xs bg-[#256fef] leading-none ${className}`}
      data-testid="blinkit-discount-ribbon"
    >
      <span>{discountPercentage}% OFF</span>
    </div>
  );
};
