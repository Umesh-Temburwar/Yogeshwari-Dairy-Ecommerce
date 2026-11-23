import { describe, it, expect } from 'vitest';

describe('DEALS OF THE DAY & PRODUCT RAILS SUITE', () => {
  it('computes positive remaining seconds until midnight', () => {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(23, 59, 59, 999);
    const diffMs = midnight.getTime() - now.getTime();
    expect(diffMs).toBeGreaterThan(0);
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    expect(hours).toBeGreaterThanOrEqual(0);
    expect(hours).toBeLessThanOrEqual(24);
  });

  it('filters deal products strictly by positive discount percentage or MRP savings', () => {
    const items = [
      { id: '1', name: 'Milk', price: 27, mrp: 30, discountPercentage: 10 },
      { id: '2', name: 'Ghee', price: 650, mrp: 650, discountPercentage: 0 },
      { id: '3', name: 'Paneer', price: 90, mrp: 100, discountPercentage: 10 },
    ];

    const deals = items.filter((p) => p.discountPercentage > 0 || p.mrp > p.price);
    expect(deals).toHaveLength(2);
    expect(deals.map((d) => d.id)).toEqual(['1', '3']);
  });

  it('correctly maps dairy, sweets and snacks keywords', () => {
    const isDairy = (name: string) => /milk|paneer|dahi|curd|butter|cream/i.test(name);
    const isSweets = (name: string) => /sweet|mithai|jamun|pedha|katli|ladoo/i.test(name);
    const isSnacks = (name: string) => /snack|namkeen|toast|khari|rusk|haldiram/i.test(name);

    expect(isDairy('Fresh Malai Paneer 200g')).toBe(true);
    expect(isSweets('Kaju Katli Gift Box')).toBe(true);
    expect(isSnacks('Haldiram Aloo Bhujia')).toBe(true);
    expect(isDairy('Haldiram Aloo Bhujia')).toBe(false);
  });
});
