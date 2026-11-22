import { describe, it, expect } from 'vitest';
import { DEFAULT_PROMOTIONAL_BANNERS } from '@/constants/banners';
import { PromotionalBanner } from '@/types/ecommerce';

describe('Blinkit/Zepto-style Auto-Sliding Promotional Banners Suite', () => {
  describe('1. Default Fallback Banners Integrity', () => {
    it('provides exactly 5 active promotional banners by default', () => {
      expect(DEFAULT_PROMOTIONAL_BANNERS).toHaveLength(5);
      expect(DEFAULT_PROMOTIONAL_BANNERS.every((b) => b.isActive)).toBe(true);
    });

    it('contains valid image URLs, titles, and display orders', () => {
      DEFAULT_PROMOTIONAL_BANNERS.forEach((banner, idx) => {
        expect(banner.id).toBeTruthy();
        expect(banner.title).toBeTruthy();
        expect(banner.imageUrl).toMatch(/^https:\/\//);
        expect(banner.displayOrder).toBe(idx + 1);
        expect(['CATEGORY', 'BRAND', 'EXTERNAL']).toContain(banner.linkType);
        expect(banner.linkTarget).toBeTruthy();
      });
    });

    it('supports both CATEGORY and BRAND targeting', () => {
      const hasCategoryBanner = DEFAULT_PROMOTIONAL_BANNERS.some((b) => b.linkType === 'CATEGORY');
      const hasBrandBanner = DEFAULT_PROMOTIONAL_BANNERS.some((b) => b.linkType === 'BRAND');
      expect(hasCategoryBanner).toBe(true);
      expect(hasBrandBanner).toBe(true);
    });
  });

  describe('2. Banner Carousel Navigation & Index Cycling', () => {
    const banners: PromotionalBanner[] = DEFAULT_PROMOTIONAL_BANNERS;

    it('cycles sequentially through slides forward (modulo length)', () => {
      let currentIndex = 0;
      const getNext = (idx: number) => (idx + 1) % banners.length;

      currentIndex = getNext(currentIndex); // 1
      expect(currentIndex).toBe(1);

      currentIndex = getNext(currentIndex); // 2
      expect(currentIndex).toBe(2);

      // Cycle to the end and wrap around
      currentIndex = 4;
      currentIndex = getNext(currentIndex); // wraps to 0
      expect(currentIndex).toBe(0);
    });

    it('cycles sequentially through slides backward (prev with wrap-around)', () => {
      let currentIndex = 0;
      const getPrev = (idx: number) => (idx - 1 + banners.length) % banners.length;

      currentIndex = getPrev(currentIndex); // wraps to 4
      expect(currentIndex).toBe(4);

      currentIndex = getPrev(currentIndex); // 3
      expect(currentIndex).toBe(3);
    });
  });

  describe('3. Banner Click Actions & Deep-link Target Resolution', () => {
    it('accurately resolves category click action and target', () => {
      const milkBanner = DEFAULT_PROMOTIONAL_BANNERS.find((b) => b.linkTarget === 'milk');
      expect(milkBanner).toBeDefined();
      expect(milkBanner?.linkType).toBe('CATEGORY');
      expect(milkBanner?.linkTarget).toBe('milk');
    });

    it('accurately resolves brand click action and target', () => {
      const amulBanner = DEFAULT_PROMOTIONAL_BANNERS.find((b) => b.linkTarget === 'Amul');
      expect(amulBanner).toBeDefined();
      expect(amulBanner?.linkType).toBe('BRAND');
      expect(amulBanner?.linkTarget).toBe('Amul');
    });
  });
});
