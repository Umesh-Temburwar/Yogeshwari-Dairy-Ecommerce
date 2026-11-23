import React from 'react';
import { Product } from '@/types/ecommerce';
import { FlipkartProductRail } from './FlipkartProductRail';

interface BestSellersSweetsRailProps {
  products: Product[];
  onOpenDetails: (product: Product) => void;
  onViewCategory?: (cat: string) => void;
}

export const BestSellersSweetsRail: React.FC<BestSellersSweetsRailProps> = ({
  products,
  onOpenDetails,
  onViewCategory,
}) => {
  const sweetProducts = products.filter((p) => {
    const text = `${p.name} ${p.category}`.toLowerCase();
    return (
      text.includes('sweet') ||
      text.includes('mithai') ||
      text.includes('jamun') ||
      text.includes('pedha') ||
      text.includes('peda') ||
      text.includes('katli') ||
      text.includes('ladoo') ||
      text.includes('laddu') ||
      text.includes('rasgulla')
    );
  });

  if (sweetProducts.length === 0) return null;

  return (
    <FlipkartProductRail
      title="Best Sellers in Sweets & Mithai"
      subtitle="Crafted with 100% Pure Cow Ghee & Fresh Mawa"
      badge="DESI GHEE"
      products={sweetProducts.slice(0, 10)}
      onOpenDetails={onOpenDetails}
      onViewAll={() => onViewCategory && onViewCategory('sweets-mithai')}
    />
  );
};
