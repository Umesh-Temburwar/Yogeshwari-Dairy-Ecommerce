import React from 'react';
import { Product } from '@/types/ecommerce';
import { FlipkartProductRail } from './FlipkartProductRail';

interface TrendingSnacksRailProps {
  products: Product[];
  onOpenDetails: (product: Product) => void;
  onViewCategory?: (cat: string) => void;
}

export const TrendingSnacksRail: React.FC<TrendingSnacksRailProps> = ({
  products,
  onOpenDetails,
  onViewCategory,
}) => {
  const snackProducts = products.filter((p) => {
    const text = `${p.name} ${p.category} ${p.brand}`.toLowerCase();
    return (
      text.includes('snack') ||
      text.includes('namkeen') ||
      text.includes('toast') ||
      text.includes('rusk') ||
      text.includes('khari') ||
      text.includes('haldiram') ||
      text.includes('parle') ||
      text.includes('biscuit') ||
      text.includes('pickle')
    );
  });

  if (snackProducts.length === 0) return null;

  return (
    <FlipkartProductRail
      title="Trending Snacks &amp; Morning Toast"
      subtitle="Crisp Khari, Toasts, Biscuits &amp; Savoury Namkeens"
      badge="TOP RATED"
      products={snackProducts.slice(0, 10)}
      onOpenDetails={onOpenDetails}
      onViewAll={() => onViewCategory && onViewCategory('snacks-spices')}
    />
  );
};
