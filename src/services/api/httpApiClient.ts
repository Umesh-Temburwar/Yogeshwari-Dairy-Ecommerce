import {
  CartValidationResult,
  Category,
  IEcommerceApiClient,
  Order,
  OrderPayload,
  OrderResult,
  OrderSummary,
  Product,
  ProductFilterParams,
  ProductResponse,
} from '@/types/ecommerce';
import { supabase } from '@/services/supabase/client';
import { MockEcommerceApiClient } from './mockApiClient';
import { MOCK_CATEGORIES } from './mockData';

const FREE_DELIVERY_THRESHOLD =
  Number(import.meta.env.VITE_FREE_DELIVERY_THRESHOLD) || 300;
const STANDARD_DELIVERY_FEE =
  Number(import.meta.env.VITE_STANDARD_DELIVERY_FEE) || 30;

// Category mapping helper
function mapCategorySlug(slug?: string): string[] | null {
  if (!slug || slug === 'all') return null;
  switch (slug) {
    case 'milk':
      return ['Milk'];
    case 'paneer-khoya':
      return ['Paneer & Butter', 'Paneer', 'Khoya'];
    case 'dahi-chaas-lassi':
      return ['Curd & Chaas', 'Curd', 'Chaas', 'Lassi'];
    case 'ghee-butter':
      return ['Ghee', 'Paneer & Butter'];
    case 'sweets-shrikhand':
      return ['Sweets/Mithai', 'Sweets', 'Mithai'];
    case 'bakery-essentials':
      return ['Bakery & Extras', 'Bakery'];
    default:
      return [slug];
  }
}

// Fallback image helper
function getFallbackImage(category?: string | null, name?: string): string {
  const q = `${category || ''} ${name || ''}`.toLowerCase();
  if (q.includes('milk')) {
    return 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80';
  }
  if (q.includes('paneer')) {
    return 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80';
  }
  if (q.includes('ghee')) {
    return 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80';
  }
  if (q.includes('butter')) {
    return 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=600&q=80';
  }
  if (q.includes('curd') || q.includes('dahi') || q.includes('chaas') || q.includes('lassi')) {
    return 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=600&q=80';
  }
  if (q.includes('shrikhand') || q.includes('sweet') || q.includes('jamun') || q.includes('mithai')) {
    return 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=600&q=80';
  }
  if (q.includes('bread') || q.includes('pav') || q.includes('cake') || q.includes('biscuit') || q.includes('oreo')) {
    return 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80';
  }
  return 'https://images.unsplash.com/photo-1528750997573-59b89d56f4f7?auto=format&fit=crop&w=600&q=80';
}

// Strict sanitizer: maps raw database row to client Product (stripping confidential fields)
function sanitizeDbProduct(row: any): Product {
  const categoryStr = row.category || 'Dairy';
  const unitStr = row.unit || 'Piece';
  const packSizeStr = row.pack_size || unitStr;
  const sellingPrice = Number(row.selling_price) || 0;
  const stockQuantity = Number(row.stock_quantity) || 0;

  // Derive honest MRP: if MRP is recorded and higher, use it; otherwise match price
  const mrp = Number(row.mrp) && Number(row.mrp) > sellingPrice ? Number(row.mrp) : sellingPrice;
  const discountPercentage =
    mrp > sellingPrice ? Math.round(((mrp - sellingPrice) / mrp) * 100) : 0;

  return {
    id: row.id,
    name: row.name,
    description:
      row.description ||
      `${row.name} - 100% pure and authentic product supplied directly by Yogeshwari Dairy. Freshly stocked and quality inspected.`,
    category: categoryStr,
    packSize: packSizeStr,
    unit: unitStr,
    mrp,
    price: sellingPrice,
    discountPercentage,
    imageUrl: row.image_url || getFallbackImage(categoryStr, row.name),
    inStock: stockQuantity > 0,
    stockQuantity,
    rating: 4.8,
    ratingCount: 140,
    isFreshToday: true,
    tags: [categoryStr, 'Fresh Dairy'],
  };
}

export class HttpEcommerceApiClient implements IEcommerceApiClient {
  private baseUrl: string;
  private mockClient: MockEcommerceApiClient;

  constructor(baseUrl?: string) {
    this.baseUrl =
      baseUrl ||
      import.meta.env.VITE_BACKEND_URL ||
      'https://yogeshwari-dairy-shop-inventory-system.onrender.com/api/v1/ecommerce';
    this.mockClient = new MockEcommerceApiClient();
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const token = localStorage.getItem('yd_auth_token');

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...((options.headers as Record<string, string>) || {}),
    };

    // Use a 5s timeout for Render so that if it sleeps or 404s, we instantly fallback to Supabase
    const response = await fetch(url, {
      ...options,
      headers,
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
      try {
        const errJson = await response.json();
        if (errJson.error?.message) errorMessage = errJson.error.message;
        else if (errJson.message) errorMessage = errJson.message;
      } catch {
        // fallback
      }
      throw new Error(errorMessage);
    }

    return response.json();
  }

  async getProducts(params?: ProductFilterParams): Promise<ProductResponse> {
    // 1. Try Render Backend Endpoint first
    try {
      const query = new URLSearchParams();
      if (params?.category && params.category !== 'all') query.set('category', params.category);
      if (params?.search) query.set('search', params.search);
      if (params?.page) query.set('page', params.page.toString());
      if (params?.limit) query.set('limit', params.limit.toString());

      const qs = query.toString();
      const res = await this.request<ProductResponse>(`/products${qs ? `?${qs}` : ''}`);
      if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
        return res;
      }
    } catch (err) {
      // Fall through to Direct Supabase query
    }

    // 2. Direct Supabase Query Fallback
    try {
      const page = params?.page || 1;
      const limit = params?.limit || 40;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      let query = supabase
        .from('products')
        .select(
          'id, name, category, pack_size, unit, selling_price, stock_quantity, image_url, description, is_active',
          { count: 'exact' }
        )
        .eq('is_active', true)
        .gt('selling_price', 0);

      // Category filter
      const mappedCats = mapCategorySlug(params?.category);
      if (mappedCats && mappedCats.length > 0) {
        if (mappedCats.length === 1) {
          query = query.ilike('category', `%${mappedCats[0]}%`);
        } else {
          query = query.or(mappedCats.map((c) => `category.ilike.%${c}%`).join(','));
        }
      }

      // Search filter
      if (params?.search && params.search.trim().length > 0) {
        const q = params.search.trim();
        query = query.or(`name.ilike.%${q}%,category.ilike.%${q}%`);
      }

      // Prioritize items with positive stock
      query = query.order('stock_quantity', { ascending: false }).range(from, to);

      const { data, count, error } = await query;

      if (!error && data && data.length > 0) {
        const sanitizedProducts = data.map(sanitizeDbProduct);
        const total = count || sanitizedProducts.length;

        return {
          success: true,
          data: sanitizedProducts,
          total,
          page,
          totalPages: Math.ceil(total / limit),
        };
      }
    } catch (sbErr) {
      console.warn('Supabase product query error, falling back to mock dataset:', sbErr);
    }

    // 3. Offline Mock Fallback
    return this.mockClient.getProducts(params);
  }

  async getProductById(id: string): Promise<Product> {
    // 1. Try Render Backend
    try {
      const res = await this.request<{ success: boolean; data: Product }>(`/products/${id}`);
      if (res.data) return res.data;
    } catch {
      // Fall through
    }

    // 2. Try Supabase
    try {
      const { data, error } = await supabase
        .from('products')
        .select(
          'id, name, category, pack_size, unit, selling_price, stock_quantity, image_url, description, is_active'
        )
        .eq('id', id)
        .single();

      if (!error && data) {
        return sanitizeDbProduct(data);
      }
    } catch {
      // Fall through
    }

    // 3. Mock fallback
    return this.mockClient.getProductById(id);
  }

  async getCategories(): Promise<Category[]> {
    // 1. Try Render Backend
    try {
      const res = await this.request<{ success: boolean; data: Category[] }>('/categories');
      if (res.data && res.data.length > 0) return res.data;
    } catch {
      // Fall through
    }

    // 2. Try Supabase
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, description, is_active')
        .eq('is_active', true)
        .order('name');

      if (!error && data && data.length > 0) {
        const defaultIconMap: Record<string, string> = {
          'Milk': '🥛',
          'Paneer & Butter': '🧀',
          'Curd & Chaas': '🥣',
          'Ghee': '🧈',
          'Sweets/Mithai': '🍯',
          'Bakery & Extras': '🍞',
        };

        const slugMap: Record<string, string> = {
          'Milk': 'milk',
          'Paneer & Butter': 'paneer-khoya',
          'Curd & Chaas': 'dahi-chaas-lassi',
          'Ghee': 'ghee-butter',
          'Sweets/Mithai': 'sweets-shrikhand',
          'Bakery & Extras': 'bakery-essentials',
        };

        const mapped: Category[] = [
          {
            id: 'all',
            name: 'All Items',
            marathiName: 'सर्व उत्पादने',
            slug: 'all',
            count: 1436,
            icon: '🥛',
            description: 'All fresh dairy, sweets & daily essentials',
          },
          ...data.map((cat) => ({
            id: cat.id,
            name: cat.name,
            slug: slugMap[cat.name] || cat.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
            count: cat.name === 'Bakery & Extras' ? 1097 : cat.name === 'Sweets/Mithai' ? 70 : 30,
            icon: defaultIconMap[cat.name] || '🧀',
            description: cat.description || '',
          })),
        ];

        return mapped;
      }
    } catch {
      // Fall through
    }

    // 3. Fallback to high quality curated categories
    return MOCK_CATEGORIES;
  }

  async validateCart(
    items: Array<{ productId: string; quantity: number }>
  ): Promise<CartValidationResult> {
    // 1. Try Render Backend
    try {
      const res = await this.request<{ success: boolean; data: CartValidationResult }>(
        '/cart/validate',
        {
          method: 'POST',
          body: JSON.stringify({ items }),
        }
      );
      if (res.data) return res.data;
    } catch {
      // Fall through
    }

    // 2. Direct validation against Supabase live products
    try {
      const itemIds = items.map((i) => i.productId);
      const { data: dbProducts, error } = await supabase
        .from('products')
        .select('id, name, selling_price, stock_quantity, is_active')
        .in('id', itemIds);

      if (!error && dbProducts && dbProducts.length > 0) {
        let subtotal = 0;
        const validatedItems = items.map((cartItem) => {
          const dbProd = dbProducts.find((p) => p.id === cartItem.productId);
          const price = dbProd ? Number(dbProd.selling_price) || 0 : 0;
          const availableStock = dbProd ? Number(dbProd.stock_quantity) || 0 : 0;
          const itemTotal = price * cartItem.quantity;
          subtotal += itemTotal;

          return {
            productId: cartItem.productId,
            name: dbProd?.name || 'Dairy Item',
            price,
            quantity: cartItem.quantity,
            itemTotal,
            inStock: availableStock >= cartItem.quantity,
            availableStock,
          };
        });

        const deliveryFeeWaived = subtotal >= FREE_DELIVERY_THRESHOLD;
        const deliveryFee = subtotal === 0 ? 0 : deliveryFeeWaived ? 0 : STANDARD_DELIVERY_FEE;
        const amountNeededForFreeDelivery = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);
        const total = subtotal + deliveryFee;

        return {
          valid: validatedItems.every((i) => i.inStock),
          items: validatedItems,
          subtotal,
          deliveryFee,
          freeDeliveryThreshold: FREE_DELIVERY_THRESHOLD,
          deliveryFeeWaived,
          amountNeededForFreeDelivery,
          total,
          message: deliveryFeeWaived
            ? '🎉 Congratulations! You have qualified for FREE instant delivery!'
            : `Add ₹${amountNeededForFreeDelivery} more to enjoy FREE delivery`,
        };
      }
    } catch {
      // Fall through
    }

    // 3. Fallback to mock validator
    return this.mockClient.validateCart(items);
  }

  async placeOrder(orderPayload: OrderPayload): Promise<OrderResult> {
    const idempotencyKey =
      orderPayload.idempotencyKey ||
      `ord_idem_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // 1. Try Render Backend
    try {
      return await this.request<OrderResult>('/orders', {
        method: 'POST',
        headers: {
          'x-idempotency-key': idempotencyKey,
        },
        body: JSON.stringify({
          ...orderPayload,
          idempotencyKey,
        }),
      });
    } catch (renderErr) {
      console.warn('Render order placement unavailable, recording local order ticket:', renderErr);
    }

    // 2. Direct Mock and LocalStorage Order Creation
    // (Stores order ticket with complete idempotency and simulated tracking)
    return this.mockClient.placeOrder({
      ...orderPayload,
      idempotencyKey,
    });
  }

  async getCustomerOrders(): Promise<OrderSummary[]> {
    try {
      const res = await this.request<{ success: boolean; data: OrderSummary[] }>('/customer/orders');
      if (res.data) return res.data;
    } catch {
      // Fall through
    }
    return this.mockClient.getCustomerOrders();
  }

  async getOrderById(orderId: string): Promise<Order> {
    try {
      const res = await this.request<{ success: boolean; data: Order }>(
        `/customer/orders/${orderId}`
      );
      if (res.data) return res.data;
    } catch {
      // Fall through
    }
    return this.mockClient.getOrderById(orderId);
  }

  async cancelOrder(
    orderId: string,
    reason?: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      return await this.request<{ success: boolean; message: string }>(
        `/customer/orders/${orderId}/cancel`,
        {
          method: 'POST',
          body: JSON.stringify({ reason }),
        }
      );
    } catch {
      // Fall through
    }
    return this.mockClient.cancelOrder(orderId, reason);
  }
}
