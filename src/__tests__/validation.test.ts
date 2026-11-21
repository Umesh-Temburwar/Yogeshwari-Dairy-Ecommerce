import { describe, it, expect } from 'vitest';
import {
  validateCustomerName,
  validateIndianMobile,
  validatePincode,
  validateStreetAddress,
} from '../utils/validation';

describe('Customer & Checkout Validation Utilities', () => {
  describe('Customer Name Validation', () => {
    it('rejects empty or whitespace-only name', () => {
      expect(validateCustomerName('').isValid).toBe(false);
      expect(validateCustomerName('   ').isValid).toBe(false);
    });

    it('rejects single character name', () => {
      expect(validateCustomerName('A').isValid).toBe(false);
    });

    it('accepts valid customer names', () => {
      expect(validateCustomerName('Ramesh Kumar').isValid).toBe(true);
      expect(validateCustomerName('Priya S').isValid).toBe(true);
    });
  });

  describe('Indian Mobile Number Validation', () => {
    it('rejects empty or non-numeric numbers', () => {
      expect(validateIndianMobile('').isValid).toBe(false);
      expect(validateIndianMobile('abcdefghij').isValid).toBe(false);
    });

    it('rejects numbers not starting with 6, 7, 8, or 9', () => {
      expect(validateIndianMobile('5123456789').isValid).toBe(false);
      expect(validateIndianMobile('1234567890').isValid).toBe(false);
    });

    it('rejects numbers not exactly 10 digits', () => {
      expect(validateIndianMobile('987654321').isValid).toBe(false);
      expect(validateIndianMobile('98765432101').isValid).toBe(false);
    });

    it('accepts valid 10-digit Indian numbers with formatting', () => {
      expect(validateIndianMobile('9876543210').isValid).toBe(true);
      expect(validateIndianMobile('8765432109').isValid).toBe(true);
      expect(validateIndianMobile('+91 98765 43210').isValid).toBe(true);
      expect(validateIndianMobile('91-9876543210').isValid).toBe(true);
    });
  });

  describe('Pincode Validation', () => {
    it('rejects empty, short, or non-numeric pincodes', () => {
      expect(validatePincode('').isValid).toBe(false);
      expect(validatePincode('4400').isValid).toBe(false);
      expect(validatePincode('4400101').isValid).toBe(false);
      expect(validatePincode('ABCDEF').isValid).toBe(false);
    });

    it('accepts valid 6-digit Indian postal codes', () => {
      expect(validatePincode('440010').isValid).toBe(true);
      expect(validatePincode('440022').isValid).toBe(true);
    });
  });

  describe('Street Address Validation', () => {
    it('rejects empty or too brief addresses', () => {
      expect(validateStreetAddress('').isValid).toBe(false);
      expect(validateStreetAddress('Flat').isValid).toBe(false);
    });

    it('accepts detailed street addresses', () => {
      expect(validateStreetAddress('Flat 302, Sai Complex, Ramdas Peth').isValid).toBe(true);
    });
  });
});
