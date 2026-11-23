import React from 'react';
import { X } from 'lucide-react';
import { FilterFacets } from '@/types/flipkart';
import { triggerHaptic } from '@/utils/haptics';

interface ActiveFilterChipsProps {
  facets: FilterFacets;
  onUpdateFacets: (updater: (prev: FilterFacets) => FilterFacets) => void;
  onResetFacets: () => void;
}

export const ActiveFilterChips: React.FC<ActiveFilterChipsProps> = ({
  facets,
  onUpdateFacets,
  onResetFacets,
}) => {
  const chips: { id: string; label: string; onRemove: () => void }[] = [];

  // Selected Brands
  facets.selectedBrands.forEach((b) => {
    chips.push({
      id: `brand-${b}`,
      label: `Brand: ${b}`,
      onRemove: () => {
        onUpdateFacets((prev) => ({
          ...prev,
          selectedBrands: prev.selectedBrands.filter((item) => item !== b),
        }));
      },
    });
  });

  // Rating
  if (facets.minRating !== null) {
    chips.push({
      id: 'rating',
      label: `${facets.minRating}★ & above`,
      onRemove: () => {
        onUpdateFacets((prev) => ({ ...prev, minRating: null }));
      },
    });
  }

  // Discount
  if (facets.minDiscount !== null) {
    chips.push({
      id: 'discount',
      label: `${facets.minDiscount}% or more`,
      onRemove: () => {
        onUpdateFacets((prev) => ({ ...prev, minDiscount: null }));
      },
    });
  }

  // Price range
  if (facets.priceRange[0] > 0 || facets.priceRange[1] < 2000) {
    chips.push({
      id: 'price',
      label: `₹${facets.priceRange[0]} - ₹${facets.priceRange[1]}`,
      onRemove: () => {
        onUpdateFacets((prev) => ({ ...prev, priceRange: [0, 2000] }));
      },
    });
  }

  // Fast Delivery
  if (facets.fastDeliveryOnly) {
    chips.push({
      id: 'fast-delivery',
      label: '⚡ 15-min Express',
      onRemove: () => {
        onUpdateFacets((prev) => ({ ...prev, fastDeliveryOnly: false }));
      },
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap py-2">
      <span className="text-[11px] font-bold text-slate-500 uppercase">
        Active Filters:
      </span>
      {chips.map((chip) => (
        <span
          key={chip.id}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#2874F0] text-[#2874F0] rounded-xs text-xs font-semibold shadow-2xs"
        >
          <span>{chip.label}</span>
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              chip.onRemove();
            }}
            className="text-[#2874F0] hover:text-rose-600 cursor-pointer"
            aria-label={`Remove filter ${chip.label}`}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </span>
      ))}

      <button
        type="button"
        onClick={() => {
          triggerHaptic('light');
          onResetFacets();
        }}
        className="text-xs font-bold text-rose-600 hover:underline ml-1 cursor-pointer"
      >
        Clear All
      </button>
    </div>
  );
};
