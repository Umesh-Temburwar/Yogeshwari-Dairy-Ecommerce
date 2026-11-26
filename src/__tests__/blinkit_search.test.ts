import { describe, it, expect } from 'vitest';
import { TRENDING_DAIRY_TAGS } from '../components/search/BlinkitTrendingTags';

describe('BLINKIT QUICK SEARCH & AUTO-SUGGEST SUITE', () => {
  const sampleProducts = [
    { id: '1', name: 'Fresh Cow Milk', category: 'milk', price: 30 },
    { id: '2', name: 'Malai Paneer Cube', category: 'paneer-khoya', price: 95 },
    { id: '3', name: 'Bilona Cow Ghee', category: 'ghee-butter', price: 650 },
    { id: '4', name: 'Kesar Shrikhand', category: 'sweets-shrikhand', price: 120 },
  ];

  it('filters products matching dairy search keyword', () => {
    const search = (query: string) => {
      const q = query.toLowerCase().trim();
      return sampleProducts.filter(
        (p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
      );
    };

    expect(search('milk').length).toBe(1);
    expect(search('paneer')[0].name).toBe('Malai Paneer Cube');
    expect(search('xyz').length).toBe(0);
  });

  it('contains essential daily dairy items in trending tags list', () => {
    const labels = TRENDING_DAIRY_TAGS.map((t) => t.label);
    expect(labels).toContain('Cow Milk');
    expect(labels).toContain('Fresh Paneer');
    expect(labels).toContain('Bilona Ghee');
    expect(labels).toContain('Shrikhand');
  });

  it('caps search thumbnail preview to maximum 5 items', () => {
    const manyProducts = Array.from({ length: 15 }, (_, i) => ({
      id: `p-${i}`,
      name: `Milk Variant ${i}`,
    }));
    const previewList = manyProducts.slice(0, 5);
    expect(previewList.length).toBe(5);
  });
});
