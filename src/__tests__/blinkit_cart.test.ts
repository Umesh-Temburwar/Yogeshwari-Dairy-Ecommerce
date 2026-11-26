import { describe, it, expect } from 'vitest';

describe('BLINKIT QUICK-COMMERCE CART & BILL SUITE', () => {
  it('computes free delivery threshold progress and remaining amount', () => {
    const threshold = 299;
    const calculateProgress = (subtotal: number) => {
      const isFree = subtotal >= threshold;
      const amountNeeded = Math.max(0, threshold - subtotal);
      const percent = Math.min(100, Math.round((subtotal / threshold) * 100));
      return { isFree, amountNeeded, percent };
    };

    const underThreshold = calculateProgress(200);
    expect(underThreshold.isFree).toBe(false);
    expect(underThreshold.amountNeeded).toBe(99);
    expect(underThreshold.percent).toBe(67);

    const overThreshold = calculateProgress(350);
    expect(overThreshold.isFree).toBe(true);
    expect(overThreshold.amountNeeded).toBe(0);
    expect(overThreshold.percent).toBe(100);
  });

  it('calculates grand total including handling fee and optional tip', () => {
    const calculateGrandTotal = (
      subtotal: number,
      handlingFee: number,
      deliveryFee: number,
      tip: number
    ) => {
      return subtotal + handlingFee + deliveryFee + tip;
    };

    const totalWithTip = calculateGrandTotal(250, 2, 15, 20);
    expect(totalWithTip).toBe(287);

    const totalWithoutTip = calculateGrandTotal(300, 2, 0, 0); // free delivery
    expect(totalWithoutTip).toBe(302);
  });

  it('aggregates total user savings across multiple discounted dairy items', () => {
    const items = [
      { mrp: 35, price: 30, quantity: 2 }, // saved 5 * 2 = 10
      { mrp: 60, price: 55, quantity: 1 }, // saved 5 * 1 = 5
      { mrp: 120, price: 100, quantity: 2 }, // saved 20 * 2 = 40
    ];

    const totalSavings = items.reduce(
      (acc, item) => acc + (item.mrp - item.price) * item.quantity,
      0
    );
    expect(totalSavings).toBe(55);
  });
});
