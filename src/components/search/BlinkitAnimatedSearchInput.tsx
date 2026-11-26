import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { triggerHaptic } from '@/utils/haptics';

export interface BlinkitAnimatedSearchInputProps {
  value: string;
  onChange: (val: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  className?: string;
}

const DAIRY_SEARCH_HINTS = [
  'Search "fresh cow milk"',
  'Search "malai paneer"',
  'Search "kesar shrikhand"',
  'Search "pure bilona ghee"',
  'Search "thick set curd"',
  'Search "masala chaas"',
  'Search "basundi & sweets"',
];

export const BlinkitAnimatedSearchInput: React.FC<BlinkitAnimatedSearchInputProps> = ({
  value,
  onChange,
  onFocus,
  onBlur,
  className = '',
}) => {
  const [hintIndex, setHintIndex] = useState(0);

  useEffect(() => {
    if (value) return; // don't cycle if user is typing
    const interval = setInterval(() => {
      setHintIndex((prev) => (prev + 1) % DAIRY_SEARCH_HINTS.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [value]);

  const handleClear = () => {
    triggerHaptic('light');
    onChange('');
  };

  return (
    <div
      className={`relative flex items-center bg-[#F4F6F8] rounded-xl border border-slate-200/90 focus-within:border-[#0C831F] focus-within:ring-2 focus-within:ring-[#0C831F]/20 transition-all ${className}`}
      data-testid="blinkit-search-container"
    >
      <div className="pl-3 pr-2 text-slate-400 flex items-center pointer-events-none">
        <Search className="w-4 h-4 text-slate-500" />
      </div>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={DAIRY_SEARCH_HINTS[hintIndex]}
        className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 font-medium py-2.5 focus:outline-hidden"
        aria-label="Search dairy products"
      />

      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="p-1.5 mr-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200/60 transition-colors cursor-pointer"
          aria-label="Clear search text"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
