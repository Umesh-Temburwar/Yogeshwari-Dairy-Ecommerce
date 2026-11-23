import { describe, it, expect } from 'vitest';
import { FLIPKART_MEGA_CATEGORIES } from '../components/layout/FlipkartMegaNav';

describe('FLIPKART MEGA NAVIGATION & CATEGORY STRUCTURE', () => {
  it('contains essential dairy categories', () => {
    const slugs = FLIPKART_MEGA_CATEGORIES.map((c) => c.slug);
    expect(slugs).toContain('all');
    expect(slugs).toContain('milk-cream');
    expect(slugs).toContain('paneer-butter');
    expect(slugs).toContain('curd-lassi');
    expect(slugs).toContain('desi-ghee');
    expect(slugs).toContain('sweets-mithai');
  });

  it('includes proper icons and names for each category', () => {
    FLIPKART_MEGA_CATEGORIES.forEach((cat) => {
      expect(cat.id).toBeDefined();
      expect(cat.name.length).toBeGreaterThan(2);
      expect(cat.icon).toBeDefined();
    });
  });

  it('provides subcategories for expandable dairy departments', () => {
    const milkCat = FLIPKART_MEGA_CATEGORIES.find((c) => c.slug === 'milk-cream');
    expect(milkCat?.hasSubmenu).toBe(true);
    expect(milkCat?.subcategories).toBeDefined();
    expect(milkCat?.subcategories?.length).toBeGreaterThanOrEqual(3);
    expect(milkCat?.subcategories).toContain('Cow Milk');
  });

  it('provides ghee subcategories including bilona and cow ghee', () => {
    const gheeCat = FLIPKART_MEGA_CATEGORIES.find((c) => c.slug === 'desi-ghee');
    expect(gheeCat?.subcategories).toContain('Desi Cow Ghee');
    expect(gheeCat?.subcategories).toContain('Bilona Ghee');
  });
});
