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
import { MOCK_CATEGORIES, MOCK_PRODUCTS } from './mockData';

const STORAGE_ORDERS_KEY = 'yd_customer_orders_v1';
const FREE_DELIVERY_THRESHOLD =
  Number(import.meta.env.VITE_FREE_DELIVERY_THRESHOLD) || 300;
const STANDARD_DELIVERY_FEE =
  Number(import.meta.env.VITE_STANDARD_DELIVERY_FEE) || 30;

// Simulate slight network delay for realistic quick-commerce feel
const delay = (ms: number = 180) => new Promise((resolve) => setTimeout(resolve, ms));

function getStoredOrders(): Order[] {
  try {
    const raw = localStorage.getItem(STORAGE_ORDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredOrders(orders: Order[]): void {
  try {
    localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(orders));
  } catch (e) {
    console.error('Failed to save orders to localStorage', e);
  }
}

export class MockEcommerceApiClient implements IEcommerceApiClient {
  async getProducts(params?: ProductFilterParams): Promise<ProductResponse> {
    await delay(120);

    let filtered = [...MOCK_PRODUCTS];

    if (params?.category && params.category !== 'all') {
      filtered = filtered.filter((p) => p.category === params.category);
    }

    if (params?.search && params.search.trim().length > 0) {
      const q = params.search.toLowerCase().trim();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.marathiName && p.marathiName.toLowerCase().includes(q)) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    const page = params?.page || 1;
    const limit = params?.limit || 50;
    const startIndex = (page - 1) * limit;
    const paginated = filtered.slice(startIndex, startIndex + limit);

    return {
      success: true,
      data: paginated,
      total: filtered.length,
      page,
      totalPages: Math.ceil(filtered.length / limit),
    };
  }

  async getProductById(id: string): Promise<Product> {
    await delay(100);
    const item = MOCK_PRODUCTS.find((p) => p.id === id);
    if (!item) {
      throw new Error(`Product not found: ${id}`);
    }
    return item;
  }

  async getCategories(): Promise<Category[]> {
    await delay(80);
    return MOCK_CATEGORIES;
  }

  async validateCart(
    items: Array<{ productId: string; quantity: number }>
  ): Promise<CartValidationResult> {
    await delay(150);

    let subtotal = 0;
    const validatedItems = items.map((cartItem) => {
      const product = MOCK_PRODUCTS.find((p) => p.id === cartItem.productId);
      if (!product) {
        throw new Error(`Product with ID ${cartItem.productId} not found`);
      }
      const itemTotal = product.price * cartItem.quantity;
      subtotal += itemTotal;

      return {
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: cartItem.quantity,
        itemTotal,
        inStock: product.inStock && product.stockQuantity >= cartItem.quantity,
        availableStock: product.stockQuantity,
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

  async placeOrder(orderPayload: OrderPayload): Promise<OrderResult> {
    await delay(250);

    const validation = await this.validateCart(orderPayload.items);
    if (!validation.valid) {
      throw new Error('Some items in your cart are currently out of stock or unavailable.');
    }

    const orderNumber = `YD-${Date.now().toString().slice(-6)}`;
    const orderId = `ord_${Math.random().toString(36).substring(2, 11)}`;
    const nowIso = new Date().toISOString();

    const orderItems = orderPayload.items.map((i) => {
      const p = MOCK_PRODUCTS.find((prod) => prod.id === i.productId)!;
      return {
        productId: p.id,
        name: p.name,
        packSize: p.packSize,
        price: p.price,
        quantity: i.quantity,
        itemTotal: p.price * i.quantity,
        imageUrl: p.imageUrl,
      };
    });

    const newOrder: Order = {
      id: orderId,
      orderNumber,
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
      orderStatus: 'confirmed',
      items: orderItems,
      subtotal: validation.subtotal,
      deliveryFee: validation.deliveryFee,
      total: validation.total,
      notes: orderPayload.notes,
      estimatedDeliveryMinutes: 15,
      deliveryPartner: {
        name: 'Sunil Rao (Express Dairy Fleet)',
        phone: '+9370869896',
        vehicleNumber: 'MH-31-DY-1008',
      },
      timeline: [
        {
          status: 'pending',
          label: 'Order Placed',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          completed: true,
          note: 'We have received your order request.',
        },
        {
          status: 'confirmed',
          label: 'Dairy Confirmed',
          timestamp: new Date(Date.now() + 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          completed: true,
          current: true,
          note: 'Yogeshwari Dairy staff confirmed the order.',
        },
        {
          status: 'preparing',
          label: 'Packing Fresh Items',
          timestamp: 'ETA 5 mins',
          completed: false,
          note: 'Fresh milk & dairy packed in insulated cool bags.',
        },
        {
          status: 'out_for_delivery',
          label: 'Out for Quick Delivery',
          timestamp: 'ETA 10 mins',
          completed: false,
          note: 'Rider on the way to your doorstep.',
        },
        {
          status: 'delivered',
          label: 'Delivered',
          timestamp: 'ETA 15 mins',
          completed: false,
        },
      ],
    };

    const existing = getStoredOrders();
    saveStoredOrders([newOrder, ...existing]);

    return {
      success: true,
      orderId: newOrder.id,
      orderNumber: newOrder.orderNumber,
      data: newOrder,
      message: 'Your dairy order has been confirmed successfully!',
    };
  }

  async getCustomerOrders(): Promise<OrderSummary[]> {
    await delay(120);
    const orders = getStoredOrders();
    return orders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      createdAt: o.createdAt,
      total: o.total,
      orderStatus: o.orderStatus,
      itemCount: o.items.reduce((acc, i) => acc + i.quantity, 0),
      firstItemName: o.items[0]?.name || 'Dairy items',
    }));
  }

  async getOrderById(orderId: string): Promise<Order> {
    await delay(100);
    const orders = getStoredOrders();
    const found = orders.find((o) => o.id === orderId || o.orderNumber === orderId);
    if (!found) {
      throw new Error(`Order ${orderId} not found`);
    }

    // Advance timeline dynamically if time passed for realism
    const minutesSinceCreation = (Date.now() - new Date(found.createdAt).getTime()) / (1000 * 60);
    let updatedStatus: OrderStatus = found.orderStatus;
    if (found.orderStatus !== 'cancelled') {
      if (minutesSinceCreation > 12) {
        updatedStatus = 'delivered';
      } else if (minutesSinceCreation > 6) {
        updatedStatus = 'out_for_delivery';
      } else if (minutesSinceCreation > 2) {
        updatedStatus = 'preparing';
      } else {
        updatedStatus = 'confirmed';
      }
    }

    if (updatedStatus !== found.orderStatus) {
      found.orderStatus = updatedStatus;
      saveStoredOrders(orders);
    }

    return found;
  }

  async cancelOrder(orderId: string, reason?: string): Promise<{ success: boolean; message: string }> {
    await delay(150);
    const orders = getStoredOrders();
    const idx = orders.findIndex((o) => o.id === orderId || o.orderNumber === orderId);
    if (idx === -1) {
      throw new Error(`Order ${orderId} not found`);
    }

    if (orders[idx].orderStatus === 'delivered' || orders[idx].orderStatus === 'out_for_delivery') {
      throw new Error('Order cannot be cancelled as it is already out for delivery or delivered.');
    }

    orders[idx].orderStatus = 'cancelled';
    if (reason) {
      orders[idx].notes = `Cancelled: ${reason}`;
    }
    saveStoredOrders(orders);

    return {
      success: true,
      message: 'Order cancelled successfully. Stock has been restored.',
    };
  }
}
