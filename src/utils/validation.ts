/**
 * Validation utilities for customer checkout & address book
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateCustomerName(name: string): ValidationResult {
  if (!name || !name.trim()) {
    return { isValid: false, error: 'Customer name is required' };
  }
  if (name.trim().length < 2) {
    return { isValid: false, error: 'Name must be at least 2 characters long' };
  }
  return { isValid: true };
}

export function validateIndianMobile(phone: string): ValidationResult {
  if (!phone || !phone.trim()) {
    return { isValid: false, error: 'Mobile number is required' };
  }
  const cleaned = phone.replace(/[\s\-\+]/g, '').replace(/^91/, '').replace(/^0/, '');
  const indianMobileRegex = /^[6-9]\d{9}$/;
  if (!indianMobileRegex.test(cleaned)) {
    return {
      isValid: false,
      error: 'Please enter a valid 10-digit Indian mobile number (e.g. 9876543210)',
    };
  }
  return { isValid: true };
}

export function validatePincode(pincode: string): ValidationResult {
  if (!pincode || !pincode.trim()) {
    return { isValid: false, error: 'Pincode is required' };
  }
  const cleaned = pincode.trim();
  const indianPincodeRegex = /^\d{6}$/;
  if (!indianPincodeRegex.test(cleaned)) {
    return { isValid: false, error: 'Please enter a valid 6-digit postal pincode (e.g. 431517)' };
  }
  return { isValid: true };
}

export function validateStreetAddress(street: string): ValidationResult {
  if (!street || !street.trim()) {
    return { isValid: false, error: 'Flat / House / Street address is required' };
  }
  if (street.trim().length < 5) {
    return { isValid: false, error: 'Please provide full street/building details (at least 5 characters)' };
  }
  return { isValid: true };
}
