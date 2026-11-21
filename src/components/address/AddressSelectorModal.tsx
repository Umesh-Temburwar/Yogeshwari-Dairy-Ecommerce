import React, { useState } from 'react';
import { X, MapPin, Check, Plus } from 'lucide-react';
import { useCustomerStore } from '@/store/customerStore';
import { triggerHaptic } from '@/utils/haptics';
import { validateStreetAddress, validatePincode } from '@/utils/validation';

interface AddressSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddressSelectorModal: React.FC<AddressSelectorModalProps> = ({ isOpen, onClose }) => {
  const {
    savedAddresses,
    selectedAddressId,
    setSelectedAddressId,
    addAddress,
    customerName,
    customerPhone,
  } = useCustomerStore();

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newLabel, setNewLabel] = useState<'Home' | 'Shop' | 'Work' | 'Other'>('Home');
  const [street, setStreet] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('Ambajogai');
  const [pincode, setPincode] = useState('431517');
  const [formError, setFormError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelect = (id: string) => {
    triggerHaptic('light');
    setSelectedAddressId(id);
    onClose();
  };

  const handleSaveNewAddress = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const streetVal = validateStreetAddress(street);
    if (!streetVal.isValid) {
      setFormError(streetVal.error || 'Please enter full street details');
      triggerHaptic('warning');
      return;
    }

    const pincodeVal = validatePincode(pincode);
    if (!pincodeVal.isValid) {
      setFormError(pincodeVal.error || 'Please enter a valid 6-digit postal pincode');
      triggerHaptic('warning');
      return;
    }

    triggerHaptic('medium');
    addAddress({
      label: newLabel,
      name: customerName,
      phone: customerPhone,
      street: street.trim(),
      landmark: landmark.trim(),
      city: city.trim(),
      pincode: pincode.trim(),
    });

    setIsAddingNew(false);
    setStreet('');
    setLandmark('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-fade-in">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-float p-4 sm:p-6 z-10 animate-slide-up max-h-[85vh] flex flex-col pb-safe">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-brand-slate-border mb-4 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-brand-green-light flex items-center justify-center text-[#0C831F]">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base text-brand-text-primary">
                Select Delivery Location
              </h3>
              <p className="text-[11px] text-brand-text-muted">Ambajogai Quick Delivery Zones</p>
            </div>
          </div>
          <button
            onClick={() => {
              triggerHaptic('light');
              onClose();
            }}
            className="w-11 h-11 rounded-full bg-[#F4F6F8] flex items-center justify-center text-brand-text-secondary hover:text-black"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body with max-h and scrollability */}
        <div className="overflow-y-auto no-scrollbar space-y-3 pb-4">
          {!isAddingNew ? (
            <>
              {savedAddresses.map((addr) => {
                const isSelected = addr.id === selectedAddressId;
                return (
                  <div
                    key={addr.id}
                    onClick={() => handleSelect(addr.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 min-h-[56px] ${
                      isSelected
                        ? 'border-[#0C831F] bg-brand-green-light/40 shadow-xs'
                        : 'border-brand-slate-border bg-white hover:border-[#0C831F]/40'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="text-base mt-0.5">
                        {addr.label === 'Home'
                          ? '🏠'
                          : addr.label === 'Shop'
                          ? '🏪'
                          : addr.label === 'Work'
                          ? '🏢'
                          : '📍'}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-xs sm:text-sm text-brand-text-primary">
                            {addr.label}
                          </span>
                          {addr.isDefault && (
                            <span className="bg-gray-100 text-gray-700 text-[9px] font-bold px-1.5 py-0.2 rounded">
                              DEFAULT
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-brand-text-secondary mt-1 leading-snug">
                          {addr.street}
                          {addr.landmark ? `, Near ${addr.landmark}` : ''}
                        </p>
                        <p className="text-[11px] text-brand-text-muted mt-0.5">
                          {addr.city} - {addr.pincode}
                        </p>
                      </div>
                    </div>

                    <div
                      className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 mt-1 ${
                        isSelected
                          ? 'border-[#0C831F] bg-[#0C831F] text-white'
                          : 'border-gray-300'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}

              {/* Add New Address Button with min 44px touch target */}
              <button
                onClick={() => {
                  triggerHaptic('light');
                  setIsAddingNew(true);
                }}
                className="w-full min-h-[48px] py-3 border-2 border-dashed border-[#0C831F]/40 hover:border-[#0C831F] text-[#0C831F] rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors bg-brand-green-light/20"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Address</span>
              </button>
            </>
          ) : (
            <form onSubmit={handleSaveNewAddress} className="space-y-3">
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-2.5 rounded-xl text-xs font-medium">
                  {formError}
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-brand-text-primary block mb-1">
                  Address Type:
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['Home', 'Shop', 'Work', 'Other'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setNewLabel(type)}
                      className={`min-h-[40px] py-1.5 text-xs font-bold rounded-lg border text-center ${
                        newLabel === type
                          ? 'bg-[#0C831F] text-white border-[#0C831F]'
                          : 'bg-[#F4F6F8] text-brand-text-secondary border-brand-slate-border'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-brand-text-primary block mb-1">
                  Flat / House / Shop No. & Street:
                </label>
                <input
                  type="text"
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="e.g. Mandi Bazar / Mangalwar Peth Road"
                  className="w-full text-xs p-2.5 rounded-xl border border-brand-slate-border focus:ring-1 focus:ring-[#0C831F] focus:outline-none min-h-[44px]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-brand-text-primary block mb-1">
                  Landmark (Optional):
                </label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="e.g. Near Masjid / Yogeshwari Devi Mandir"
                  className="w-full text-xs p-2.5 rounded-xl border border-brand-slate-border focus:ring-1 focus:ring-[#0C831F] focus:outline-none min-h-[44px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-brand-text-primary block mb-1">
                    City:
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-brand-slate-border bg-gray-50 focus:outline-none min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-brand-text-primary block mb-1">
                    Pincode:
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                    className="w-full text-xs p-2.5 rounded-xl border border-brand-slate-border focus:outline-none min-h-[44px]"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="flex-1 min-h-[44px] py-2.5 rounded-xl border border-brand-slate-border text-xs font-bold text-brand-text-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 min-h-[44px] py-2.5 rounded-xl bg-[#0C831F] text-white text-xs font-bold hover:bg-[#086617]"
                >
                  Save Address
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
