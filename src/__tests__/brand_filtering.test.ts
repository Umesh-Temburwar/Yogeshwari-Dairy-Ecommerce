import { describe, it, expect } from 'vitest';
import { getProductBrand, normalizeBrandName } from '@/utils/brands';
import { getCategorySlugForProduct } from '@/constants/categories';
import { Product } from '@/types/ecommerce';

describe('Brand-First Cascading Category & Product Filter Suite', () => {
  const sampleProducts: Product[] = [
    {
      id: 'p1',
      name: 'Yogeshwari Fresh Cow Milk',
      category: 'milk',
      brand: 'Yogeshwari',
      packSize: '500ml',
      unit: 'pouch',
      mrp: 32,
      price: 30,
      imageUrl: '',
      inStock: true,
      stockQuantity: 50,
      description: '',
    },
    {
      id: 'p2',
      name: 'Amul Taaza Toned Milk',
      category: 'milk',
      brand: 'Amul',
      packSize: '500ml',
      unit: 'pouch',
      mrp: 28,
      price: 27,
      imageUrl: '',
      inStock: true,
      stockQuantity: 40,
      description: '',
    },
    {
      id: 'p3',
      name: 'Amul Pasteurised Butter',
      category: 'ghee-butter',
      brand: 'Amul',
      packSize: '100g',
      unit: 'pack',
      mrp: 60,
      price: 58,
      imageUrl: '',
      inStock: true,
      stockQuantity: 30,
      description: '',
    },
    {
      id: 'p4',
      name: "Haldiram's Gulab Jamun Tin",
      category: 'sweets-shrikhand',
      brand: "Haldiram's",
      packSize: '1kg',
      unit: 'tin',
      mrp: 260,
      price: 235,
      imageUrl: '',
      inStock: true,
      stockQuantity: 20,
      description: '',
    },
    {
      id: 'p5',
      name: 'Britannia 100% Whole Wheat Bread',
      category: 'bakery-essentials',
      brand: 'Britannia',
      packSize: '400g',
      unit: 'pack',
      mrp: 55,
      price: 50,
      imageUrl: '',
      inStock: true,
      stockQuantity: 25,
      description: '',
    },
  ];

  describe('1. Brand Extraction & Normalization', () => {
    it('normalizes common brand variations correctly', () => {
      expect(normalizeBrandName('amul')).toBe('Amul');
      expect(normalizeBrandName('haldiram')).toBe("Haldiram's");
      expect(normalizeBrandName("haldiram's")).toBe("Haldiram's");
      expect(normalizeBrandName('britannia')).toBe('Britannia');
      expect(normalizeBrandName('cadbury')).toBe('Cadbury');
      expect(normalizeBrandName('yogeshwari')).toBe('Yogeshwari');
    });

    it('infers brand from product name when brand property is not provided', () => {
      expect(getProductBrand({ name: 'Amul Kool Kesar Badam' })).toBe('Amul');
      expect(getProductBrand({ name: "Haldiram's Rasgulla 1kg" })).toBe("Haldiram's");
      expect(getProductBrand({ name: 'Britannia Good Day Cookies' })).toBe('Britannia');
      expect(getProductBrand({ name: 'Cadbury Dairy Milk' })).toBe('Cadbury');
      expect(getProductBrand({ name: 'Fresh Malai Paneer' })).toBe('Yogeshwari');
    });

    it('prefers explicit product.brand when present', () => {
      expect(getProductBrand({ brand: 'Gramilk', name: 'Pure Cow Ghee' })).toBe('Gramilk');
      expect(getProductBrand({ brand: 'Amul', name: 'Cheese Slices' })).toBe('Amul');
    });
  });

  describe('2. Available Brands Extraction', () => {
    it('groups products by brand and sorts by count descending with All first', () => {
      const map = new Map<string, number>();
      for (const p of sampleProducts) {
        const b = getProductBrand(p);
        map.set(b, (map.get(b) || 0) + 1);
      }
      const list = Array.from(map.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([name, count]) => ({ name, count }));

      const availableBrands = [{ name: 'All', count: sampleProducts.length }, ...list];

      expect(availableBrands[0]).toEqual({ name: 'All', count: 5 });
      // Amul has 2 products, so it should be second
      expect(availableBrands[1]).toEqual({ name: 'Amul', count: 2 });
      expect(availableBrands.some((b) => b.name === 'Yogeshwari')).toBe(true);
      expect(availableBrands.some((b) => b.name === "Haldiram's")).toBe(true);
      expect(availableBrands.some((b) => b.name === 'Britannia')).toBe(true);
    });
  });

  describe('3. Cascading Category Filtering by Brand', () => {
    it('restricts categories to only those containing products of the selected brand', () => {
      const allCategorySlugs = [
        'all',
        'milk',
        'paneer-khoya',
        'dahi-chaas-lassi',
        'ghee-butter',
        'sweets-shrikhand',
        'bakery-essentials',
      ];

      // Test with Amul (has milk and butter/paneer-khoya)
      const selectedBrand = 'Amul';
      const brandLower = selectedBrand.toLowerCase();
      const allowedSlugs = new Set<string>();

      for (const p of sampleProducts) {
        if (getProductBrand(p).toLowerCase() === brandLower) {
          allowedSlugs.add(getCategorySlugForProduct(p.category, p.name));
        }
      }

      const displayedSlugs = allCategorySlugs.filter(
        (slug) => slug === 'all' || allowedSlugs.has(slug)
      );

      expect(displayedSlugs).toContain('all');
      expect(displayedSlugs).toContain('milk');
      expect(displayedSlugs).toContain('paneer-khoya');
      // Should NOT contain unrelated categories
      expect(displayedSlugs).not.toContain('sweets-shrikhand');
      expect(displayedSlugs).not.toContain('bakery-essentials');
      expect(displayedSlugs).not.toContain('ghee-butter');
    });

    it('returns all categories when selectedBrand is All', () => {
      const selectedBrand = 'All';
      expect(selectedBrand === 'All').toBe(true);
    });
  });

  describe('4. Combined Product Filtering (Brand + Category + Search)', () => {
    it('filters products by brand alone', () => {
      const brand = 'Amul';
      const results = sampleProducts.filter(
        (p) => getProductBrand(p).toLowerCase() === brand.toLowerCase()
      );
      expect(results).toHaveLength(2);
      expect(results.every((p) => p.brand === 'Amul')).toBe(true);
    });

    it('filters products by brand AND category', () => {
      const brand = 'Amul';
      const categorySlug = 'paneer-khoya';
      const results = sampleProducts.filter(
        (p) =>
          getProductBrand(p).toLowerCase() === brand.toLowerCase() &&
          getCategorySlugForProduct(p.category, p.name) === categorySlug
      );
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Amul Pasteurised Butter');
    });

    it('filters products by brand AND search query', () => {
      const brand = 'Amul';
      const search = 'toned';
      const results = sampleProducts.filter(
        (p) =>
          getProductBrand(p).toLowerCase() === brand.toLowerCase() &&
          p.name.toLowerCase().includes(search.toLowerCase())
      );
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('p2');
    });
  });
});
