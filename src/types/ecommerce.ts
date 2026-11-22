export interface Product {
  id: string;
  name: string;
  marathiName?: string;
  description: string;
  category: string;
  brand?: string;
  packSize: string;
  unit: string;
  mrp: number;
  price: number;
  discountPercentage?: number;
  imageUrl: string;
  inStock: boolean;
  stockQuantity: number;
  rating?: number;
  ratingCount?: number;
  isBestseller?: boolean;
  isFreshToday?: boolean;
  shelfLife?: string;
  fatContent?: string;
  storageInfo?: string;
  tags?: string[];
  mfgDate?: string;
  expiryDate?: string;
  batchNo?: string;
}

export interface Category {
  id: string;
  name: string;
  marathiName?: string;
  slug: string;
  count: number;
  icon: string;
  description?: string;
  imageUrl?: string;
}

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
}

export interface CartValidationItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  itemTotal: number;
  inStock: boolean;
  availableStock: number;
}

export interface CartValidationResult {
  valid: boolean;
  items: CartValidationItem[];
  subtotal: number;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  deliveryFeeWaived: boolean;
  amountNeededForFreeDelivery: number;
  total: number;
  message?: string;
}

export interface DeliveryAddress {
  id: string;
  label: 'Home' | 'Shop' | 'Work' | 'Other';
  name: string;
  phone: string;
  street: string;
  houseNo?: string;
  building?: string;
  area?: string;
  landmark?: string;
  city: string;
  state?: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  isConfirmedOnMap?: boolean;
  isDefault?: boolean;
  deliveryInstructions?: string;
}

export type PaymentMethod = 'cod' | 'upi_doorstep';

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export interface OrderItem {
  productId: string;
  name: string;
  packSize: string;
  price: number;
  quantity: number;
  itemTotal: number;
  imageUrl?: string;
}

export interface OrderTimelineStep {
  status: OrderStatus;
  label: string;
  timestamp: string;
  completed: boolean;
  current?: boolean;
  note?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: DeliveryAddress;
  paymentMethod: PaymentMethod;
  paymentStatus: 'pending' | 'paid';
  orderStatus: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  notes?: string;
  estimatedDeliveryMinutes: number;
  deliveryPartner?: {
    name: string;
    phone: string;
    vehicleNumber?: string;
  };
  timeline: OrderTimelineStep[];
}

export interface OrderPayload {
  customerName: string;
  customerPhone: string;
  deliveryAddress: {
    houseNo?: string;
    building?: string;
    street: string;
    area?: string;
    landmark?: string;
    city: string;
    state?: string;
    pincode: string;
    label?: string;
    latitude?: number;
    longitude?: number;
    isConfirmedOnMap?: boolean;
    deliveryInstructions?: string;
  };
  paymentMethod: PaymentMethod;
  notes?: string;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  idempotencyKey?: string;
}

export interface ProductFilterParams {
  category?: string;
  brand?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ProductResponse {
  success: boolean;
  data: Product[];
  total: number;
  page: number;
  totalPages: number;
}

export interface OrderResult {
  success: boolean;
  orderId: string;
  orderNumber: string;
  data: Order;
  message?: string;
}

export interface OrderSummary {
  id: string;
  orderNumber: string;
  createdAt: string;
  total: number;
  orderStatus: OrderStatus;
  itemCount: number;
  firstItemName: string;
}

export interface IEcommerceApiClient {
  getProducts(params?: ProductFilterParams): Promise<ProductResponse>;
  getProductById(id: string): Promise<Product>;
  getCategories(): Promise<Category[]>;
  validateCart(items: Array<{ productId: string; quantity: number }>): Promise<CartValidationResult>;
  placeOrder(orderPayload: OrderPayload): Promise<OrderResult>;
  getCustomerOrders(): Promise<OrderSummary[]>;
  getOrderById(orderId: string): Promise<Order>;
  cancelOrder(orderId: string, reason?: string): Promise<{ success: boolean; message: string }>;
}
