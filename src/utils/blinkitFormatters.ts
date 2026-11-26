/**
 * Blinkit Quick-Commerce utility formatters for Indian dairy items.
 */

export function formatBlinkitPrice(price: number): string {
  if (typeof price !== 'number' || isNaN(price)) return '₹0';
  return `₹${Math.round(price).toLocaleString('en-IN')}`;
}

export function formatBlinkitUnit(packSize?: string, unit?: string): string {
  if (packSize && packSize.trim()) return packSize.trim();
  if (unit && unit.trim()) return unit.trim();
  return 'Standard';
}

export function formatBlinkitEta(minutes: number = 10): string {
  if (minutes <= 0) return 'Instant';
  return `${minutes} MINS`;
}

export function formatBlinkitSavings(
  mrp: number,
  price: number
): { savedAmount: number; percent: number; isDiscounted: boolean } {
  if (!mrp || !price || mrp <= price) {
    return { savedAmount: 0, percent: 0, isDiscounted: false };
  }
  const savedAmount = mrp - price;
  const percent = Math.round((savedAmount / mrp) * 100);
  return { savedAmount, percent, isDiscounted: true };
}

export function formatBlinkitWeight(grams: number): string {
  if (grams >= 1000) {
    const kg = (grams / 1000).toFixed(1).replace(/\.0$/, '');
    return `${kg} kg`;
  }
  return `${grams} g`;
}
