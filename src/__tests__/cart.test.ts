import { describe, it, expect, beforeEach } from 'vitest';
import { useCartStore, FREE_DELIVERY_THRESHOLD, STANDARD_DELIVERY_FEE } from '../store/cartStore';
import { Product } from '../types/ecommerce';

const testProduct1: Product = {
  id: 'prod-milk-1',
  name: 'Fresh Cow Milk 1L',
  description: 'Pure Cow Milk',
  category: 'milk',
  packSize: '1000 ml',
  unit: 'pouch',
  mrp: 62,
  price: 58,
  imageUrl: 'https://example.com/milk.jpg',
  inStock: true,
  stockQuantity: 10,
};

const testProduct2: Product = {
  id: 'prod-ghee-1',
  name: 'Desi Cow Ghee 500ml',
  description: 'Pure Ghee',
  category: 'ghee-butter',
  packSize: '500 ml',
  unit: 'jar',
  mrp: 450,
  price: 410,
  imageUrl: 'https://example.com/ghee.jpg',
  inStock: true,
  stockQuantity: 5,
};

describe('Cart Store Calculations & Thresholds', () => {
  beforeEach(() => {
    useCartStore.getState().clearCart();
  });

  it('starts with an empty cart and subtotal 0', () => {
    const state = useCartStore.getState();
    expect(state.items).toHaveLength(0);
    expect(state.getSubtotal()).toBe(0);
    expect(state.getTotalItemsCount()).toBe(0);
    expect(state.getDeliveryFee()).toBe(0);
    expect(state.getTotal()).toBe(0);
  });

  it('calculates subtotal and applies ₹30 delivery fee below threshold', () => {
    const store = useCartStore.getState();
    store.addItem(testProduct1, 2); // 58 * 2 = 116

    const updated = useCartStore.getState();
    expect(updated.getSubtotal()).toBe(116);
    expect(updated.getDeliveryFee()).toBe(STANDARD_DELIVERY_FEE); // 30
    expect(updated.getAmountNeededForFreeDelivery()).toBe(FREE_DELIVERY_THRESHOLD - 116); // 300 - 116 = 184
    expect(updated.getTotal()).toBe(116 + STANDARD_DELIVERY_FEE); // 146
  });

  it('waives delivery fee when subtotal reaches or exceeds ₹300', () => {
    const store = useCartStore.getState();
    store.addItem(testProduct2, 1); // 410 (>= 300)

    const updated = useCartStore.getState();
    expect(updated.getSubtotal()).toBe(410);
    expect(updated.getDeliveryFee()).toBe(0);
    expect(updated.getAmountNeededForFreeDelivery()).toBe(0);
    expect(updated.getTotal()).toBe(410);
  });

  it('caps addition at available stock limit', () => {
    const store = useCartStore.getState();
    store.addItem(testProduct2, 10); // available is only 5

    const updated = useCartStore.getState();
    const item = updated.items.find((i) => i.productId === testProduct2.id);
    expect(item?.quantity).toBe(5);
  });

  it('removes item when quantity decrements to 0', () => {
    const store = useCartStore.getState();
    store.addItem(testProduct1, 1);
    store.updateQuantity(testProduct1.id, 0);

    const updated = useCartStore.getState();
    expect(updated.items).toHaveLength(0);
    expect(updated.getSubtotal()).toBe(0);
  });
});
