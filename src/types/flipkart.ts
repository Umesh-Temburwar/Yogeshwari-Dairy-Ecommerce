import { Product } from './ecommerce';

export type SortOption =
  | 'relevance'
  | 'popularity'
  | 'price_asc'
  | 'price_desc'
  | 'newest';

export interface FilterFacets {
  priceRange: [number, number];
  minRating: number | null; // 4 for 4★ & above, 3 for 3★ & above
  minDiscount: number | null; // 10 for 10%+, 20 for 20%+, 30 for 30%+
  selectedBrands: string[];
  inStockOnly: boolean;
  fastDeliveryOnly: boolean;
}

export interface WishlistItem {
  productId: string;
  addedAt: string;
  product: Product;
}

export interface ProductReview {
  id: string;
  author: string;
  rating: number;
  title: string;
  comment: string;
  date: string;
  verifiedPurchase: boolean;
}

export interface BankOffer {
  id: string;
  bank: string;
  title: string;
  description: string;
  discountBadge: string;
  code?: string;
}

export interface DeliverySlot {
  id: string;
  title: string;
  timeRange: string;
  isAvailable: boolean;
  isExpress?: boolean;
}
