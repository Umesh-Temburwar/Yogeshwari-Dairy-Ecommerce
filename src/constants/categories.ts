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
    defaultCount: 1436,
  },
  {
    id: 'milk',
    slug: 'milk',
    name: 'Fresh Milk & Cream',
    marathiName: 'ताजे दूध आणि मलई',
    icon: '🥛',
    imageUrl: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=300&q=80',
    description: 'Pure Cow & Buffalo Milk direct from local dairy farmers',
    defaultCount: 7,
  },
  {
    id: 'paneer-khoya',
    slug: 'paneer-khoya',
    name: 'Paneer & Butter',
    marathiName: 'पनीर आणि बटर',
    icon: '🧀',
    imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=300&q=80',
    description: 'Fresh soft malai paneer, butter blocks and mawa made daily',
    defaultCount: 30,
  },
  {
    id: 'dahi-chaas-lassi',
    slug: 'dahi-chaas-lassi',
    name: 'Curd, Chaas & Lassi',
    marathiName: 'दही, ताक आणि लस्सी',
    icon: '🥣',
    imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=300&q=80',
    description: 'Thick set curd, spiced roasted cumin chaas and refreshing lassi',
    defaultCount: 19,
  },
  {
    id: 'ghee-butter',
    slug: 'ghee-butter',
    name: 'Pure Desi Ghee',
    marathiName: 'शुद्ध देशी तूप',
    icon: '🧈',
    imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=300&q=80',
    description: 'A2 Vedic Bilona Ghee, danedaar cow & buffalo ghee jars',
    defaultCount: 12,
  },
  {
    id: 'sweets-shrikhand',
    slug: 'sweets-shrikhand',
    name: 'Sweets & Shrikhand',
    marathiName: 'मिठाई आणि श्रीखंड',
    icon: '🍯',
    imageUrl: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=300&q=80',
    description: 'Kesar Shrikhand, Amrakhand, Gulab Jamun, Rasgulla and Pedha',
    defaultCount: 37,
  },
  {
    id: 'bakery-essentials',
    slug: 'bakery-essentials',
    name: 'Biscuits & Bakery',
    marathiName: 'बिस्किट्स आणि बेकरी',
    icon: '🍪',
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=300&q=80',
    description: 'Parle-G, Good Day, Hide & Seek, toasts, rusks and bakery items',
    defaultCount: 827,
  },
  {
    id: 'beverages',
    slug: 'beverages',
    name: 'Cold Drinks & Soda',
    marathiName: 'पेये आणि कोल्ड्रिंक्स',
    icon: '🥤',
    imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=300&q=80',
    description: 'Campa Cola, Orange, Lemon, flavored milk and chilled beverages',
    defaultCount: 45,
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
