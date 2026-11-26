import { describe, it, expect } from 'vitest';
import {
  formatBlinkitPrice,
  formatBlinkitUnit,
  formatBlinkitEta,
  formatBlinkitSavings,
  formatBlinkitWeight,
} from '../utils/blinkitFormatters';

describe('BLINKIT QUICK-COMMERCE FORMATTERS SUITE', () => {
  it('formats Indian rupee currency with ₹ symbol and commas', () => {
    expect(formatBlinkitPrice(45)).toBe('₹45');
    expect(formatBlinkitPrice(1250)).toBe('₹1,250');
    expect(formatBlinkitPrice(0)).toBe('₹0');
  });

  it('formats pack unit correctly with fallbacks', () => {
    expect(formatBlinkitUnit('500 ml', 'pouch')).toBe('500 ml');
    expect(formatBlinkitUnit('', 'kg')).toBe('kg');
    expect(formatBlinkitUnit(undefined, undefined)).toBe('Standard');
  });

  it('formats delivery ETA minutes in uppercase format', () => {
    expect(formatBlinkitEta(10)).toBe('10 MINS');
    expect(formatBlinkitEta(15)).toBe('15 MINS');
    expect(formatBlinkitEta(0)).toBe('Instant');
  });

  it('computes exact rupee savings and discount percentages', () => {
    const savings = formatBlinkitSavings(100, 80);
    expect(savings.isDiscounted).toBe(true);
    expect(savings.savedAmount).toBe(20);
    expect(savings.percent).toBe(20);

    const noDiscount = formatBlinkitSavings(50, 50);
    expect(noDiscount.isDiscounted).toBe(false);
    expect(noDiscount.savedAmount).toBe(0);
  });

  it('formats weight in grams or converts to kg above 1000g', () => {
    expect(formatBlinkitWeight(250)).toBe('250 g');
    expect(formatBlinkitWeight(500)).toBe('500 g');
    expect(formatBlinkitWeight(1000)).toBe('1 kg');
    expect(formatBlinkitWeight(1500)).toBe('1.5 kg');
  });
});
