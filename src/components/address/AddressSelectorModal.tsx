import React, { useState } from 'react';
import {
  X,
  MapPin,
  Check,
  Navigation,
  Search,
  Trash2,
  Edit2,
  AlertCircle,
  Loader2,
  Compass,
} from 'lucide-react';
import { useCustomerStore } from '@/store/customerStore';
import { triggerHaptic } from '@/utils/haptics';
import { validateCustomerName, validateIndianMobile, validateStreetAddress, validatePincode } from '@/utils/validation';
import { LeafletMapPicker } from './LeafletMapPicker';
import {
  AMBAJOGAI_CENTER,
  GeoCoordinates,
  getUserLocation,
  searchAddress,
  reverseGeocode,
  GeocodingResult,
} from '@/utils/geoService';
import { DeliveryAddress } from '@/types/ecommerce';

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
    updateAddress,
    deleteAddress,
    customerName,
    customerPhone,
  } = useCustomerStore();

  // Modal Views: 'list' | 'map-picker' | 'address-form'
  const [viewMode, setViewMode] = useState<'list' | 'map-picker' | 'address-form'>('list');
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  // Map & Pin State
  const [selectedCoords, setSelectedCoords] = useState<GeoCoordinates>(AMBAJOGAI_CENTER);
  const [isPinConfirmed, setIsPinConfirmed] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Search Autocomplete State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GeocodingResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Address Form State
  const [label, setLabel] = useState<'Home' | 'Shop' | 'Work' | 'Other'>('Home');
  const [recipientName, setRecipientName] = useState(customerName || 'Customer');
  const [recipientPhone, setRecipientPhone] = useState(customerPhone || '');
  const [houseNo, setHouseNo] = useState('');
  const [street, setStreet] = useState('');
  const [area, setArea] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('Ambajogai');
  const [state, setState] = useState('Maharashtra');
  const [pincode, setPincode] = useState('431517');
  const [formError, setFormError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Handle address selection from saved list
  const handleSelect = (id: string) => {
    triggerHaptic('light');
    setSelectedAddressId(id);
    onClose();
  };

  // Start adding a new address -> Opens map picker first
  const handleStartAddNew = () => {
    triggerHaptic('light');
    setEditingAddressId(null);
    setSelectedCoords(AMBAJOGAI_CENTER);
    setIsPinConfirmed(false);
    setGpsError(null);
    setSearchQuery('');
    setSearchResults([]);
    setHouseNo('');
    setStreet('');
    setArea('');
    setLandmark('');
    setCity('Ambajogai');
    setState('Maharashtra');
    setPincode('431517');
    setRecipientName(customerName || 'Customer');
    setRecipientPhone(customerPhone || '');
    setViewMode('map-picker');
  };

  // Start editing an existing address
  const handleStartEdit = (addr: DeliveryAddress, e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic('light');
    setEditingAddressId(addr.id);
    setSelectedCoords({
      lat: addr.latitude || AMBAJOGAI_CENTER.lat,
      lng: addr.longitude || AMBAJOGAI_CENTER.lng,
    });
    setIsPinConfirmed(Boolean(addr.latitude && addr.longitude));
    setLabel(addr.label);
    setRecipientName(addr.name || customerName);
    setRecipientPhone(addr.phone || customerPhone);
    setHouseNo(addr.houseNo || '');
    setStreet(addr.street);
    setArea(addr.area || '');
    setLandmark(addr.landmark || '');
    setCity(addr.city || 'Ambajogai');
    setState(addr.state || 'Maharashtra');
    setPincode(addr.pincode || '431517');
    setViewMode('address-form');
  };

  // Delete an address
  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (savedAddresses.length <= 1) {
      alert('You must have at least one saved delivery address.');
      return;
    }
    triggerHaptic('warning');
    if (window.confirm('Delete this saved delivery address?')) {
      deleteAddress(id);
    }
  };

  // Trigger GPS Geolocation
  const handleUseCurrentLocation = async () => {
    setIsLocating(true);
    setGpsError(null);
    triggerHaptic('medium');
    try {
      const { coords } = await getUserLocation();
      setSelectedCoords(coords);
      triggerHaptic('success');

      // Reverse geocode to autofill address
      const details = await reverseGeocode(coords.lat, coords.lng);
      if (details.street) setStreet(details.street);
      if (details.area) setArea(details.area);
      if (details.pincode) setPincode(details.pincode);
      if (details.city) setCity(details.city);
    } catch (err: any) {
      setGpsError(err.message || 'Location permission denied. Please select on map or enter manually.');
      triggerHaptic('warning');
    } finally {
      setIsLocating(false);
    }
  };

  // Perform search query
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const results = await searchAddress(searchQuery);
      setSearchResults(results);
    } finally {
      setIsSearching(false);
    }
  };

  // Select place from search autocomplete
  const handleSelectSearchResult = (result: GeocodingResult) => {
    triggerHaptic('light');
    setSelectedCoords({ lat: result.lat, lng: result.lng });
    setSearchResults([]);
    setSearchQuery('');
    if (result.street) setStreet(result.street);
    if (result.area) setArea(result.area);
    if (result.pincode) setPincode(result.pincode);
    if (result.city) setCity(result.city);
  };

  // Confirm selected pin on map -> proceed to address form
  const handleConfirmMapPin = () => {
    triggerHaptic('success');
    setIsPinConfirmed(true);
    setViewMode('address-form');
  };

  // Save / Update Address Form Submission
  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const nameVal = validateCustomerName(recipientName);
    if (!nameVal.isValid) {
      setFormError(nameVal.error || 'Recipient name is required');
      triggerHaptic('warning');
      return;
    }

    const phoneVal = validateIndianMobile(recipientPhone);
    if (!phoneVal.isValid) {
      setFormError(phoneVal.error || 'Valid contact phone number is required');
      triggerHaptic('warning');
      return;
    }

    const streetVal = validateStreetAddress(street);
    if (!streetVal.isValid) {
      setFormError(streetVal.error || 'Street / Building details are required');
      triggerHaptic('warning');
      return;
    }

    const pincodeVal = validatePincode(pincode);
    if (!pincodeVal.isValid) {
      setFormError(pincodeVal.error || 'Valid 6-digit postal pincode is required');
      triggerHaptic('warning');
      return;
    }

    triggerHaptic('medium');

    const addressPayload: Omit<DeliveryAddress, 'id'> = {
      label,
      name: recipientName.trim(),
      phone: recipientPhone.trim(),
      houseNo: houseNo.trim(),
      street: street.trim(),
      area: area.trim(),
      landmark: landmark.trim(),
      city: city.trim() || 'Ambajogai',
      state: state.trim() || 'Maharashtra',
      pincode: pincode.trim(),
      latitude: selectedCoords.lat,
      longitude: selectedCoords.lng,
      isConfirmedOnMap: isPinConfirmed,
    };

    if (editingAddressId) {
      updateAddress(editingAddressId, addressPayload);
      setSelectedAddressId(editingAddressId);
    } else {
      addAddress(addressPayload);
    }

    setViewMode('list');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-fade-in">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-float p-4 sm:p-6 z-10 animate-slide-up max-h-[90vh] flex flex-col pb-safe">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-brand-slate-border mb-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-brand-green-light flex items-center justify-center text-[#0C831F]">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base text-brand-text-primary">
                {viewMode === 'list'
                  ? 'Select Delivery Location'
                  : viewMode === 'map-picker'
                  ? 'Pin Location on Map'
                  : editingAddressId
                  ? 'Edit Delivery Address'
                  : 'Complete Address Details'}
              </h3>
              <p className="text-[11px] text-brand-text-muted">
                {viewMode === 'map-picker'
                  ? 'Drag pin to your doorstep'
                  : 'Ambajogai Fast Delivery Network'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              triggerHaptic('light');
              if (viewMode !== 'list') {
                setViewMode('list');
              } else {
                onClose();
              }
            }}
            className="w-10 h-10 rounded-full bg-[#F4F6F8] flex items-center justify-center text-brand-text-secondary hover:text-black"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* View Mode 1: Saved Addresses List */}
        {viewMode === 'list' && (
          <div className="overflow-y-auto no-scrollbar space-y-3 pb-2 flex-1">
            {savedAddresses.map((addr) => {
              const isSelected = addr.id === selectedAddressId;
              const hasCoordinates = Boolean(addr.latitude && addr.longitude);
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
                        {hasCoordinates ? (
                          <span className="inline-flex items-center gap-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.5 rounded">
                            <Compass className="w-2.5 h-2.5" />
                            <span>GPS Mapped</span>
                          </span>
                        ) : (
                          <span className="bg-amber-50 text-amber-800 text-[9px] font-medium px-1.5 py-0.5 rounded border border-amber-200">
                            Manual Address
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-brand-text-secondary mt-1 leading-snug">
                        {addr.houseNo ? `${addr.houseNo}, ` : ''}
                        {addr.street}
                        {addr.area ? `, ${addr.area}` : ''}
                        {addr.landmark ? `, Near ${addr.landmark}` : ''}
                      </p>
                      <p className="text-[11px] text-brand-text-muted mt-0.5">
                        {addr.city} - {addr.pincode} &bull; Ph: {addr.phone}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => handleStartEdit(addr, e)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      title="Edit address"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {savedAddresses.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => handleDelete(addr.id, e)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete address"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <div
                      className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'border-[#0C831F] bg-[#0C831F] text-white'
                          : 'border-gray-300'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Add New Address Button with Map Pin option */}
            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={handleStartAddNew}
                className="w-full min-h-[48px] py-3 border-2 border-dashed border-[#0C831F] text-[#0C831F] hover:bg-brand-green-light/30 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-colors bg-brand-green-light/10 shadow-xs"
              >
                <MapPin className="w-4 h-4" />
                <span>Choose Delivery Location on Map</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  handleStartAddNew();
                  setViewMode('address-form'); // Skip directly to manual form
                }}
                className="w-full py-2 text-xs font-semibold text-brand-text-muted hover:text-brand-text-primary text-center"
              >
                Or enter address manually without map
              </button>
            </div>
          </div>
        )}

        {/* View Mode 2: Interactive Leaflet Map Picker */}
        {viewMode === 'map-picker' && (
          <div className="space-y-3 overflow-y-auto no-scrollbar flex-1 pb-2">
            {/* Search Input for Nominatim Geocoding */}
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search area, landmark or street in Ambajogai..."
                className="w-full text-xs pl-8 pr-16 py-2.5 rounded-xl border border-brand-slate-border focus:ring-1 focus:ring-[#0C831F] focus:outline-none min-h-[42px]"
              />
              <Search className="w-4 h-4 text-brand-text-muted absolute left-2.5 top-3" />
              <button
                type="submit"
                disabled={isSearching}
                className="absolute right-1.5 top-1.5 px-2.5 py-1.5 rounded-lg bg-[#0C831F] text-white text-[11px] font-bold disabled:opacity-50"
              >
                {isSearching ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Search'}
              </button>
            </form>

            {/* Autocomplete Results Dropdown */}
            {searchResults.length > 0 && (
              <div className="bg-white border border-brand-slate-border rounded-xl shadow-lg p-1.5 space-y-1 max-h-40 overflow-y-auto">
                {searchResults.map((res) => (
                  <button
                    key={res.placeId}
                    type="button"
                    onClick={() => handleSelectSearchResult(res)}
                    className="w-full text-left p-2 rounded-lg hover:bg-slate-50 text-xs flex items-start gap-2 text-brand-text-primary"
                  >
                    <MapPin className="w-3.5 h-3.5 text-[#0C831F] shrink-0 mt-0.5" />
                    <span className="truncate">{res.displayName}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Use GPS Button */}
            <button
              type="button"
              disabled={isLocating}
              onClick={handleUseCurrentLocation}
              className="w-full py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-center gap-2 transition-colors min-h-[42px]"
            >
              {isLocating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                  <span>Locating device via GPS...</span>
                </>
              ) : (
                <>
                  <Navigation className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Use My Current Location</span>
                </>
              )}
            </button>

            {gpsError && (
              <div className="bg-amber-50 border border-amber-200 p-2 rounded-xl text-[11px] text-amber-800 flex items-start gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                <span>{gpsError}</span>
              </div>
            )}

            {/* Interactive Leaflet Map with drag marker */}
            <LeafletMapPicker
              initialCoords={selectedCoords}
              onLocationChange={(newCoords) => {
                setSelectedCoords(newCoords);
              }}
              height="260px"
            />

            {/* Confirm Pin Action */}
            <div className="pt-1 flex gap-2">
              <button
                type="button"
                onClick={() => setViewMode('address-form')}
                className="flex-1 min-h-[44px] py-2.5 rounded-xl border border-brand-slate-border text-xs font-bold text-brand-text-secondary"
              >
                Skip to Form
              </button>
              <button
                type="button"
                onClick={handleConfirmMapPin}
                className="flex-2 min-h-[44px] py-2.5 rounded-xl bg-[#0C831F] text-white text-xs font-bold hover:bg-[#086617] flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Check className="w-4 h-4" />
                <span>Confirm Location & Add Flat/Street</span>
              </button>
            </div>
          </div>
        )}

        {/* View Mode 3: Full Delivery Address Form */}
        {viewMode === 'address-form' && (
          <form onSubmit={handleSaveAddress} className="space-y-3 overflow-y-auto no-scrollbar flex-1 pb-2">
            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-2.5 rounded-xl text-xs font-medium">
                {formError}
              </div>
            )}

            {/* Pin Confirmation Status Pill */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-brand-slate-border text-[11px]">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#0C831F]" />
                <span className="font-semibold text-brand-text-primary">
                  {isPinConfirmed
                    ? `Pin Confirmed (${selectedCoords.lat.toFixed(4)}, ${selectedCoords.lng.toFixed(4)})`
                    : 'Coordinates: Ambajogai Default'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setViewMode('map-picker')}
                className="text-[#0C831F] font-bold hover:underline"
              >
                Change Pin
              </button>
            </div>

            {/* Address Type Tag */}
            <div>
              <label className="text-xs font-bold text-brand-text-primary block mb-1">
                Save Address As:
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['Home', 'Shop', 'Work', 'Other'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setLabel(type)}
                    className={`min-h-[38px] py-1.5 text-xs font-bold rounded-lg border text-center transition-all ${
                      label === type
                        ? 'bg-[#0C831F] text-white border-[#0C831F] shadow-xs'
                        : 'bg-[#F4F6F8] text-brand-text-secondary border-brand-slate-border hover:bg-gray-100'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Recipient Details */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold text-brand-text-primary block mb-1">
                  Recipient Name:
                </label>
                <input
                  type="text"
                  required
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-brand-slate-border focus:ring-1 focus:ring-[#0C831F] focus:outline-none min-h-[42px]"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-brand-text-primary block mb-1">
                  Contact Phone:
                </label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-xs p-2.5 rounded-xl border border-brand-slate-border focus:ring-1 focus:ring-[#0C831F] focus:outline-none min-h-[42px]"
                />
              </div>
            </div>

            {/* House / Flat & Street */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-xs font-bold text-brand-text-primary block mb-1">
                  House / Flat:
                </label>
                <input
                  type="text"
                  value={houseNo}
                  onChange={(e) => setHouseNo(e.target.value)}
                  placeholder="e.g. Flat 302"
                  className="w-full text-xs p-2.5 rounded-xl border border-brand-slate-border focus:ring-1 focus:ring-[#0C831F] focus:outline-none min-h-[42px]"
                />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-bold text-brand-text-primary block mb-1">
                  Street / Building Name:
                </label>
                <input
                  type="text"
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="e.g. Mandi Bazar, Mangalwar Peth Rd"
                  className="w-full text-xs p-2.5 rounded-xl border border-brand-slate-border focus:ring-1 focus:ring-[#0C831F] focus:outline-none min-h-[42px]"
                />
              </div>
            </div>

            {/* Area & Landmark */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold text-brand-text-primary block mb-1">
                  Area / Locality:
                </label>
                <input
                  type="text"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="e.g. Guruwar Peth / Shivaji Chowk"
                  className="w-full text-xs p-2.5 rounded-xl border border-brand-slate-border focus:ring-1 focus:ring-[#0C831F] focus:outline-none min-h-[42px]"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-brand-text-primary block mb-1">
                  Nearby Landmark:
                </label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="e.g. Near Masjid / Temple"
                  className="w-full text-xs p-2.5 rounded-xl border border-brand-slate-border focus:ring-1 focus:ring-[#0C831F] focus:outline-none min-h-[42px]"
                />
              </div>
            </div>

            {/* City, State, Pincode */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-xs font-bold text-brand-text-primary block mb-1">
                  City:
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-brand-slate-border bg-gray-50 focus:outline-none min-h-[42px]"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-brand-text-primary block mb-1">
                  State:
                </label>
                <input
                  type="text"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-brand-slate-border bg-gray-50 focus:outline-none min-h-[42px]"
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
                  className="w-full text-xs p-2.5 rounded-xl border border-brand-slate-border focus:outline-none min-h-[42px]"
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className="flex-1 min-h-[44px] py-2.5 rounded-xl border border-brand-slate-border text-xs font-bold text-brand-text-secondary"
              >
                Back to List
              </button>
              <button
                type="submit"
                className="flex-2 min-h-[44px] py-2.5 rounded-xl bg-[#0C831F] text-white text-xs font-bold hover:bg-[#086617] flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Check className="w-4 h-4" />
                <span>Save Delivery Address</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
