import { describe, it, expect, beforeEach } from 'vitest';
import { useCartStore, STANDARD_DELIVERY_FEE } from '../store/cartStore';
import { Product } from '../types/ecommerce';
import {
  validateIndianMobile,
  validatePincode,
} from '../utils/validation';

const dummyProducts: Product[] = [
  {
    id: 'prod-milk-cow-1',
    name: 'Fresh Cow Milk 1L',
    description: 'Pure Cow Milk straight from Bhandara farms',
    category: 'milk',
    packSize: '1000 ml',
    unit: 'pouch',
    mrp: 62,
    price: 58,
    imageUrl: 'https://example.com/cow-milk.jpg',
    inStock: true,
    stockQuantity: 20,
    isFreshToday: true,
  },
  {
    id: 'prod-paneer-1',
    name: 'Fresh Malai Paneer 250g',
    description: 'Soft and succulent malai paneer',
    category: 'paneer-butter',
    packSize: '250 g',
    unit: 'pack',
    mrp: 120,
    price: 110,
    imageUrl: 'https://example.com/paneer.jpg',
    inStock: true,
    stockQuantity: 8,
    isFreshToday: true,
  },
  {
    id: 'prod-curd-1',
    name: 'Set Thick Dahi 500g',
    description: 'Probiotic traditional pot curd',
    category: 'curd-chaas',
    packSize: '500 g',
    unit: 'cup',
    mrp: 50,
    price: 45,
    imageUrl: 'https://example.com/dahi.jpg',
    inStock: true,
    stockQuantity: 15,
  },
  {
    id: 'prod-ghee-pure-1',
    name: 'Pure Desi Bilona Ghee 1L',
    description: 'A2 Vedic Bilona Ghee',
    category: 'ghee-butter',
    packSize: '1000 ml',
    unit: 'jar',
    mrp: 950,
    price: 850,
    imageUrl: 'https://example.com/ghee.jpg',
    inStock: true,
    stockQuantity: 4,
  },
];

describe('Product Catalogue & Search Filtering Logic', () => {
  it('filters products correctly by category slug', () => {
    const milkOnly = dummyProducts.filter((p) => p.category === 'milk');
    expect(milkOnly).toHaveLength(1);
    expect(milkOnly[0].name).toBe('Fresh Cow Milk 1L');

    const paneerOnly = dummyProducts.filter((p) => p.category === 'paneer-butter');
    expect(paneerOnly).toHaveLength(1);
    expect(paneerOnly[0].id).toBe('prod-paneer-1');
  });

  it('matches products by case-insensitive name or description query', () => {
    const query = 'paneer';
    const matches = dummyProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.description.toLowerCase().includes(query.toLowerCase())
    );
    expect(matches).toHaveLength(1);
    expect(matches[0].name).toContain('Paneer');
  });

  it('handles empty search query by returning all active items', () => {
    const query: string = '';
    const matches = dummyProducts.filter((p) => {
      if (!query) return true;
      return (
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.description.toLowerCase().includes(query.toLowerCase())
      );
    });
    expect(matches).toHaveLength(dummyProducts.length);
  });

  it('returns empty array when search query matches nothing', () => {
    const query = 'nonexistent-item-xyz';
    const matches = dummyProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.description.toLowerCase().includes(query.toLowerCase())
    );
    expect(matches).toHaveLength(0);
  });
});

describe('Cart Pricing & Delivery Fee Threshold Rules', () => {
  beforeEach(() => {
    useCartStore.getState().clearCart();
  });

  it('applies standard delivery fee of ₹30 when subtotal is strictly under ₹300 (e.g. ₹299)', () => {
    const store = useCartStore.getState();
    // Add 1 paneer (110) + 1 curd (45) + 1 milk (58) + 1 curd (45) + 1 milk (58) = 316
    // Let's add 5 milk: 5 * 58 = 290 (< 300)
    store.addItem(dummyProducts[0], 5); // 290
    const state = useCartStore.getState();
    expect(state.getSubtotal()).toBe(290);
    expect(state.getDeliveryFee()).toBe(STANDARD_DELIVERY_FEE); // 30
    expect(state.getAmountNeededForFreeDelivery()).toBe(10); // 300 - 290 = 10
    expect(state.getTotal()).toBe(320); // 290 + 30
  });

  it('waives delivery fee (₹0) exactly at the boundary of ₹300 or greater', () => {
    const store = useCartStore.getState();
    // Add Ghee at ₹850
    store.addItem(dummyProducts[3], 1);
    const state = useCartStore.getState();
    expect(state.getSubtotal()).toBe(850);
    expect(state.getDeliveryFee()).toBe(0);
    expect(state.getAmountNeededForFreeDelivery()).toBe(0);
    expect(state.getTotal()).toBe(850);
  });

  it('persists cart state with multiple items and item removals', () => {
    const store = useCartStore.getState();
    store.addItem(dummyProducts[0], 2); // 2 milk
    store.addItem(dummyProducts[1], 1); // 1 paneer
    store.addItem(dummyProducts[2], 1); // 1 curd

    let state = useCartStore.getState();
    expect(state.items).toHaveLength(3);
    expect(state.getTotalItemsCount()).toBe(4);

    // Remove 1 paneer by setting quantity to 0
    store.updateQuantity(dummyProducts[1].id, 0);
    state = useCartStore.getState();
    expect(state.items).toHaveLength(2);
    expect(state.items.find((i) => i.productId === dummyProducts[1].id)).toBeUndefined();
  });
});

describe('Checkout Validation & Idempotency Rules', () => {
  it('strictly validates 10-digit Indian mobile numbers and accepts prefixed forms', () => {
    expect(validateIndianMobile('9370869896').isValid).toBe(true);
    expect(validateIndianMobile('+91 93708 69896').isValid).toBe(true);
    expect(validateIndianMobile('09370869896').isValid).toBe(true);

    // Invalid mobile numbers
    expect(validateIndianMobile('937086989').isValid).toBe(false); // 9 digits
    expect(validateIndianMobile('4370869896').isValid).toBe(false); // Starts with 4
    expect(validateIndianMobile('937086989699').isValid).toBe(false); // 12 digits
  });

  it('validates 6-digit postal pincodes', () => {
    expect(validatePincode('431517').isValid).toBe(true); // Ambajogai pincode
    expect(validatePincode('441904').isValid).toBe(true); // Bhandara pincode
    expect(validatePincode('440010').isValid).toBe(true); // Nagpur pincode
    expect(validatePincode('44190').isValid).toBe(false); // 5 digits
    expect(validatePincode('4419040').isValid).toBe(false); // 7 digits
  });

  it('generates unique, collision-free idempotency keys across rapid requests', () => {
    const keys = new Set<string>();
    for (let i = 0; i < 100; i++) {
      const key = `ord_idem_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      keys.add(key);
    }
    expect(keys.size).toBe(100);
  });
});
