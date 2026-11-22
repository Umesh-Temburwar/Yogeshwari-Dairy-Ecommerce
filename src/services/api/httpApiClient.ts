import {
  CartValidationResult,
  Category,
  IEcommerceApiClient,
  Order,
  OrderPayload,
  OrderResult,
  OrderStatus,
  OrderSummary,
  Product,
  ProductFilterParams,
  ProductResponse,
} from '@/types/ecommerce';
import { supabase } from '@/services/supabase/client';
import { MockEcommerceApiClient } from './mockApiClient';
import {
  toCategoryList,
  getCategorySlugForProduct,
} from '@/constants/categories';

const FREE_DELIVERY_THRESHOLD =
  Number(import.meta.env.VITE_FREE_DELIVERY_THRESHOLD) || 300;
const STANDARD_DELIVERY_FEE =
  Number(import.meta.env.VITE_STANDARD_DELIVERY_FEE) || 30;

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

function sanitizeDbProduct(row: any): Product {
  const categoryStr = row.category || 'Dairy';
  const unitStr = row.unit || 'Piece';
  const packSizeStr = row.pack_size || unitStr;
  const sellingPrice = Number(row.selling_price) || 0;
  const stockQuantity = Number(row.stock_quantity) || 0;

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

export function mapDbStatusToFrontend(dbStatus?: string): OrderStatus {
  switch (dbStatus?.toUpperCase()) {
    case 'PLACED':
      return 'pending';
    case 'CONFIRMED':
      return 'confirmed';
    case 'PREPARING':
      return 'preparing';
    case 'OUT_FOR_DELIVERY':
      return 'out_for_delivery';
    case 'DELIVERED':
      return 'delivered';
    case 'CANCELLED':
    case 'REJECTED':
      return 'cancelled';
    default:
      return (dbStatus?.toLowerCase() as OrderStatus) || 'pending';
  }
}

export class HttpEcommerceApiClient implements IEcommerceApiClient {
  private baseUrl: string;
  private mockClient: MockEcommerceApiClient;
  private allowMockFallback: boolean;

  constructor(baseUrl?: string, allowMockFallback?: boolean) {
    const rawUrl =
      baseUrl ||
      import.meta.env.VITE_BACKEND_URL ||
      'https://yogeshwari-dairy-shop-inventory-system.onrender.com/api/v1/ecommerce';
    this.baseUrl = rawUrl.replace(/\/+$/, '');
    this.mockClient = new MockEcommerceApiClient();

    // In production (VITE_USE_MOCK_API=false), silent mock fallback is strictly forbidden
    const isMockEnv =
      import.meta.env.VITE_USE_MOCK_API !== undefined &&
      import.meta.env.VITE_USE_MOCK_API.trim().toLowerCase() === 'true';
    this.allowMockFallback = typeof allowMockFallback === 'boolean' ? allowMockFallback : isMockEnv;
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
    try {
      // Direct Supabase Live Stock Query:
      // STRICT REQUIREMENT: Only fetch products with active status and POSITIVE stock_quantity (> 0)
      const { data, error } = await supabase
        .from('products')
        .select(
          'id, name, category, pack_size, unit, selling_price, stock_quantity, image_url, description, is_active'
        )
        .eq('is_active', true)
        .gt('selling_price', 0)
        .gt('stock_quantity', 0)
        .order('stock_quantity', { ascending: false });

      if (!error && data && data.length > 0) {
        // Sanitize and strictly filter out-of-stock items (stock_quantity must be > 0)
        let sanitized = data
          .map(sanitizeDbProduct)
          .filter((p) => p.inStock && p.stockQuantity > 0);

        // Apply smart category filtering
        if (params?.category && params.category !== 'all') {
          sanitized = sanitized.filter(
            (p) => getCategorySlugForProduct(p.category, p.name) === params.category
          );
        }

        // Apply search filtering
        if (params?.search && params.search.trim()) {
          const q = params.search.trim().toLowerCase();
          sanitized = sanitized.filter(
            (p) =>
              p.name.toLowerCase().includes(q) ||
              (p.marathiName && p.marathiName.toLowerCase().includes(q)) ||
              p.category.toLowerCase().includes(q)
          );
        }

        return {
          success: true,
          data: sanitized,
          total: sanitized.length,
          page: 1,
          totalPages: 1,
        };
      }
    } catch (sbErr) {
      console.warn('Supabase product query error:', sbErr);
    }

    // Fallback (Only allowed if explicitly in Mock development mode)
    if (this.allowMockFallback) {
      const mockRes = await this.mockClient.getProducts(params);
      mockRes.data = mockRes.data.filter((p) => p.inStock && p.stockQuantity > 0);
      return mockRes;
    }

    throw new Error('Unable to load dairy catalogue. Please check your internet connection or try again shortly.');
  }

  async getProductById(id: string): Promise<Product> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(
          'id, name, category, pack_size, unit, selling_price, stock_quantity, image_url, description, is_active'
        )
        .eq('id', id)
        .gt('stock_quantity', 0)
        .single();

      if (!error && data) {
        return sanitizeDbProduct(data);
      }
    } catch {
      // Fall through
    }

    if (this.allowMockFallback) {
      return this.mockClient.getProductById(id);
    }

    throw new Error('Product not found or unavailable for online sale.');
  }

  async getCategories(): Promise<Category[]> {
    const baseCategories = toCategoryList();

    try {
      // Fetch live in-stock item counts directly from Supabase
      const { data, error } = await supabase
        .from('products')
        .select('category, name, stock_quantity')
        .eq('is_active', true)
        .gt('selling_price', 0)
        .gt('stock_quantity', 0);

      if (!error && data && data.length > 0) {
        const countMap: Record<string, number> = { all: data.length };
        data.forEach((p) => {
          const slug = getCategorySlugForProduct(p.category, p.name);
          countMap[slug] = (countMap[slug] || 0) + 1;
        });

        return baseCategories.map((cat) => ({
          ...cat,
          count: countMap[cat.slug] || 0,
        }));
      }
    } catch {
      // Fall through to base categories
    }

    return baseCategories;
  }

  async validateCart(
    items: Array<{ productId: string; quantity: number }>
  ): Promise<CartValidationResult> {
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

    if (this.allowMockFallback) {
      return this.mockClient.validateCart(items);
    }

    throw new Error('Unable to validate cart with live store inventory.');
  }

  async placeOrder(orderPayload: OrderPayload): Promise<OrderResult> {
    const idempotencyKey =
      orderPayload.idempotencyKey ||
      `ord_idem_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // 1. Try Render Backend
    try {
      const result = await this.request<OrderResult>('/orders', {
        method: 'POST',
        headers: {
          'x-idempotency-key': idempotencyKey,
        },
        body: JSON.stringify({
          ...orderPayload,
          idempotencyKey,
        }),
      });
      if (result && result.success && result.data) {
        return result;
      }
    } catch {
      // Fall through to Direct Supabase insertion
    }

    // 2. Direct Supabase Order Insertion (Atomic RPC or Table Insert)
    try {
      const validation = await this.validateCart(orderPayload.items);
      const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;
      const nowIso = new Date().toISOString();

      // Look up product packSizes / images for clean order lines
      const productIds = orderPayload.items.map((i) => i.productId);
      const { data: prods } = await supabase
        .from('products')
        .select('id, name, pack_size, unit, selling_price, image_url')
        .in('id', productIds);

      const itemsWithDetails = orderPayload.items.map((i) => {
        const p = prods?.find((item) => item.id === i.productId);
        const price = p ? Number(p.selling_price) || 0 : 0;
        return {
          productId: i.productId,
          name: p?.name || 'Fresh Dairy Item',
          packSize: p?.pack_size || p?.unit || 'Standard',
          price,
          quantity: i.quantity,
          itemTotal: price * i.quantity,
          imageUrl: p?.image_url,
        };
      });

      // Standard UUIDs for atomic database execution
      const orderId =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `a0eebc99-9c0b-4ef8-bb6d-${Date.now().toString(16).padStart(12, '0')}`;
      const idemUuid =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `b0eebc99-9c0b-4ef8-bb6d-${Date.now().toString(16).padStart(12, '0')}`;

      // 2A. Attempt Atomic RPC Function (FEFO & concurrency reservation)
      try {
        const rpcItems = itemsWithDetails.map((item) => ({
          product_id: item.productId,
          product_name: item.name,
          quantity: item.quantity,
          pack_size: item.packSize,
          unit: 'Piece',
          unit_price: item.price,
          mrp: item.price,
          total_price: item.itemTotal,
          image_url: item.imageUrl,
        }));

        const { data: rpcData, error: rpcErr } = await supabase.rpc(
          'fn_create_ecommerce_order_atomic',
          {
            p_cart_session_id: null,
            p_order_id: orderId,
            p_order_no: orderNumber,
            p_idempotency_key: idemUuid,
            p_customer_id: null,
            p_customer_name: orderPayload.customerName,
            p_customer_phone: orderPayload.customerPhone,
            p_customer_email: null,
            p_delivery_address: orderPayload.deliveryAddress,
            p_payment_method: orderPayload.paymentMethod === 'cod' ? 'COD' : 'ONLINE_UPI',
            p_payment_reference: null,
            p_subtotal: validation.subtotal,
            p_delivery_fee: validation.deliveryFee,
            p_discount_amount: 0,
            p_total_amount: validation.total,
            p_items: rpcItems,
          }
        );

        if (!rpcErr && rpcData && rpcData.success) {
          const clientOrder: Order = {
            id: rpcData.order_id || orderId,
            orderNumber: rpcData.order_no || orderNumber,
            createdAt: nowIso,
            customerName: orderPayload.customerName,
            customerPhone: orderPayload.customerPhone,
            deliveryAddress: {
              id: `addr_${Date.now()}`,
              label: (orderPayload.deliveryAddress.label as any) || 'Home',
              name: orderPayload.customerName,
              phone: orderPayload.customerPhone,
              houseNo: orderPayload.deliveryAddress.houseNo,
              building: orderPayload.deliveryAddress.building,
              street: orderPayload.deliveryAddress.street,
              area: orderPayload.deliveryAddress.area,
              landmark: orderPayload.deliveryAddress.landmark,
              city: orderPayload.deliveryAddress.city,
              state: orderPayload.deliveryAddress.state || 'Maharashtra',
              pincode: orderPayload.deliveryAddress.pincode,
              latitude: orderPayload.deliveryAddress.latitude,
              longitude: orderPayload.deliveryAddress.longitude,
              isConfirmedOnMap: orderPayload.deliveryAddress.isConfirmedOnMap,
              deliveryInstructions: orderPayload.deliveryAddress.deliveryInstructions,
            },
            paymentMethod: orderPayload.paymentMethod,
            paymentStatus: 'pending',
            orderStatus: 'pending',
            items: itemsWithDetails,
            subtotal: validation.subtotal,
            deliveryFee: validation.deliveryFee,
            total: validation.total,
            notes: orderPayload.notes,
            estimatedDeliveryMinutes: 25,
            deliveryPartner: {
              name: 'Nikhil Sakhare (Express Dairy Fleet)',
              phone: '+919876543210',
              vehicleNumber: 'MH-31-DY-1008',
            },
            timeline: this.buildTimelineForStatus('pending', nowIso),
          };

          const stored = this.getStoredOrders();
          this.saveStoredOrders([clientOrder, ...stored]);

          return {
            success: true,
            orderId: clientOrder.id,
            orderNumber: clientOrder.orderNumber,
            data: clientOrder,
            message: 'Your dairy order has been confirmed successfully via atomic FEFO reservation!',
          };
        } else if (rpcErr) {
          console.warn('Atomic RPC fn_create_ecommerce_order_atomic notice:', rpcErr.message);
          const rawMsg = rpcErr.message || '';
          if (rawMsg.includes('INSUFFICIENT_STOCK') || rawMsg.includes('INSUFFICIENT_BATCH_STOCK')) {
            const clean = rawMsg.replace(/^.*INSUFFICIENT_[A-Z_]*:\s*/, '');
            throw new Error(`Stock unavailable: ${clean}`);
          } else if (rawMsg.includes('not available for online purchase')) {
            throw new Error(rawMsg);
          }
        }
      } catch (rpcCallErr: any) {
        console.warn('Atomic RPC call exception:', rpcCallErr);
        if (rpcCallErr?.message && (rpcCallErr.message.includes('Stock unavailable') || rpcCallErr.message.includes('not available'))) {
          throw rpcCallErr;
        }
      }

      // 2B. Direct Table Insert Fallback (if RPC is undergoing migration)
      const { data: dbOrder, error: orderErr } = await supabase
        .from('ecommerce_orders')
        .insert({
          order_no: orderNumber,
          customer_name: orderPayload.customerName,
          customer_phone: orderPayload.customerPhone,
          delivery_address: orderPayload.deliveryAddress,
          order_status: 'PLACED',
          payment_method: orderPayload.paymentMethod === 'cod' ? 'COD' : 'ONLINE_UPI',
          payment_status: 'PENDING',
          subtotal: validation.subtotal,
          delivery_fee: validation.deliveryFee,
          total_amount: validation.total,
          delivery_notes: orderPayload.notes,
          estimated_delivery_time: '20-40 mins',
          delivery_latitude: orderPayload.deliveryAddress.latitude || null,
          delivery_longitude: orderPayload.deliveryAddress.longitude || null,
          full_address: [
            orderPayload.deliveryAddress.houseNo,
            orderPayload.deliveryAddress.building,
            orderPayload.deliveryAddress.street,
            orderPayload.deliveryAddress.area,
            orderPayload.deliveryAddress.city,
            orderPayload.deliveryAddress.pincode,
          ]
            .filter(Boolean)
            .join(', '),
          landmark: orderPayload.deliveryAddress.landmark || null,
          address_type: orderPayload.deliveryAddress.label || 'HOME',
          delivery_instructions: orderPayload.deliveryAddress.deliveryInstructions || orderPayload.notes || null,
        })
        .select()
        .single();

      if (!orderErr && dbOrder) {
        // Insert item lines into ecommerce_order_items
        if (itemsWithDetails.length > 0) {
          await supabase.from('ecommerce_order_items').insert(
            itemsWithDetails.map((item) => ({
              order_id: dbOrder.id,
              product_id: item.productId,
              product_name: item.name,
              pack_size: item.packSize,
              unit_price: item.price,
              quantity: item.quantity,
              total_price: item.itemTotal,
              image_url: item.imageUrl,
            }))
          );
        }

        const clientOrder: Order = {
          id: dbOrder.id,
          orderNumber: dbOrder.order_no,
          createdAt: dbOrder.created_at || nowIso,
          customerName: dbOrder.customer_name,
          customerPhone: dbOrder.customer_phone,
          deliveryAddress: {
            id: `addr_${Date.now()}`,
            label: (orderPayload.deliveryAddress.label as any) || 'Home',
            name: dbOrder.customer_name,
            phone: dbOrder.customer_phone,
            houseNo: orderPayload.deliveryAddress.houseNo,
            building: orderPayload.deliveryAddress.building,
            street: orderPayload.deliveryAddress.street,
            area: orderPayload.deliveryAddress.area,
            landmark: orderPayload.deliveryAddress.landmark,
            city: orderPayload.deliveryAddress.city,
            state: orderPayload.deliveryAddress.state || 'Maharashtra',
            pincode: orderPayload.deliveryAddress.pincode,
            latitude: orderPayload.deliveryAddress.latitude,
            longitude: orderPayload.deliveryAddress.longitude,
            isConfirmedOnMap: orderPayload.deliveryAddress.isConfirmedOnMap,
            deliveryInstructions: orderPayload.deliveryAddress.deliveryInstructions,
          },
          paymentMethod: orderPayload.paymentMethod,
          paymentStatus: 'pending',
          orderStatus: 'pending',
          items: itemsWithDetails,
          subtotal: validation.subtotal,
          deliveryFee: validation.deliveryFee,
          total: validation.total,
          notes: orderPayload.notes,
          estimatedDeliveryMinutes: 25,
          deliveryPartner: {
            name: 'Nikhil Sakhare (Express Dairy Fleet)',
            phone: '+919876543210',
            vehicleNumber: 'MH-31-DY-1008',
          },
          timeline: [
            {
              status: 'pending',
              label: 'Order Placed',
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              completed: true,
              current: true,
              note: 'We have received your order request.',
            },
            {
              status: 'confirmed',
              label: 'Dairy Confirmed',
              timestamp: 'ETA 5 mins',
              completed: false,
            },
            {
              status: 'preparing',
              label: 'Packing Fresh Items',
              timestamp: 'ETA 10 mins',
              completed: false,
            },
            {
              status: 'out_for_delivery',
              label: 'Out for Quick Delivery',
              timestamp: 'ETA 20 mins',
              completed: false,
            },
            {
              status: 'delivered',
              label: 'Delivered',
              timestamp: 'ETA 30 mins',
              completed: false,
            },
          ],
        };

        // Also save to local storage for instant offline viewing
        const stored = this.getStoredOrders();
        this.saveStoredOrders([clientOrder, ...stored]);

        return {
          success: true,
          orderId: clientOrder.id,
          orderNumber: clientOrder.orderNumber,
          data: clientOrder,
          message: 'Your dairy order has been confirmed successfully!',
        };
      } else if (orderErr) {
        console.warn('Supabase direct order creation rejected:', orderErr.message);
        if (!this.allowMockFallback) {
          throw new Error(
            `Order placement error: ${orderErr.message || 'Store database policy violation'}. Please call +91 9370869896 to complete your order.`
          );
        }
      }
    } catch (sbErr: any) {
      console.warn('Order placement attempt error:', sbErr);
      if (!this.allowMockFallback) {
        throw new Error(
          sbErr?.message ||
          'Unable to place order: Live store dispatch service is currently unavailable. Please contact Yogeshwari Dairy directly at +91 9370869896.'
        );
      }
    }

    // 3. Fallback (Only allowed in local mock development mode)
    if (this.allowMockFallback) {
      return this.mockClient.placeOrder({
        ...orderPayload,
        idempotencyKey,
      });
    }

    throw new Error('Store order service is currently offline. No payment was charged.');
  }

  async getCustomerOrders(): Promise<OrderSummary[]> {
    // 1. Try Render Backend
    try {
      const res = await this.request<{ success: boolean; data: OrderSummary[] }>('/orders');
      if (res.data) return res.data;
    } catch {
      // Fall through
    }

    // 2. Try Supabase
    try {
      const { data: dbOrders, error } = await supabase
        .from('ecommerce_orders')
        .select('id, order_no, created_at, total_amount, order_status')
        .order('created_at', { ascending: false })
        .limit(20);

      if (!error && dbOrders && dbOrders.length > 0) {
        return dbOrders.map((o) => ({
          id: o.id,
          orderNumber: o.order_no,
          createdAt: o.created_at,
          total: Number(o.total_amount) || 0,
          orderStatus: mapDbStatusToFrontend(o.order_status),
          itemCount: 1,
          firstItemName: 'Fresh Dairy Items',
        }));
      }
    } catch {
      // Fall through
    }

    // 3. Fallback to local storage (or mock in dev)
    const stored = this.getStoredOrders();
    if (stored.length > 0) {
      return stored.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        createdAt: o.createdAt,
        total: o.total,
        orderStatus: o.orderStatus,
        itemCount: o.items.length,
        firstItemName: o.items[0]?.name || 'Dairy Item',
      }));
    }

    if (this.allowMockFallback) {
      return this.mockClient.getCustomerOrders();
    }

    return [];
  }

  async getOrderById(orderId: string): Promise<Order> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId);

    // 1. Try Render Backend
    try {
      const res = await this.request<{ success: boolean; data: Order }>(
        `/orders/${orderId}`
      );
      if (res.data) return res.data;
    } catch {
      // Fall through
    }

    // 2. Try Direct Supabase Lookup (Safely query UUID or order_no without Postgres 22P02 crash)
    try {
      let query = supabase
        .from('ecommerce_orders')
        .select('*, items:ecommerce_order_items(*)');

      if (isUuid) {
        query = query.eq('id', orderId);
      } else {
        query = query.eq('order_no', orderId);
      }

      const { data: dbOrder, error } = await query.maybeSingle();

      if (!error && dbOrder) {
        const feStatus = mapDbStatusToFrontend(dbOrder.order_status);
        const addr = dbOrder.delivery_address || {};

        const mappedItems = Array.isArray(dbOrder.items)
          ? dbOrder.items.map((i: any) => ({
            productId: i.product_id || i.id,
            name: i.product_name || 'Dairy Item',
            packSize: i.pack_size || 'Standard',
            price: Number(i.unit_price) || 0,
            quantity: Number(i.quantity) || 1,
            itemTotal: Number(i.total_price) || 0,
            imageUrl: i.image_url,
          }))
          : [];

        const order: Order = {
          id: dbOrder.id,
          orderNumber: dbOrder.order_no,
          createdAt: dbOrder.created_at,
          customerName: dbOrder.customer_name,
          customerPhone: dbOrder.customer_phone,
          deliveryAddress: {
            id: `addr_${dbOrder.id}`,
            label: addr.label || 'Home',
            name: dbOrder.customer_name,
            phone: dbOrder.customer_phone,
            houseNo: addr.houseNo,
            building: addr.building,
            street: addr.street || addr.address_line1 || 'Main Road',
            area: addr.area,
            landmark: addr.landmark,
            city: addr.city || 'Ambajogai',
            state: addr.state || 'Maharashtra',
            pincode: addr.pincode || '431517',
            latitude: typeof addr.latitude === 'number' ? addr.latitude : undefined,
            longitude: typeof addr.longitude === 'number' ? addr.longitude : undefined,
            isConfirmedOnMap: Boolean(addr.isConfirmedOnMap || (addr.latitude && addr.longitude)),
            deliveryInstructions: addr.deliveryInstructions || addr.delivery_instructions,
          },
          paymentMethod: dbOrder.payment_method === 'ONLINE_UPI' ? 'upi_doorstep' : 'cod',
          paymentStatus: dbOrder.payment_status === 'PAID' ? 'paid' : 'pending',
          orderStatus: feStatus,
          items: mappedItems,
          subtotal: Number(dbOrder.subtotal) || Number(dbOrder.total_amount) || 0,
          deliveryFee: Number(dbOrder.delivery_fee) || 0,
          total: Number(dbOrder.total_amount) || 0,
          notes: dbOrder.delivery_notes,
          estimatedDeliveryMinutes: 25,
          deliveryPartner: {
            name: dbOrder.delivery_partner_name || 'Nikhil Sakhare (Express Dairy Fleet)',
            phone: dbOrder.delivery_partner_phone || '+919876543210',
            vehicleNumber: dbOrder.delivery_partner_vehicle || 'MH-31-DY-1008',
          },
          timeline: this.buildTimelineForStatus(feStatus, dbOrder.created_at),
        };

        // Update local cache so offline views stay synchronized
        this.updateLocalStoredOrderStatus(order.id, feStatus);
        this.updateLocalStoredOrderStatus(order.orderNumber, feStatus);

        return order;
      }
    } catch (sbErr) {
      console.warn('Supabase getOrderById error, using local storage:', sbErr);
    }

    // 3. Fallback to client-side stored order or mock
    const localMatch = this.getStoredOrders().find(
      (o) => o.id === orderId || o.orderNumber === orderId
    );
    if (localMatch) {
      return localMatch;
    }

    if (this.allowMockFallback) {
      return this.mockClient.getOrderById(orderId);
    }

    throw new Error(`Order #${orderId} not found.`);
  }

  async cancelOrder(
    orderId: string,
    reason?: string
  ): Promise<{ success: boolean; message: string }> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId);
    const finalReason = reason || 'Customer requested cancellation via app';

    // 1. Try Render Backend first
    try {
      const res = await this.request<{ success: boolean; message: string }>(
        `/orders/${orderId}/cancel`,
        {
          method: 'POST',
          body: JSON.stringify({ reason: finalReason }),
        }
      );
      if (res && res.success) {
        this.updateLocalStoredOrderStatus(orderId, 'cancelled');
        return res;
      }
    } catch {
      // Fall through to Direct Supabase atomic RPC
    }

    // 2. Direct Supabase Atomic RPC Cancellation
    try {
      let targetUuid = isUuid ? orderId : '';
      let targetOrderNo = isUuid ? '' : orderId;

      // If provided an order_no, lookup the corresponding UUID first
      if (!targetUuid) {
        const { data: found } = await supabase
          .from('ecommerce_orders')
          .select('id, order_no')
          .eq('order_no', orderId)
          .maybeSingle();

        if (found?.id) {
          targetUuid = found.id;
          targetOrderNo = found.order_no;
        }
      }

      if (targetUuid) {
        // Call the atomic function that actually restores FEFO inventory and updates status
        const { data: rpcRes, error: rpcErr } = await supabase.rpc(
          'fn_cancel_ecommerce_order_atomic',
          {
            p_order_id: targetUuid,
            p_cancellation_reason: finalReason,
            p_cancelled_by: 'Customer',
          }
        );

        if (!rpcErr && rpcRes && rpcRes.success) {
          this.updateLocalStoredOrderStatus(targetUuid, 'cancelled');
          if (targetOrderNo) {
            this.updateLocalStoredOrderStatus(targetOrderNo, 'cancelled');
          }
          return {
            success: true,
            message: rpcRes.message || 'Order cancelled successfully and stock restored.',
          };
        } else if (rpcErr) {
          console.warn('Supabase atomic cancel RPC notice:', rpcErr.message);
        }
      }
    } catch (sbCancelErr) {
      console.warn('Supabase atomic cancellation error:', sbCancelErr);
    }

    // Update in local storage
    this.updateLocalStoredOrderStatus(orderId, 'cancelled');

    if (this.allowMockFallback) {
      return this.mockClient.cancelOrder(orderId, reason);
    }

    throw new Error(
      'Unable to cancel order at this time. Please contact Yogeshwari Dairy store directly at +91 9370869896.'
    );
  }

  private buildTimelineForStatus(status: OrderStatus, createdAt: string) {
    const isPlaced = true;
    const isConfirmed = status !== 'pending';
    const isPreparing = status === 'preparing' || status === 'out_for_delivery' || status === 'delivered';
    const isOut = status === 'out_for_delivery' || status === 'delivered';
    const isDelivered = status === 'delivered';

    return [
      {
        status: 'pending' as OrderStatus,
        label: 'Order Placed',
        timestamp: new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        completed: isPlaced,
        current: status === 'pending',
      },
      {
        status: 'confirmed' as OrderStatus,
        label: 'Order Confirmed',
        timestamp: isConfirmed ? 'Confirmed' : 'ETA 5 mins',
        completed: isConfirmed,
        current: status === 'confirmed',
      },
      {
        status: 'preparing' as OrderStatus,
        label: 'Packing Fresh Dairy',
        timestamp: isPreparing ? 'Packed' : 'ETA 10 mins',
        completed: isPreparing,
        current: status === 'preparing',
      },
      {
        status: 'out_for_delivery' as OrderStatus,
        label: 'Out for Quick Delivery',
        timestamp: isOut ? 'On the way' : 'ETA 20 mins',
        completed: isOut,
        current: status === 'out_for_delivery',
      },
      {
        status: 'delivered' as OrderStatus,
        label: 'Delivered',
        timestamp: isDelivered ? 'Delivered' : 'ETA 30 mins',
        completed: isDelivered,
        current: status === 'delivered',
      },
    ];
  }

  private getStoredOrders(): Order[] {
    try {
      const raw = localStorage.getItem('yd_customer_orders_v1');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private saveStoredOrders(orders: Order[]): void {
    try {
      localStorage.setItem('yd_customer_orders_v1', JSON.stringify(orders));
    } catch (e) {
      console.error('Failed to save orders to localStorage', e);
    }
  }

  private updateLocalStoredOrderStatus(orderIdOrNo: string, newStatus: OrderStatus): void {
    try {
      const stored = this.getStoredOrders();
      const updated = stored.map((o) => {
        if (o.id === orderIdOrNo || o.orderNumber === orderIdOrNo) {
          return {
            ...o,
            orderStatus: newStatus,
            timeline: this.buildTimelineForStatus(newStatus, o.createdAt),
          };
        }
        return o;
      });
      this.saveStoredOrders(updated);
    } catch (e) {
      console.warn('Failed to update local stored order status:', e);
    }
  }
}
