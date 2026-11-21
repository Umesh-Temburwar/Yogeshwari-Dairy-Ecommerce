import React, { useState } from 'react';
import {
  X,
  Plus,
  Minus,
  Trash2,
  MapPin,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  MessageCircle,
  AlertTriangle,
  User,
  Phone,
} from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useCustomerStore } from '@/store/customerStore';
import { formatPrice } from '@/utils/formatters';
import { triggerHaptic } from '@/utils/haptics';
import { ecommerceApi } from '@/services/api';
import { Order } from '@/types/ecommerce';
import { openWhatsAppOrderConfirmation } from '@/utils/whatsapp';
import {
  validateCustomerName,
  validateIndianMobile,
  validateStreetAddress,
  validatePincode,
} from '@/utils/validation';

interface CartDrawerProps {
  onOpenAddressModal: () => void;
  onOrderSuccess: (order: Order) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  onOpenAddressModal,
  onOrderSuccess,
}) => {
  const {
    items,
    isCartDrawerOpen,
    closeCartDrawer,
    updateQuantity,
    clearCart,
    getSubtotal,
    getDeliveryFee,
    getAmountNeededForFreeDelivery,
    getTotal,
    getTotalItemsCount,
  } = useCartStore();

  const {
    customerName,
    customerPhone,
    setCustomerProfile,
    getSelectedAddress,
    selectedPaymentMethod,
    setSelectedPaymentMethod,
    deliveryNotes,
    setDeliveryNotes,
    addActiveOrderId,
  } = useCustomerStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sendWhatsAppAlert, setSendWhatsAppAlert] = useState(true);

  // Form states for customer info verification
  const [nameInput, setNameInput] = useState(customerName || 'Ramesh Kumar');
  const [phoneInput, setPhoneInput] = useState(customerPhone || '9876543210');
  const [validationErrors, setValidationErrors] = useState<{ name?: string; phone?: string; address?: string }>({});

  if (!isCartDrawerOpen) return null;

  const selectedAddress = getSelectedAddress();
  const subtotal = getSubtotal();
  const deliveryFee = getDeliveryFee();
  const amountNeeded = getAmountNeededForFreeDelivery();
  const total = getTotal();
  const totalItemsCount = getTotalItemsCount();

  const handleCheckout = async () => {
    if (items.length === 0 || isSubmitting) return;

    setErrorMessage(null);
    const errors: { name?: string; phone?: string; address?: string } = {};

    // 1. Validate Customer Name
    const nameVal = validateCustomerName(nameInput);
    if (!nameVal.isValid) errors.name = nameVal.error;

    // 2. Validate Customer Mobile
    const phoneVal = validateIndianMobile(phoneInput);
    if (!phoneVal.isValid) errors.phone = phoneVal.error;

    // 3. Validate Delivery Address
    const streetVal = validateStreetAddress(selectedAddress.street);
    const pincodeVal = validatePincode(selectedAddress.pincode);
    if (!streetVal.isValid) errors.address = streetVal.error;
    else if (!pincodeVal.isValid) errors.address = pincodeVal.error;

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      triggerHaptic('warning');
      return;
    }

    setValidationErrors({});

    // 4. Stock Limit Protection Guard
    const stockViolations = items.filter(
      (item) => item.product.stockQuantity && item.quantity > item.product.stockQuantity
    );
    if (stockViolations.length > 0) {
      setErrorMessage(
        `Insufficient stock for "${stockViolations[0].product.name}". Available: ${stockViolations[0].product.stockQuantity}`
      );
      triggerHaptic('warning');
      return;
    }

    // Save updated profile
    setCustomerProfile(nameInput, phoneInput);

    setIsSubmitting(true);
    triggerHaptic('medium');

    try {
      const idempotencyKey = `ord_idem_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      const orderPayload = {
        customerName: nameInput.trim(),
        customerPhone: phoneInput.trim(),
        deliveryAddress: {
          street: selectedAddress.street,
          landmark: selectedAddress.landmark,
          city: selectedAddress.city,
          pincode: selectedAddress.pincode,
          label: selectedAddress.label,
        },
        paymentMethod: selectedPaymentMethod,
        notes: deliveryNotes,
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
        idempotencyKey,
      };

      const result = await ecommerceApi.placeOrder(orderPayload);

      if (result.success && result.data) {
        addActiveOrderId(result.data.id);
        clearCart();
        closeCartDrawer();
        triggerHaptic('success');

        if (sendWhatsAppAlert) {
          openWhatsAppOrderConfirmation(result.data);
        }

        onOrderSuccess(result.data);
      } else {
        throw new Error(result.message || 'Failed to place order');
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      setErrorMessage(err.message || 'Failed to place order. Please check your network and try again.');
      triggerHaptic('warning');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={() => {
          if (!isSubmitting) {
            triggerHaptic('light');
            closeCartDrawer();
          }
        }}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between max-h-[100dvh]">
          {/* Header */}
          <div className="p-4 border-b border-brand-slate-border flex items-center justify-between bg-white z-10 shrink-0">
            <div>
              <h2 className="text-base sm:text-lg font-black text-brand-text-primary flex items-center gap-2">
                <span>My Cart</span>
                <span className="text-xs bg-brand-green-light text-[#0C831F] font-bold px-2 py-0.5 rounded-full">
                  {totalItemsCount} {totalItemsCount === 1 ? 'Item' : 'Items'}
                </span>
              </h2>
              <p className="text-xs text-brand-text-muted">
                ⚡ Fast Local Delivery (Est. 20-40 Mins)
              </p>
            </div>
            <button
              onClick={() => {
                triggerHaptic('light');
                closeCartDrawer();
              }}
              className="w-11 h-11 rounded-full bg-[#F4F6F8] flex items-center justify-center text-brand-text-secondary hover:text-black hover:bg-gray-200 transition-colors"
              title="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4 pb-safe">
            {/* Free Delivery Goal Tracker */}
            <div className="bg-brand-slate-bg border border-brand-slate-border rounded-2xl p-3">
              {amountNeeded > 0 ? (
                <>
                  <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                    <span className="text-brand-text-primary">
                      Add <span className="text-[#0C831F] font-black">{formatPrice(amountNeeded)}</span> more for FREE Delivery!
                    </span>
                    <span className="text-brand-text-muted text-[10px]">
                      Threshold: ₹300
                    </span>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#0C831F] rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (subtotal / 300) * 100)}%` }}
                    />
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2 text-xs font-bold text-[#0C831F]">
                  <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>🎉 Yay! You have unlocked FREE Express Delivery!</span>
                </div>
              )}
            </div>

            {/* Error banner if any */}
            {errorMessage && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Cart Items List */}
            {items.length === 0 ? (
              <div className="py-12 text-center">
                <div className="w-16 h-16 bg-[#F4F6F8] rounded-full flex items-center justify-center mx-auto text-3xl mb-3">
                  🥛
                </div>
                <h3 className="font-extrabold text-sm text-brand-text-primary mb-1">
                  Your cart is empty
                </h3>
                <p className="text-xs text-brand-text-muted mb-4 max-w-xs mx-auto">
                  Add fresh milk, pure ghee, paneer, and sweets to enjoy fast doorstep delivery.
                </p>
                <button
                  onClick={() => closeCartDrawer()}
                  className="bg-[#0C831F] text-white text-xs font-bold px-5 py-3 rounded-xl min-h-[44px]"
                >
                  Browse Catalogue
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-xs font-bold text-brand-text-muted uppercase tracking-wider">
                  Review Items
                </div>
                {items.map((item) => {
                  const isMaxStock =
                    Boolean(item.product.stockQuantity) &&
                    item.quantity >= item.product.stockQuantity;

                  return (
                    <div
                      key={item.productId}
                      className="flex items-center justify-between gap-3 p-3 bg-white rounded-xl border border-brand-slate-border shadow-xs"
                    >
                      {/* Item Image */}
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="w-12 h-12 rounded-lg object-cover bg-gray-100 shrink-0"
                      />

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-xs text-brand-text-primary truncate">
                          {item.product.name}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] text-brand-text-muted mt-0.5">
                          <span>{item.product.packSize}</span>
                          <span>•</span>
                          <span className="font-bold text-brand-text-primary">
                            {formatPrice(item.product.price)}
                          </span>
                        </div>
                        {isMaxStock && (
                          <span className="text-[10px] text-amber-700 font-bold block mt-0.5">
                            Max available: {item.product.stockQuantity}
                          </span>
                        )}
                      </div>

                      {/* Quantity Selector with min 44px touch targets */}
                      <div className="flex items-center bg-[#F4F6F8] border border-brand-slate-border rounded-xl overflow-hidden shrink-0">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="w-9 h-9 flex items-center justify-center text-brand-text-secondary hover:text-red-600 hover:bg-gray-200 transition-colors"
                          title="Reduce"
                        >
                          {item.quantity === 1 ? (
                            <Trash2 className="w-3.5 h-3.5 text-red-500" />
                          ) : (
                            <Minus className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <span className="px-2 text-xs font-extrabold text-brand-text-primary min-w-[20px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          disabled={isMaxStock}
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="w-9 h-9 flex items-center justify-center text-[#0C831F] disabled:opacity-40 hover:bg-gray-200 transition-colors"
                          title={isMaxStock ? 'Maximum stock reached' : 'Increase'}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Customer Details Form */}
            {items.length > 0 && (
              <div className="bg-[#F4F6F8] rounded-2xl p-3.5 border border-brand-slate-border space-y-2.5">
                <div className="text-xs font-bold text-brand-text-primary flex items-center justify-between">
                  <span>Customer Contact Details</span>
                  <span className="text-[10px] text-brand-text-muted font-normal">Required for delivery</span>
                </div>

                <div className="space-y-2">
                  <div>
                    <div className="relative">
                      <div className="absolute left-3 top-2.5 text-brand-text-muted">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={nameInput}
                        onChange={(e) => {
                          setNameInput(e.target.value);
                          if (validationErrors.name) setValidationErrors((prev) => ({ ...prev, name: undefined }));
                        }}
                        placeholder="Full Name"
                        className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-brand-slate-border bg-white focus:outline-none focus:ring-1 focus:ring-[#0C831F]"
                      />
                    </div>
                    {validationErrors.name && (
                      <span className="text-[10px] text-red-600 font-medium block mt-1">
                        {validationErrors.name}
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="relative">
                      <div className="absolute left-3 top-2.5 text-brand-text-muted">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        type="tel"
                        maxLength={10}
                        value={phoneInput}
                        onChange={(e) => {
                          setPhoneInput(e.target.value.replace(/\D/g, ''));
                          if (validationErrors.phone) setValidationErrors((prev) => ({ ...prev, phone: undefined }));
                        }}
                        placeholder="10-Digit Mobile Number"
                        className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-brand-slate-border bg-white focus:outline-none focus:ring-1 focus:ring-[#0C831F]"
                      />
                    </div>
                    {validationErrors.phone && (
                      <span className="text-[10px] text-red-600 font-medium block mt-1">
                        {validationErrors.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Delivery Address Card */}
            {items.length > 0 && (
              <div className="bg-[#F4F6F8] rounded-2xl p-3 border border-brand-slate-border">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-brand-text-primary">
                    <MapPin className="w-4 h-4 text-[#0C831F]" />
                    <span>Delivering To: {selectedAddress.label}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('light');
                      onOpenAddressModal();
                    }}
                    className="text-xs font-bold text-[#0C831F] hover:underline p-1"
                  >
                    Change
                  </button>
                </div>
                <p className="text-xs text-brand-text-secondary leading-snug">
                  {selectedAddress.street}
                  {selectedAddress.landmark ? `, Near ${selectedAddress.landmark}` : ''},{' '}
                  {selectedAddress.city} - {selectedAddress.pincode}
                </p>
                {validationErrors.address && (
                  <span className="text-[10px] text-red-600 font-medium block mt-1">
                    {validationErrors.address}
                  </span>
                )}
              </div>
            )}

            {/* Delivery Instructions */}
            {items.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-brand-text-primary block">
                  Delivery Notes / Instructions:
                </label>
                <input
                  type="text"
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  placeholder="e.g. Leave at door, Ring bell twice, Deliver before 8 AM"
                  className="w-full text-xs p-2.5 rounded-xl border border-brand-slate-border bg-white focus:outline-none focus:ring-1 focus:ring-[#0C831F]"
                />
              </div>
            )}

            {/* Payment Method Selector */}
            {items.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-bold text-brand-text-primary">
                  Select Payment Mode:
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('light');
                      setSelectedPaymentMethod('cod');
                    }}
                    className={`p-3 rounded-xl border text-left transition-all min-h-[56px] ${
                      selectedPaymentMethod === 'cod'
                        ? 'border-[#0C831F] bg-brand-green-light text-[#0C831F] font-bold shadow-xs'
                        : 'border-brand-slate-border bg-white text-brand-text-secondary font-medium'
                    }`}
                  >
                    <div className="text-xs flex items-center justify-between">
                      <span>Cash on Delivery</span>
                      {selectedPaymentMethod === 'cod' && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                    <span className="text-[10px] text-brand-text-muted block mt-0.5">
                      Pay cash at doorstep
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('light');
                      setSelectedPaymentMethod('upi_doorstep');
                    }}
                    className={`p-3 rounded-xl border text-left transition-all min-h-[56px] ${
                      selectedPaymentMethod === 'upi_doorstep'
                        ? 'border-[#0C831F] bg-brand-green-light text-[#0C831F] font-bold shadow-xs'
                        : 'border-brand-slate-border bg-white text-brand-text-secondary font-medium'
                    }`}
                  >
                    <div className="text-xs flex items-center justify-between">
                      <span>UPI on Delivery</span>
                      {selectedPaymentMethod === 'upi_doorstep' && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                    <span className="text-[10px] text-brand-text-muted block mt-0.5 leading-tight">
                      Pay via QR code at doorstep upon delivery
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* WhatsApp confirmation option */}
            {items.length > 0 && (
              <label className="flex items-center gap-2.5 p-3 bg-green-50 rounded-xl border border-green-200/60 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sendWhatsAppAlert}
                  onChange={(e) => setSendWhatsAppAlert(e.target.checked)}
                  className="w-4 h-4 rounded text-[#0C831F] focus:ring-[#0C831F]"
                />
                <MessageCircle className="w-4 h-4 text-green-700 shrink-0" />
                <span className="text-xs text-green-900 font-medium">
                  Send copy of order directly to Dairy WhatsApp for priority dispatch
                </span>
              </label>
            )}

            {/* Bill Details */}
            {items.length > 0 && (
              <div className="bg-brand-slate-bg rounded-2xl p-3 border border-brand-slate-border space-y-2">
                <div className="text-xs font-bold text-brand-text-muted uppercase tracking-wider mb-1">
                  Bill Summary
                </div>

                <div className="flex justify-between text-xs text-brand-text-secondary">
                  <span>Item Total</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>

                <div className="flex justify-between text-xs text-brand-text-secondary">
                  <span className="flex items-center gap-1">
                    <span>Delivery Fee</span>
                    {deliveryFee === 0 && (
                      <span className="text-[10px] bg-green-100 text-green-800 font-bold px-1 rounded">
                        FREE
                      </span>
                    )}
                  </span>
                  <span>
                    {deliveryFee === 0 ? (
                      <span className="text-green-700 font-bold">FREE</span>
                    ) : (
                      formatPrice(deliveryFee)
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-xs text-brand-text-secondary">
                  <span>Packaging & Handling</span>
                  <span className="text-green-700 font-semibold">FREE (Insulated Cool Pack)</span>
                </div>

                <div className="pt-2 border-t border-brand-slate-border flex justify-between text-sm font-black text-brand-text-primary">
                  <span>To Pay</span>
                  <span className="text-base text-[#0C831F]">{formatPrice(total)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Sticky Checkout Bar */}
          {items.length > 0 && (
            <div className="p-4 bg-white border-t border-brand-slate-border shadow-float shrink-0">
              <button
                disabled={isSubmitting}
                onClick={handleCheckout}
                className="w-full min-h-[52px] bg-[#0C831F] hover:bg-[#086617] disabled:opacity-60 text-white py-3.5 px-4 rounded-2xl font-black text-sm flex items-center justify-between shadow-sm transition-all active:scale-98"
              >
                <div className="text-left">
                  <div className="text-[11px] text-white/80 uppercase font-semibold">
                    Total: {formatPrice(total)}
                  </div>
                  <div className="text-xs font-medium text-white/90">
                    {selectedPaymentMethod === 'cod' ? 'Cash on Delivery' : 'Scan QR at Doorstep'}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 bg-white text-[#0C831F] px-4 py-2 rounded-xl text-xs sm:text-sm font-black">
                  {isSubmitting ? (
                    <span className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 border-2 border-[#0C831F] border-t-transparent rounded-full animate-spin" />
                      <span>Placing Order...</span>
                    </span>
                  ) : (
                    <>
                      <span>Place Order</span>
                      <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                    </>
                  )}
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
