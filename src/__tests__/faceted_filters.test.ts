import { describe, it, expect } from 'vitest';
import { Product } from '../types/ecommerce';

const mockCatalog: Product[] = [
  {
    id: '1',
    name: 'Amul Taaza Milk',
    description: 'Fresh milk',
    category: 'Dairy',
    brand: 'Amul',
    packSize: '500ml',
    unit: 'Pouch',
    price: 27,
    mrp: 30,
    discountPercentage: 10,
    rating: 4.8,
    ratingCount: 350,
    imageUrl: '',
    inStock: true,
    stockQuantity: 20,
  },
  {
    id: '2',
    name: 'Yogeshwari Pure Cow Ghee',
    description: 'Pure cow ghee',
    category: 'Ghee',
    brand: 'Yogeshwari',
    packSize: '1L',
    unit: 'Jar',
    price: 650,
    mrp: 750,
    discountPercentage: 13,
    rating: 4.9,
    ratingCount: 520,
    imageUrl: '',
    inStock: true,
    stockQuantity: 15,
  },
  {
    id: '3',
    name: 'Haldiram Aloo Bhujia',
    description: 'Crisp namkeen',
    category: 'Snacks',
    brand: "Haldiram's",
    packSize: '200g',
    unit: 'Packet',
    price: 60,
    mrp: 60,
    discountPercentage: 0,
    rating: 4.2,
    ratingCount: 110,
    imageUrl: '',
    inStock: true,
    stockQuantity: 40,
  },
  {
    id: '4',
    name: 'Parle-G Gold Biscuit',
    description: 'Glucose biscuit',
    category: 'Bakery',
    brand: 'Parle',
    packSize: '1kg',
    unit: 'Packet',
    price: 120,
    mrp: 140,
    discountPercentage: 14,
    rating: 4.6,
    ratingCount: 290,
    imageUrl: '',
    inStock: true,
    stockQuantity: 50,
  },
];

describe('FACETED FILTER & SORT REDUCER SUITE', () => {
  it('filters by minimum rating threshold 4.5 and above', () => {
    const minRating = 4.5;
    const filtered = mockCatalog.filter((p) => (p.rating || 0) >= minRating);
    expect(filtered.map((p) => p.id)).toEqual(['1', '2', '4']);
  });

  it('filters by multiple brand selection', () => {
    const selectedBrands = ['Amul', 'Parle'];
    const filtered = mockCatalog.filter((p) => selectedBrands.includes(p.brand || ''));
    expect(filtered.map((p) => p.id)).toEqual(['1', '4']);
  });

  it('filters by price range bounded between 50 and 200', () => {
    const [minP, maxP] = [50, 200];
    const filtered = mockCatalog.filter((p) => p.price >= minP && p.price <= maxP);
    expect(filtered.map((p) => p.id)).toEqual(['3', '4']);
  });

  it('sorts by price low to high and high to low', () => {
    const asc = [...mockCatalog].sort((a, b) => a.price - b.price);
    expect(asc.map((p) => p.price)).toEqual([27, 60, 120, 650]);

    const desc = [...mockCatalog].sort((a, b) => b.price - a.price);
    expect(desc.map((p) => p.price)).toEqual([650, 120, 60, 27]);
  });

  it('sorts by popularity rating count descending', () => {
    const popular = [...mockCatalog].sort((a, b) => (b.ratingCount || 0) - (a.ratingCount || 0));
    expect(popular[0].id).toBe('2'); // 520 reviews
    expect(popular[1].id).toBe('1'); // 350 reviews
  });
});
