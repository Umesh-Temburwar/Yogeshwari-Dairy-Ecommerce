import { describe, it, expect, beforeEach } from 'vitest';
import {
  isValidCoordinate,
  calculateDistanceKm,
  checkDeliveryServiceability,
  STORE_ORIGIN_COORDINATES,
  EXPRESS_ZONE_RADIUS_KM,
  MAX_SERVICEABLE_RADIUS_KM,
} from '../utils/geoService';
import {
  validateCustomerName,
  validateIndianMobile,
  validateStreetAddress,
  validatePincode,
} from '../utils/validation';
import { useCustomerStore } from '../store/customerStore';

describe('CUSTOMER MAP LOCATION & ADDRESS SYSTEM SUITE', () => {
  beforeEach(() => {
    // Reset customer store state
    const store = useCustomerStore.getState();
    store.setCustomerProfile('Ramesh Kumar', '9370869896');
  });

  describe('1. GPS Coordinates & Distance Calculations', () => {
    it('validates legitimate coordinate ranges', () => {
      expect(isValidCoordinate(18.7304, 76.3879)).toBe(true);
      expect(isValidCoordinate(0, 0)).toBe(true);
      expect(isValidCoordinate(90, 180)).toBe(true);
      expect(isValidCoordinate(-90, -180)).toBe(true);

      // Invalid coordinates
      expect(isValidCoordinate(91, 76)).toBe(false);
      expect(isValidCoordinate(18, 181)).toBe(false);
      expect(isValidCoordinate(NaN, 76)).toBe(false);
      expect(isValidCoordinate(undefined, 76)).toBe(false);
    });

    it('accurately computes Haversine distances in km from Ambajogai Mandi Bazar', () => {
      // Mandi Bazar store origin to itself should be 0 km
      const distanceSelf = calculateDistanceKm(
        STORE_ORIGIN_COORDINATES.lat,
        STORE_ORIGIN_COORDINATES.lng,
        STORE_ORIGIN_COORDINATES.lat,
        STORE_ORIGIN_COORDINATES.lng
      );
      expect(distanceSelf).toBe(0);

      // Mandi Bazar to Yogeshwari Devi Mandir (approx 0.6 to 0.9 km)
      const distToMandir = calculateDistanceKm(
        STORE_ORIGIN_COORDINATES.lat,
        STORE_ORIGIN_COORDINATES.lng,
        18.7335,
        76.3842
      );
      expect(distToMandir).toBeGreaterThan(0.3);
      expect(distToMandir).toBeLessThan(1.5);

      // Mandi Bazar to Parli Vaijnath (approx 20 - 25 km)
      const distToParli = calculateDistanceKm(
        STORE_ORIGIN_COORDINATES.lat,
        STORE_ORIGIN_COORDINATES.lng,
        18.8485,
        76.5312
      );
      expect(distToParli).toBeGreaterThan(15);
      expect(distToParli).toBeLessThan(30);

      // Mandi Bazar to Pune (approx 280+ km)
      const distToPune = calculateDistanceKm(
        STORE_ORIGIN_COORDINATES.lat,
        STORE_ORIGIN_COORDINATES.lng,
        18.5204,
        73.8567
      );
      expect(distToPune).toBeGreaterThan(250);
    });
  });

  describe('2. Delivery Area Serviceability Validation', () => {
    it('classifies location within 10 km as EXPRESS zone', () => {
      // Inside Ambajogai town (approx 1 km)
      const res = checkDeliveryServiceability({
        lat: 18.735,
        lng: 76.39,
      });

      expect(res.isServiceable).toBe(true);
      expect(res.zone).toBe('EXPRESS');
      expect(res.distanceKm).toBeLessThanOrEqual(EXPRESS_ZONE_RADIUS_KM);
      expect(res.badgeText).toContain('Express Delivery');
    });

    it('classifies location between 10 km and 25 km as STANDARD zone', () => {
      // Nearby village/outskirts (approx 18 km)
      const res = checkDeliveryServiceability({
        lat: 18.85,
        lng: 76.45,
      });

      expect(res.isServiceable).toBe(true);
      expect(res.zone).toBe('STANDARD');
      expect(res.distanceKm).toBeGreaterThan(EXPRESS_ZONE_RADIUS_KM);
      expect(res.distanceKm).toBeLessThanOrEqual(MAX_SERVICEABLE_RADIUS_KM);
      expect(res.badgeText).toContain('Standard Delivery');
    });

    it('rejects locations beyond 25 km as OUT_OF_ZONE', () => {
      // Pune / Mumbai / Beed city (> 40 km away)
      const res = checkDeliveryServiceability({
        lat: 18.99,
        lng: 75.76, // Beed city approx 80 km away
      });

      expect(res.isServiceable).toBe(false);
      expect(res.zone).toBe('OUT_OF_ZONE');
      expect(res.distanceKm).toBeGreaterThan(MAX_SERVICEABLE_RADIUS_KM);
      expect(res.badgeText).toContain('Outside Delivery Area');
      expect(res.message).toContain('currently limited to within 25 km');
    });

    it('handles fallback gracefully when coordinates are null or pending', () => {
      const res = checkDeliveryServiceability(null);
      expect(res.isServiceable).toBe(true);
      expect(res.backendEnforcementPending).toBe(true);
    });
  });

  describe('3. Customer Address Form Validation', () => {
    it('validates customer name strictly', () => {
      expect(validateCustomerName('Ramesh').isValid).toBe(true);
      expect(validateCustomerName('A').isValid).toBe(false);
      expect(validateCustomerName('').isValid).toBe(false);
    });

    it('validates Indian 10-digit mobile numbers', () => {
      expect(validateIndianMobile('9370869896').isValid).toBe(true);
      expect(validateIndianMobile('+91 93708 69896').isValid).toBe(true);
      expect(validateIndianMobile('09370869896').isValid).toBe(true);

      // Invalid formats
      expect(validateIndianMobile('12345').isValid).toBe(false);
      expect(validateIndianMobile('9876543210123').isValid).toBe(false);
      expect(validateIndianMobile('0000000000').isValid).toBe(false);
    });

    it('validates street address presence', () => {
      expect(validateStreetAddress('Mandi Bazar, Mangalwar Peth').isValid).toBe(true);
      expect(validateStreetAddress('A').isValid).toBe(false);
      expect(validateStreetAddress('').isValid).toBe(false);
    });

    it('validates Indian postal pincodes', () => {
      expect(validatePincode('431517').isValid).toBe(true); // Ambajogai
      expect(validatePincode('431122').isValid).toBe(true);

      // Invalid pincodes
      expect(validatePincode('000000').isValid).toBe(false);
      expect(validatePincode('43151').isValid).toBe(false); // 5 digits
      expect(validatePincode('4315179').isValid).toBe(false); // 7 digits
      expect(validatePincode('ABCDEF').isValid).toBe(false);
    });
  });

  describe('4. Address Store Operations & Default Management', () => {
    it('allows adding, updating, setting default and deleting addresses', () => {
      const store = useCustomerStore.getState();
      const initialCount = store.savedAddresses.length;

      // 1. Add Address with GPS coordinates and building
      store.addAddress({
        label: 'Home',
        name: 'Ganesh Shinde',
        phone: '9876543210',
        houseNo: 'Flat 101',
        building: 'Sai Complex',
        street: 'Mangalwar Peth',
        area: 'Mandi Bazar',
        landmark: 'Near Masjid',
        city: 'Ambajogai',
        state: 'Maharashtra',
        pincode: '431517',
        latitude: 18.7304,
        longitude: 76.3879,
        isConfirmedOnMap: true,
        deliveryInstructions: 'Ring bell twice',
      });

      const updatedStore = useCustomerStore.getState();
      expect(updatedStore.savedAddresses.length).toBe(initialCount + 1);

      const added = updatedStore.savedAddresses[updatedStore.savedAddresses.length - 1];
      expect(added.building).toBe('Sai Complex');
      expect(added.deliveryInstructions).toBe('Ring bell twice');
      expect(added.isConfirmedOnMap).toBe(true);

      // 2. Set as Default Address
      store.setDefaultAddress(added.id);
      const afterDefault = useCustomerStore.getState();
      const defaultAddr = afterDefault.savedAddresses.find((a) => a.id === added.id);
      expect(defaultAddr?.isDefault).toBe(true);
      expect(afterDefault.selectedAddressId).toBe(added.id);

      // 3. Update Address
      store.updateAddress(added.id, {
        houseNo: 'Flat 102 (Updated)',
      });
      const afterUpdate = useCustomerStore.getState();
      const modified = afterUpdate.savedAddresses.find((a) => a.id === added.id);
      expect(modified?.houseNo).toBe('Flat 102 (Updated)');

      // 4. Delete Address
      store.deleteAddress(added.id);
      const afterDelete = useCustomerStore.getState();
      expect(afterDelete.savedAddresses.length).toBe(initialCount);
    });
  });

  describe('5. Checkout Integration Snapshot Verification', () => {
    it('creates immutable address snapshot payload for order placement', () => {
      const store = useCustomerStore.getState();
      const activeAddress = store.getSelectedAddress();

      const orderPayload = {
        customerName: 'Umesh Customer',
        customerPhone: '9370869896',
        deliveryAddress: {
          houseNo: activeAddress.houseNo,
          building: activeAddress.building,
          street: activeAddress.street,
          area: activeAddress.area,
          landmark: activeAddress.landmark,
          city: activeAddress.city,
          state: activeAddress.state || 'Maharashtra',
          pincode: activeAddress.pincode,
          label: activeAddress.label,
          latitude: activeAddress.latitude,
          longitude: activeAddress.longitude,
          isConfirmedOnMap: activeAddress.isConfirmedOnMap,
          deliveryInstructions: 'Call before delivery',
        },
        paymentMethod: 'cod' as const,
        notes: 'Doorstep cash payment',
        items: [{ productId: 'prod_1', quantity: 2 }],
        idempotencyKey: 'test_idem_key_123',
      };

      // Verify immutable structure matches backend expectation
      expect(orderPayload.deliveryAddress.street).toBeDefined();
      expect(orderPayload.deliveryAddress.city).toBe('Ambajogai');
      expect(orderPayload.deliveryAddress.pincode).toBe('431517');
      expect(orderPayload.deliveryAddress.latitude).toBeDefined();
      expect(orderPayload.deliveryAddress.longitude).toBeDefined();
      expect(orderPayload.deliveryAddress.isConfirmedOnMap).toBe(true);
      expect(orderPayload.idempotencyKey).toBe('test_idem_key_123');
    });
  });
});
