import { Category } from '@/types/ecommerce';

export interface CategoryMetadata {
  id: string;
  slug: string;
  name: string;
  marathiName: string;
  icon: string;
  imageUrl: string;
  description: string;
  defaultCount: number;
}

export const BLINKIT_CATEGORIES: CategoryMetadata[] = [
  {
    id: 'all',
    slug: 'all',
    name: 'All Items',
    marathiName: 'सर्व उत्पादने',
    icon: '🔥',
    imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=300&q=80',
    description: 'All fresh dairy, sweets & daily grocery essentials',
    defaultCount: 92,
  },
  {
    id: 'milk',
    slug: 'milk',
    name: 'Fresh Milk & Cream',
    marathiName: 'ताजे दूध आणि मलई',
    icon: '🥛',
    imageUrl: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=300&q=80',
    description: 'Pure Cow & Buffalo Milk direct from local dairy farmers',
    defaultCount: 9,
  },
  {
    id: 'paneer-khoya',
    slug: 'paneer-khoya',
    name: 'Paneer & Butter',
    marathiName: 'पनीर आणि बटर',
    icon: '🧀',
    imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=300&q=80',
    description: 'Fresh soft malai paneer, butter blocks and mawa made daily',
    defaultCount: 9,
  },
  {
    id: 'dahi-chaas-lassi',
    slug: 'dahi-chaas-lassi',
    name: 'Curd, Chaas & Lassi',
    marathiName: 'दही, ताक आणि लस्सी',
    icon: '🥣',
    imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=300&q=80',
    description: 'Thick set curd, spiced roasted cumin chaas and refreshing lassi',
    defaultCount: 2,
  },
  {
    id: 'ghee-butter',
    slug: 'ghee-butter',
    name: 'Pure Desi Ghee',
    marathiName: 'शुद्ध देशी तूप',
    icon: '🧈',
    imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=300&q=80',
    description: 'A2 Vedic Bilona Ghee, danedaar cow & buffalo ghee jars',
    defaultCount: 2,
  },
  {
    id: 'sweets-shrikhand',
    slug: 'sweets-shrikhand',
    name: 'Sweets & Shrikhand',
    marathiName: 'मिठाई आणि श्रीखंड',
    icon: '🍯',
    imageUrl: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=300&q=80',
    description: 'Kesar Shrikhand, Amrakhand, Gulab Jamun, Rasgulla and Pedha',
    defaultCount: 11,
  },
  {
    id: 'bakery-essentials',
    slug: 'bakery-essentials',
    name: 'Biscuits & Bakery',
    marathiName: 'बिस्किट्स आणि बेकरी',
    icon: '🍪',
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=300&q=80',
    description: 'Parle-G, Good Day, Hide & Seek, toasts, rusks and bakery items',
    defaultCount: 30,
  },
  {
    id: 'beverages',
    slug: 'beverages',
    name: 'Cold Drinks & Soda',
    marathiName: 'पेये आणि कोल्ड्रिंक्स',
    icon: '🥤',
    imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=300&q=80',
    description: 'Campa Cola, Orange, Lemon, flavored milk and chilled beverages',
    defaultCount: 6,
  },
  {
    id: 'groceries-fmcg',
    slug: 'groceries-fmcg',
    name: 'Cooking & Grocery',
    marathiName: 'मसाले आणि किराणा',
    icon: '🥫',
    imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=300&q=80',
    description: 'Cooking masalas, spices, sauces, instant noodles and kitchen staples',
    defaultCount: 27,
  },
];

export function getCategoryBySlug(slug: string): CategoryMetadata | undefined {
  return BLINKIT_CATEGORIES.find((c) => c.slug === slug);
}

export function toCategoryList(): Category[] {
  return BLINKIT_CATEGORIES.map((c) => ({
    id: c.id,
    name: c.name,
    marathiName: c.marathiName,
    slug: c.slug,
    count: c.defaultCount,
    icon: c.icon,
    imageUrl: c.imageUrl,
    description: c.description,
  }));
}

/**
 * Smart categorization function that accurately maps raw product names & categories
 * to the proper user-facing category slug.
 */
export function getCategorySlugForProduct(categoryName?: string, productName?: string): string {
  const c = (categoryName || '').toLowerCase();
  const n = (productName || '').toLowerCase();

  // 1. Fresh Milk
  if (n.includes('milk') || n.includes('doodh') || c === 'milk') return 'milk';

  // 2. Curd & Chaas
  if (
    n.includes('curd') ||
    n.includes('dahi') ||
    n.includes('chaas') ||
    n.includes('lassi') ||
    c.includes('curd')
  ) {
    return 'dahi-chaas-lassi';
  }

  // 3. Desi Ghee
  if (n.includes('ghee') || n.includes('toop') || c === 'ghee') return 'ghee-butter';

  // 4. Paneer, Khoya, Butter & Cheese
  if (
    n.includes('paneer') ||
    n.includes('butter') ||
    n.includes('cheese') ||
    n.includes('khoya') ||
    n.includes('mawa') ||
    c.includes('paneer')
  ) {
    return 'paneer-khoya';
  }

  // 5. Cold Drinks & Beverages
  if (
    n.includes('campa') ||
    n.includes('cola') ||
    n.includes('sprite') ||
    n.includes('coffee') ||
    n.includes('tea') ||
    (n.includes('chai') && !n.includes('milk')) ||
    c.includes('beverage')
  ) {
    return 'beverages';
  }

  // 6. Biscuits, Bakery & Rusk
  if (
    n.includes('biscuit') ||
    n.includes('parle') ||
    n.includes('parale') ||
    n.includes('rusk') ||
    n.includes('oreo') ||
    n.includes('hide & seek') ||
    n.includes('bourbon') ||
    n.includes('cookies') ||
    n.includes('toast') ||
    n.includes('cake') ||
    n.includes('cack') ||
    n.includes('bread') ||
    n.includes('pav') ||
    n.includes('krackjack') ||
    n.includes('monaco') ||
    n.includes('good day') ||
    n.includes('jimjam') ||
    n.includes('shorts') ||
    n.includes('fab') ||
    n.includes('unibic')
  ) {
    return 'bakery-essentials';
  }

  // 7. Sweets, Mithai & Shrikhand
  if (
    n.includes('shrikhand') ||
    n.includes('jamun') ||
    n.includes('rasgulla') ||
    n.includes('sonpapdi') ||
    n.includes('chikki') ||
    n.includes('sweet') ||
    n.includes('mithai') ||
    n.includes('laddu') ||
    n.includes('petha') ||
    n.includes('chocominis') ||
    n.includes('patanjali') ||
    c.includes('sweet')
  ) {
    return 'sweets-shrikhand';
  }

  // 8. Cooking & Grocery Essentials
  if (
    n.includes('masala') ||
    n.includes('sauce') ||
    n.includes('mix') ||
    n.includes('pickle') ||
    n.includes('ketchup') ||
    n.includes('schezwan') ||
    n.includes('sambar') ||
    n.includes('sev') ||
    n.includes('mixture') ||
    n.includes('bhujia') ||
    n.includes('dal') ||
    n.includes('noodle') ||
    n.includes('maggi') ||
    n.includes('temptin') ||
    n.includes('rambandhu') ||
    n.includes('suhana') ||
    n.includes('chitale') ||
    c.includes('fmcg') ||
    c.includes('grocery')
  ) {
    return 'groceries-fmcg';
  }

  return 'bakery-essentials';
}
