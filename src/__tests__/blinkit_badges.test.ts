import { describe, it, expect } from 'vitest';

describe('BLINKIT QUICK-COMMERCE BADGES & METADATA SUITE', () => {
  it('formats Blinkit delivery ETA string accurately', () => {
    const formatBlinkitEta = (mins: number) => `${mins} MINS`;
    expect(formatBlinkitEta(10)).toBe('10 MINS');
    expect(formatBlinkitEta(15)).toBe('15 MINS');
  });

  it('determines cold chain requirements based on product dairy category', () => {
    const isColdChainRequired = (category: string) => {
      const chilledCategories = ['milk', 'dahi-chaas-lassi', 'paneer-khoya', 'sweets-shrikhand'];
      return chilledCategories.includes(category.toLowerCase());
    };

    expect(isColdChainRequired('milk')).toBe(true);
    expect(isColdChainRequired('paneer-khoya')).toBe(true);
    expect(isColdChainRequired('dahi-chaas-lassi')).toBe(true);
    expect(isColdChainRequired('dry-fruits')).toBe(false);
  });

  it('validates 4°C temperature safe zone for dairy freshness', () => {
    const isTemperatureSafe = (tempCelsius: number) => tempCelsius >= 0 && tempCelsius <= 8;
    expect(isTemperatureSafe(4)).toBe(true);
    expect(isTemperatureSafe(2)).toBe(true);
    expect(isTemperatureSafe(12)).toBe(false);
  });

  it('calculates morning batch freshness status based on mfg timestamp', () => {
    const isMorningBatchFresh = (mfgHour: number) => mfgHour >= 4 && mfgHour <= 10;
    expect(isMorningBatchFresh(5)).toBe(true); // 5 AM milking batch
    expect(isMorningBatchFresh(7)).toBe(true);
    expect(isMorningBatchFresh(15)).toBe(false);
  });

  it('computes days remaining until expiry for shelf life badge', () => {
    const computeDaysRemaining = (expiryDate: string, currentDate: string) => {
      const exp = new Date(expiryDate).getTime();
      const curr = new Date(currentDate).getTime();
      return Math.round((exp - curr) / (1000 * 60 * 60 * 24));
    };

    const daysLeft = computeDaysRemaining('2026-11-28', '2026-11-26');
    expect(daysLeft).toBe(2);
  });
});
