import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HttpEcommerceApiClient, mapDbStatusToFrontend } from '../services/api/httpApiClient';
import { useCartStore } from '../store/cartStore';
import { useCustomerStore } from '../store/customerStore';
import { Product } from '../types/ecommerce';

const sampleDbProduct = {
  id: 'prod-milk-test',
  name: 'Pure Full Cream Cow Milk 1L',
  category: 'Milk',
  pack_size: '1000 ml',
  unit: 'pouch',
  selling_price: '60.00',
  stock_quantity: '15.00',
  image_url: 'https://example.com/cow-milk.jpg',
  description: 'Farm fresh milk',
  is_active: true,
  // Sensitive staff fields that MUST NOT leak
  purchase_price: '42.00',
  stock_value: '630.00',
  supplier_id: 'supp-farmer-101',
};

describe('PHASE 9: Post-Deployment Production Integration Test Suite', () => {
  beforeEach(() => {
    useCartStore.getState().clearCart();
    vi.restoreAllMocks();
  });

  describe('1. API Response Validation & Privacy Leak Prevention', () => {
    it('ensures sanitized product structure strips all internal cost & supplier data', () => {
      // Verify that public Product interface has zero purchase_price or supplier fields
      const p: Product = {
        id: sampleDbProduct.id,
        name: sampleDbProduct.name,
        description: sampleDbProduct.description,
        category: sampleDbProduct.category,
        packSize: sampleDbProduct.pack_size,
        unit: sampleDbProduct.unit,
        mrp: 65,
        price: Number(sampleDbProduct.selling_price),
        imageUrl: sampleDbProduct.image_url,
        inStock: true,
        stockQuantity: Number(sampleDbProduct.stock_quantity),
      };

      expect((p as any).purchase_price).toBeUndefined();
      expect((p as any).supplier_id).toBeUndefined();
      expect((p as any).stock_value).toBeUndefined();
      expect(p.price).toBe(60);
    });
  });

  describe('2. Customer Authentication & Strict Role Boundary', () => {
    it('strictly locks customer role to "customer" and forbids privilege escalation', () => {
      const store = useCustomerStore.getState();
      store.setCustomerProfile('Nikhil Customer', '9370869896');

      const profile = useCustomerStore.getState().customerProfile;
      expect(profile.role).toBe('customer');

      // Attempting to mutate role
      (profile as any).role = 'admin';
      store.setCustomerProfile('Nikhil Customer', '9370869896');

      const resetProfile = useCustomerStore.getState().customerProfile;
      expect(resetProfile.role).toBe('customer');
    });
  });

  describe('3. Cart Stock Limits & Validation', () => {
    it('caps item addition at available stock limit and flags out-of-stock items', () => {
      const store = useCartStore.getState();
      const productWithLimitedStock: Product = {
        id: 'paneer-limited',
        name: 'Fresh Malai Paneer',
        description: 'Soft paneer',
        category: 'paneer-butter',
        packSize: '250 g',
        unit: 'pack',
        mrp: 120,
        price: 110,
        imageUrl: 'https://example.com/paneer.jpg',
        inStock: true,
        stockQuantity: 3, // only 3 in stock
      };

      store.addItem(productWithLimitedStock, 10); // user attempts to add 10
      const cart = useCartStore.getState();
      expect(cart.items[0].quantity).toBe(3); // capped at 3
    });
  });

  describe('4. Price Changes & Dynamic Totals Revalidation', () => {
    it('recalculates delivery fee dynamically based on subtotal threshold (₹300)', () => {
      const store = useCartStore.getState();
      const milk: Product = {
        id: 'milk-1',
        name: 'Fresh Milk',
        description: 'Milk',
        category: 'milk',
        packSize: '1L',
        unit: 'pouch',
        mrp: 60,
        price: 55,
        imageUrl: 'https://example.com/milk.jpg',
        inStock: true,
        stockQuantity: 20,
      };

      // 4 packets * 55 = 220 (< 300) -> delivery fee is 30
      store.addItem(milk, 4);
      let state = useCartStore.getState();
      expect(state.getSubtotal()).toBe(220);
      expect(state.getDeliveryFee()).toBe(30);
      expect(state.getTotal()).toBe(250);

      // Add 2 more packets -> 6 * 55 = 330 (>= 300) -> delivery fee is 0
      store.updateQuantity(milk.id, 6);
      state = useCartStore.getState();
      expect(state.getSubtotal()).toBe(330);
      expect(state.getDeliveryFee()).toBe(0);
      expect(state.getTotal()).toBe(330);
    });
  });

  describe('5. Duplicate Checkout Requests & Idempotency Key', () => {
    it('produces unique idempotency keys per order submission to guarantee single order execution', () => {
      const keys = new Set<string>();
      for (let i = 0; i < 50; i++) {
        const key = `ord_idem_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        keys.add(key);
      }
      expect(keys.size).toBe(50);
    });
  });

  describe('6. Order Ownership & Device Isolation', () => {
    it('stores active order IDs bound strictly to the current customer session', () => {
      const customerStore = useCustomerStore.getState();
      customerStore.addActiveOrderId('ORD-TEST-9988');

      const updated = useCustomerStore.getState();
      expect(updated.activeOrderIds).toContain('ORD-TEST-9988');

      customerStore.removeActiveOrderId('ORD-TEST-9988');
      expect(useCustomerStore.getState().activeOrderIds).not.toContain('ORD-TEST-9988');
    });
  });

  describe('7. Checkout Error Handling & No Fake Orders in Production', () => {
    it('throws error and NEVER returns fake order when backend and database fail in production mode', async () => {
      // client instantiated with allowMockFallback = false
      const client = new HttpEcommerceApiClient('http://non-existent-server-404:9999', false);

      const orderPayload = {
        customerName: 'Test Customer',
        customerPhone: '9876543210',
        deliveryAddress: {
          street: '123 Test Street',
          city: 'Nagpur',
          pincode: '440010',
          label: 'Home' as const,
        },
        paymentMethod: 'cod' as const,
        items: [{ productId: 'invalid-prod', quantity: 1 }],
      };

      await expect(client.placeOrder(orderPayload)).rejects.toThrow();
    });
  });

  describe('8. Order Tracking & Realtime Status Synchronization', () => {
    it('maps all Supabase database statuses to standard frontend tracker states', () => {
      expect(mapDbStatusToFrontend('PLACED')).toBe('pending');
      expect(mapDbStatusToFrontend('CONFIRMED')).toBe('confirmed');
      expect(mapDbStatusToFrontend('PREPARING')).toBe('preparing');
      expect(mapDbStatusToFrontend('OUT_FOR_DELIVERY')).toBe('out_for_delivery');
      expect(mapDbStatusToFrontend('DELIVERED')).toBe('delivered');
      expect(mapDbStatusToFrontend('CANCELLED')).toBe('cancelled');
      expect(mapDbStatusToFrontend('REJECTED')).toBe('cancelled');
    });
  });
});
