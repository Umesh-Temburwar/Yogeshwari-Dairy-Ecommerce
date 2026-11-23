import React from 'react';
import { Product } from '@/types/ecommerce';
import { FlipkartProductRail } from './FlipkartProductRail';

interface TopDairyRailProps {
  products: Product[];
  onOpenDetails: (product: Product) => void;
  onViewCategory?: (cat: string) => void;
}

export const TopDairyRail: React.FC<TopDairyRailProps> = ({
  products,
  onOpenDetails,
  onViewCategory,
}) => {
  const dairyProducts = products.filter((p) => {
    const text = `${p.name} ${p.category}`.toLowerCase();
    return (
      text.includes('milk') ||
      text.includes('paneer') ||
      text.includes('dahi') ||
      text.includes('curd') ||
      text.includes('butter') ||
      text.includes('cream')
    );
  });

  if (dairyProducts.length === 0) return null;

  return (
    <FlipkartProductRail
      title="Top Selection in Fresh Dairy"
      subtitle="Pure Cow & Buffalo Milk, Soft Paneer, Creamy Dahi"
      badge="FARM FRESH"
      products={dairyProducts.slice(0, 10)}
      onOpenDetails={onOpenDetails}
      onViewAll={() => onViewCategory && onViewCategory('milk-cream')}
    />
  );
};
