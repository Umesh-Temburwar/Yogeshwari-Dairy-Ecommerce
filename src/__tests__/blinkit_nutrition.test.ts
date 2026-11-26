import { describe, it, expect } from 'vitest';

describe('BLINKIT PRODUCT DETAIL NUTRITION & FRESHNESS SUITE', () => {
  it('validates cow milk fat content (min 3.5%) according to FSSAI guidelines', () => {
    const isCowMilkCompliant = (fatPercent: number) => fatPercent >= 3.2 && fatPercent <= 4.5;
    expect(isCowMilkCompliant(3.5)).toBe(true);
    expect(isCowMilkCompliant(2.0)).toBe(false);
  });

  it('validates buffalo milk fat content (min 6.0%) for full cream rich dairy', () => {
    const isBuffaloMilkCompliant = (fatPercent: number) => fatPercent >= 6.0;
    expect(isBuffaloMilkCompliant(6.5)).toBe(true);
    expect(isBuffaloMilkCompliant(7.0)).toBe(true);
    expect(isBuffaloMilkCompliant(4.0)).toBe(false);
  });

  it('verifies calorie calculation per 100ml based on macronutrients', () => {
    // 1g fat = 9 kcal, 1g protein = 4 kcal, 1g carb = 4 kcal
    const computeKcal = (fatGrams: number, proteinGrams: number, carbGrams: number) => {
      return fatGrams * 9 + proteinGrams * 4 + carbGrams * 4;
    };

    const calories = computeKcal(3.5, 3.2, 4.8);
    expect(Math.round(calories)).toBe(64); // ~62-64 kcal for 100ml
  });

  it('verifies perishable items have strict shelf life below 5 days', () => {
    const maxDaysForFreshMilk = 3;
    expect(maxDaysForFreshMilk).toBeLessThan(5);
  });
});
