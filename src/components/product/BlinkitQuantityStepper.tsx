import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { triggerHaptic } from '@/utils/haptics';

export interface BlinkitQuantityStepperProps {
  quantity: number;
  maxQuantity?: number;
  disabled?: boolean;
  onAdd: (e: React.MouseEvent) => void;
  onIncrement: (e: React.MouseEvent) => void;
  onDecrement: (e: React.MouseEvent) => void;
  className?: string;
  size?: 'sm' | 'md';
}

export const BlinkitQuantityStepper: React.FC<BlinkitQuantityStepperProps> = ({
  quantity,
  maxQuantity,
  disabled = false,
  onAdd,
  onIncrement,
  onDecrement,
  className = '',
  size = 'sm',
}) => {
  const isMaxStock = Boolean(maxQuantity) && quantity >= (maxQuantity || 0);

  if (quantity === 0) {
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={(e) => {
          e.stopPropagation();
          triggerHaptic('medium');
          onAdd(e);
        }}
        className={`w-full font-bold uppercase rounded-lg border border-[#0C831F] text-[#0C831F] bg-white hover:bg-[#E7F7ED] active:scale-95 transition-all shadow-xs cursor-pointer flex items-center justify-center ${
          size === 'sm' ? 'h-8 text-xs tracking-wider' : 'h-10 text-sm tracking-wide'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
        aria-label="Add product to cart"
        data-testid="blinkit-add-button"
      >
        <span>ADD</span>
      </button>
    );
  }

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={`w-full flex items-center justify-between rounded-lg bg-[#0C831F] text-white shadow-xs font-bold transition-all ${
        size === 'sm' ? 'h-8 px-1.5 text-xs' : 'h-10 px-2.5 text-sm'
      } ${className}`}
      data-testid="blinkit-stepper"
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          triggerHaptic('light');
          onDecrement(e);
        }}
        className="w-6 h-6 flex items-center justify-center hover:bg-black/10 rounded-md active:scale-90 transition-all cursor-pointer focus:outline-hidden"
        aria-label="Decrease quantity"
      >
        <Minus className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
      </button>

      <span className="font-extrabold select-none px-1" data-testid="stepper-quantity">
        {quantity}
      </span>

      <button
        type="button"
        disabled={isMaxStock}
        onClick={(e) => {
          e.stopPropagation();
          if (!isMaxStock) {
            triggerHaptic('light');
            onIncrement(e);
          }
        }}
        className={`w-6 h-6 flex items-center justify-center hover:bg-black/10 rounded-md active:scale-90 transition-all focus:outline-hidden ${
          isMaxStock ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
        }`}
        aria-label="Increase quantity"
      >
        <Plus className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
      </button>
    </div>
  );
};
