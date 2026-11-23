import { describe, it, expect, beforeEach } from 'vitest';
import { useWishlistStore } from '../store/wishlistStore';
import { Product } from '../types/ecommerce';

const mockProduct: Product = {
  id: 'prod-milk-1',
  name: 'Amul Taaza Milk 500ml',
  description: 'Fresh toned milk',
  category: 'Dairy',
  brand: 'Amul',
  packSize: '500 ml',
  unit: 'Pouch',
  price: 27,
  mrp: 30,
  discountPercentage: 10,
  imageUrl: 'https://example.com/amul.png',
  inStock: true,
  stockQuantity: 20,
};

const mockProduct2: Product = {
  id: 'prod-ghee-2',
  name: 'Yogeshwari Pure Desi Cow Ghee',
  description: 'Traditional bilona ghee',
  category: 'Ghee',
  brand: 'Yogeshwari',
  packSize: '1 L',
  unit: 'Jar',
  price: 650,
  mrp: 750,
  discountPercentage: 13,
  imageUrl: 'https://example.com/ghee.png',
  inStock: true,
  stockQuantity: 15,
};

describe('FLIPKART WISHLIST STORE TEST SUITE', () => {
  beforeEach(() => {
    useWishlistStore.getState().clearWishlist();
  });

  it('initializes with empty items array and 0 count', () => {
    const state = useWishlistStore.getState();
    expect(state.items).toEqual([]);
    expect(state.getWishlistCount()).toBe(0);
  });

  it('toggles product into wishlist when not present', () => {
    useWishlistStore.getState().toggleWishlist(mockProduct);
    expect(useWishlistStore.getState().isInWishlist('prod-milk-1')).toBe(true);
    expect(useWishlistStore.getState().getWishlistCount()).toBe(1);
    expect(useWishlistStore.getState().items[0].product.name).toBe('Amul Taaza Milk 500ml');
  });

  it('toggles product out of wishlist when already present', () => {
    useWishlistStore.getState().addToWishlist(mockProduct);
    expect(useWishlistStore.getState().isInWishlist('prod-milk-1')).toBe(true);

    useWishlistStore.getState().toggleWishlist(mockProduct);
    expect(useWishlistStore.getState().isInWishlist('prod-milk-1')).toBe(false);
    expect(useWishlistStore.getState().getWishlistCount()).toBe(0);
  });

  it('supports adding multiple unique products and removing by ID', () => {
    useWishlistStore.getState().addToWishlist(mockProduct);
    useWishlistStore.getState().addToWishlist(mockProduct2);
    expect(useWishlistStore.getState().getWishlistCount()).toBe(2);

    useWishlistStore.getState().removeFromWishlist('prod-milk-1');
    expect(useWishlistStore.getState().isInWishlist('prod-milk-1')).toBe(false);
    expect(useWishlistStore.getState().isInWishlist('prod-ghee-2')).toBe(true);
    expect(useWishlistStore.getState().getWishlistCount()).toBe(1);
  });

  it('clears all items successfully', () => {
    useWishlistStore.getState().addToWishlist(mockProduct);
    useWishlistStore.getState().addToWishlist(mockProduct2);
    expect(useWishlistStore.getState().getWishlistCount()).toBe(2);

    useWishlistStore.getState().clearWishlist();
    expect(useWishlistStore.getState().getWishlistCount()).toBe(0);
    expect(useWishlistStore.getState().items).toHaveLength(0);
  });
});
