export interface BrandItem {
  name: string;
  count: number;
}

export const KNOWN_BRANDS: string[] = [
  'Yogeshwari',
  'Amul',
  "Haldiram's",
  'Britannia',
  'Cadbury',
  'Gramilk',
  'Gowardhan',
  'Mother Dairy',
  'Nestle',
  'Parle',
  'Tata',
  'Sunfeast',
  'Dabur',
  'Patanjali',
];

/**
 * Normalizes brand name for uniform casing and grouping
 */
export function normalizeBrandName(brand?: string | null): string {
  if (!brand || !brand.trim()) return '';
  const trimmed = brand.trim();
  if (/^haldiram/i.test(trimmed)) return "Haldiram's";
  if (/^cadbury/i.test(trimmed)) return 'Cadbury';
  if (/^britannia/i.test(trimmed)) return 'Britannia';
  if (/^amul/i.test(trimmed)) return 'Amul';
  if (/^gramilk/i.test(trimmed)) return 'Gramilk';
  if (/^gowardhan/i.test(trimmed)) return 'Gowardhan';
  if (/^yogeshwari/i.test(trimmed)) return 'Yogeshwari';
  if (/^tata/i.test(trimmed)) return 'Tata';
  if (/^nestle/i.test(trimmed)) return 'Nestle';
  if (/^mother\s*dairy/i.test(trimmed)) return 'Mother Dairy';
  if (/^parle/i.test(trimmed)) return 'Parle';
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

/**
 * Extracts normalized brand name from product.brand or infers from product.name
 */
export function getProductBrand(product: { brand?: string | null; name?: string }): string {
  if (product.brand && product.brand.trim()) {
    return normalizeBrandName(product.brand);
  }
  const name = product.name || '';
  for (const b of KNOWN_BRANDS) {
    if (new RegExp(`\\b${b.replace("'", "['’]?")}\\b`, 'i').test(name)) {
      return normalizeBrandName(b);
    }
  }
  return 'Yogeshwari';
}

export interface BrandVisual {
  logoUrl?: string;
  avatarText: string;
  bgClass: string;
  textClass: string;
}

/**
 * Visual badge/avatar styling for each brand
 */
export function getBrandVisual(brandName: string): BrandVisual {
  const norm = brandName.toLowerCase();
  if (norm === 'all') {
    return {
      avatarText: '✦',
      bgClass: 'bg-emerald-100 text-emerald-800',
      textClass: 'text-emerald-700',
    };
  }
  if (norm.includes('yogeshwari')) {
    return {
      logoUrl: '/YDO_logo.png',
      avatarText: 'YD',
      bgClass: 'bg-emerald-50 text-emerald-800',
      textClass: 'text-emerald-700',
    };
  }
  if (norm.includes('amul')) {
    return {
      avatarText: 'A',
      bgClass: 'bg-blue-600 text-white',
      textClass: 'text-blue-700',
    };
  }
  if (norm.includes('haldiram')) {
    return {
      avatarText: 'H',
      bgClass: 'bg-amber-600 text-white',
      textClass: 'text-amber-700',
    };
  }
  if (norm.includes('britannia')) {
    return {
      avatarText: 'B',
      bgClass: 'bg-red-600 text-white',
      textClass: 'text-red-700',
    };
  }
  if (norm.includes('cadbury')) {
    return {
      avatarText: 'C',
      bgClass: 'bg-purple-700 text-white',
      textClass: 'text-purple-700',
    };
  }
  if (norm.includes('gramilk')) {
    return {
      avatarText: 'G',
      bgClass: 'bg-teal-600 text-white',
      textClass: 'text-teal-700',
    };
  }
  if (norm.includes('tata')) {
    return {
      avatarText: 'T',
      bgClass: 'bg-sky-700 text-white',
      textClass: 'text-sky-700',
    };
  }
  return {
    avatarText: brandName.slice(0, 1).toUpperCase(),
    bgClass: 'bg-slate-700 text-white',
    textClass: 'text-slate-800',
  };
}
