import { supabase } from '@/services/supabase/client';

export interface BrandItem {
  name: string;
  count: number;
}

export interface BrandRecord {
  id: string;
  name: string;
  logo_url?: string | null;
  display_order: number;
  is_active: boolean;
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
  'Suhana',
  'Ram Bandhu',
  'Temptin',
  'Sunfeast',
  'Dabur',
  'Patanjali',
];

/**
 * In-memory cache for dynamic brand logos fetched from Supabase brands table
 */
let brandLogosCache: Record<string, string> = {
  Yogeshwari: '/YDO_logo.png',
};

let isRealtimeSubscribed = false;

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
  if (/^suhana/i.test(trimmed)) return 'Suhana';
  if (/^ram\s*bandhu/i.test(trimmed)) return 'Ram Bandhu';
  if (/^temptin/i.test(trimmed)) return 'Temptin';
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

const COLOR_PALETTES = [
  { bgClass: 'bg-emerald-600 text-white', textClass: 'text-emerald-700' },
  { bgClass: 'bg-blue-600 text-white', textClass: 'text-blue-700' },
  { bgClass: 'bg-amber-600 text-white', textClass: 'text-amber-700' },
  { bgClass: 'bg-rose-600 text-white', textClass: 'text-rose-700' },
  { bgClass: 'bg-purple-600 text-white', textClass: 'text-purple-700' },
  { bgClass: 'bg-teal-600 text-white', textClass: 'text-teal-700' },
  { bgClass: 'bg-indigo-600 text-white', textClass: 'text-indigo-700' },
  { bgClass: 'bg-sky-600 text-white', textClass: 'text-sky-700' },
  { bgClass: 'bg-orange-600 text-white', textClass: 'text-orange-700' },
  { bgClass: 'bg-fuchsia-600 text-white', textClass: 'text-fuchsia-700' },
];

/**
 * Returns stable color palette based on brand name hash
 */
function getStableColorPalette(brandName: string) {
  let hash = 0;
  for (let i = 0; i < brandName.length; i++) {
    hash = (hash << 5) - hash + brandName.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % COLOR_PALETTES.length;
  return COLOR_PALETTES[index];
}

/**
 * Visual badge/avatar styling for each brand
 * Returns logoUrl if uploaded or configured, otherwise returns a colored initial tile
 */
export function getBrandVisual(brandName: string): BrandVisual {
  const norm = normalizeBrandName(brandName);
  const normLower = norm.toLowerCase();

  if (normLower === 'all' || normLower === '') {
    return {
      avatarText: '✦',
      bgClass: 'bg-emerald-100 text-emerald-800',
      textClass: 'text-emerald-700',
    };
  }

  // Check in-memory logo cache from Supabase
  const cachedLogo = brandLogosCache[norm] || brandLogosCache[brandName];
  if (cachedLogo) {
    return {
      logoUrl: cachedLogo,
      avatarText: norm.slice(0, 1).toUpperCase(),
      bgClass: 'bg-white text-slate-800',
      textClass: 'text-slate-900',
    };
  }

  // Specific fallbacks
  if (normLower.includes('yogeshwari')) {
    return {
      logoUrl: '/YDO_logo.png',
      avatarText: 'YD',
      bgClass: 'bg-emerald-50 text-emerald-800',
      textClass: 'text-emerald-700',
    };
  }

  const palette = getStableColorPalette(norm);
  return {
    avatarText: norm.slice(0, 1).toUpperCase() || 'B',
    bgClass: palette.bgClass,
    textClass: palette.textClass,
  };
}

/**
 * Fetches brand logos from Supabase brands table and sets up real-time subscription
 */
export async function initBrandLogos(): Promise<Record<string, string>> {
  try {
    const { data, error } = await supabase
      .from('brands')
      .select('name, logo_url')
      .eq('is_active', true);

    if (!error && Array.isArray(data)) {
      data.forEach((row) => {
        if (row.name && row.logo_url) {
          const norm = normalizeBrandName(row.name);
          brandLogosCache[norm] = row.logo_url;
          brandLogosCache[row.name] = row.logo_url;
        }
      });
    }

    // Set up Realtime listener once
    if (!isRealtimeSubscribed) {
      isRealtimeSubscribed = true;
      supabase
        .channel('public:brands')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'brands' },
          (payload) => {
            const row = (payload.new || payload.old) as any;
            if (row && row.name) {
              const norm = normalizeBrandName(row.name);
              if (payload.eventType === 'DELETE' || !row.is_active || !row.logo_url) {
                delete brandLogosCache[norm];
                delete brandLogosCache[row.name];
              } else {
                brandLogosCache[norm] = row.logo_url;
                brandLogosCache[row.name] = row.logo_url;
              }
            }
          }
        )
        .subscribe();
    }
  } catch {
    // Graceful offline fallback
  }

  return brandLogosCache;
}
