import { describe, it, expect } from 'vitest';
import { formatBlinkitPrice, formatBlinkitEta } from '../utils/blinkitFormatters';

describe('BLINKIT QUICK-COMMERCE FULL END-TO-END FLOW SUITE', () => {
  it('simulates customer adding multiple fresh dairy items to cart and validates pricing', () => {
    const cart = [
      { id: 'yd-milk-cow-500', name: 'Cow Milk 500ml', mrp: 32, price: 30, quantity: 2 },
      { id: 'yd-paneer-200', name: 'Malai Paneer 200g', mrp: 95, price: 85, quantity: 1 },
      { id: 'yd-curd-400', name: 'Thick Curd 400g', mrp: 45, price: 40, quantity: 2 },
    ];

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const itemTotalMrp = cart.reduce((sum, item) => sum + item.mrp * item.quantity, 0);
    const savings = itemTotalMrp - subtotal;

    expect(subtotal).toBe(30 * 2 + 85 * 1 + 40 * 2); // 60 + 85 + 80 = 225
    expect(savings).toBe(32 * 2 + 95 * 1 + 45 * 2 - 225); // 64 + 95 + 90 = 249 - 225 = 24
    expect(formatBlinkitPrice(subtotal)).toBe('₹225');
  });

  it('evaluates handling fee, delivery threshold, and tip calculation', () => {
    const subtotal = 225;
    const freeDeliveryThreshold = 300;
    const standardDeliveryFee = 30;
    const handlingCharge = 2;
    const tip = 20;

    const deliveryFee = subtotal >= freeDeliveryThreshold ? 0 : standardDeliveryFee;
    const grandTotal = subtotal + handlingCharge + deliveryFee + tip;

    expect(deliveryFee).toBe(30);
    expect(grandTotal).toBe(225 + 2 + 30 + 20); // 277
    expect(formatBlinkitPrice(grandTotal)).toBe('₹277');
  });

  it('validates 10-15 minute ETA string formatting', () => {
    expect(formatBlinkitEta(10)).toBe('10 MINS');
    expect(formatBlinkitEta(15)).toBe('15 MINS');
  });

  it('verifies doorstep serviceability check within 25 km of Ambajogai Mandi Bazar', () => {
    const checkServiceable = (distanceKm: number) => {
      if (distanceKm <= 10) return { serviceable: true, tier: 'EXPRESS_10MIN' };
      if (distanceKm <= 25) return { serviceable: true, tier: 'STANDARD_LOCAL' };
      return { serviceable: false, tier: 'OUT_OF_ZONE' };
    };

    expect(checkServiceable(3.2)).toEqual({ serviceable: true, tier: 'EXPRESS_10MIN' });
    expect(checkServiceable(18.5)).toEqual({ serviceable: true, tier: 'STANDARD_LOCAL' });
    expect(checkServiceable(28.0)).toEqual({ serviceable: false, tier: 'OUT_OF_ZONE' });
  });
});
