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
  Home,
  Briefcase,
  Store,
  FileText,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { useCustomerStore } from '@/store/customerStore';
import { triggerHaptic } from '@/utils/haptics';
import {
  validateCustomerName,
  validateIndianMobile,
  validateStreetAddress,
  validatePincode,
} from '@/utils/validation';
import { LeafletMapPicker } from './LeafletMapPicker';
import {
  AMBAJOGAI_CENTER,
  GeoCoordinates,
  getUserLocation,
  searchAddress,
  reverseGeocode,
  GeocodingResult,
  checkDeliveryServiceability,
  AMBAJOGAI_LANDMARKS,
  LandmarkPreset,
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
    setDefaultAddress,
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
  const [deviceCoords, setDeviceCoords] = useState<GeoCoordinates | null>(null);
  const [liveAddressSummary, setLiveAddressSummary] = useState<string>('Mandi Bazar, Mangalwar Peth, Ambajogai - 431517');
  const [isPinConfirmed, setIsPinConfirmed] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const reverseTimeoutRef = React.useRef<any>(null);

  // Search Autocomplete State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GeocodingResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Address Form State (Strictly empty defaults for new users, no dummy pre-fills)
  const isDummyName = (n?: string) => !n || n.toLowerCase().includes('ramesh') || n.toLowerCase() === 'customer';
  const isDummyPhone = (p?: string) => !p || p.includes('9876543210') || p.includes('9370869896');

  const [label, setLabel] = useState<'Home' | 'Shop' | 'Work' | 'Other'>('Home');
  const [recipientName, setRecipientName] = useState(isDummyName(customerName) ? '' : customerName);
  const [recipientPhone, setRecipientPhone] = useState(isDummyPhone(customerPhone) ? '' : customerPhone);
  const [houseNo, setHouseNo] = useState('');
  const [building, setBuilding] = useState('');
  const [street, setStreet] = useState('');
  const [area, setArea] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('Ambajogai');
  const [state, setState] = useState('Maharashtra');
  const [pincode, setPincode] = useState('431517');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  if (!isOpen) return null;

  const serviceCheck = checkDeliveryServiceability(selectedCoords);

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
    setBuilding('');
    setStreet('');
    setArea('');
    setLandmark('');
    setCity('Ambajogai');
    setState('Maharashtra');
    setPincode('431517');
    setDeliveryInstructions('');
    setIsDefault(savedAddresses.length === 0);
    setRecipientName(isDummyName(customerName) ? '' : (customerName || ''));
    setRecipientPhone(isDummyPhone(customerPhone) ? '' : (customerPhone || ''));
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
    setBuilding(addr.building || '');
    setStreet(addr.street);
    setArea(addr.area || '');
    setLandmark(addr.landmark || '');
    setCity(addr.city || 'Ambajogai');
    setState(addr.state || 'Maharashtra');
    setPincode(addr.pincode || '431517');
    setDeliveryInstructions(addr.deliveryInstructions || '');
    setIsDefault(Boolean(addr.isDefault));
    setViewMode('address-form');
  };

  // Delete an address
  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic('warning');
    if (window.confirm('Delete this delivery address?')) {
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
      setDeviceCoords(coords);
      triggerHaptic('success');

      // Check if device GPS is inside Ambajogai delivery envelope
      const sCheck = checkDeliveryServiceability(coords);

      if (!sCheck.isServiceable) {
        // Device is located in another city (e.g. testing from Nagpur/Pune)
        setGpsError(
          `Live GPS detected (${sCheck.distanceKm} km away). Yogeshwari Dairy currently delivers within 25 km of Ambajogai. Map centered on Ambajogai Mandi Bazar for your order.`
        );
        setSelectedCoords(AMBAJOGAI_CENTER);
        setStreet('Mandi Bazar, Mangalwar Peth Road');
        setArea('Mandi Bazar');
        setLandmark('Near Yogeshwari Dairy');
        setCity('Ambajogai');
        setState('Maharashtra');
        setPincode('431517');
        setLiveAddressSummary('Yogeshwari Dairy Products, Mandi Bazar, Ambajogai - 431517');
      } else {
        setSelectedCoords(coords);
        // Reverse geocode to autofill address parts
        const details = await reverseGeocode(coords.lat, coords.lng);
        if (details.houseNumber) setHouseNo(details.houseNumber);
        if (details.building) setBuilding(details.building);
        if (details.street) setStreet(details.street);
        if (details.area) setArea(details.area);
        if (details.pincode) setPincode(details.pincode);
        if (details.city) setCity(details.city);

        const summary = [details.street, details.area, details.city, details.pincode]
          .filter(Boolean)
          .join(', ');
        setLiveAddressSummary(summary || `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`);
      }
    } catch (err: any) {
      setGpsError(err.message || 'Location permission denied. Please select on map or enter manually.');
      triggerHaptic('warning');
    } finally {
      setIsLocating(false);
    }
  };

  // Debounced map center movement handler
  const handleMapLocationChange = (newCoords: GeoCoordinates) => {
    setSelectedCoords(newCoords);
    if (reverseTimeoutRef.current) {
      clearTimeout(reverseTimeoutRef.current);
    }
    reverseTimeoutRef.current = setTimeout(async () => {
      try {
        const details = await reverseGeocode(newCoords.lat, newCoords.lng);
        if (details.street) setStreet(details.street);
        if (details.area) setArea(details.area);
        if (details.pincode) setPincode(details.pincode);
        if (details.city) setCity(details.city);
        if (details.houseNumber && !houseNo) setHouseNo(details.houseNumber);
        if (details.building && !building) setBuilding(details.building);

        const summary = [details.street, details.area, details.city, details.pincode]
          .filter(Boolean)
          .join(', ');
        setLiveAddressSummary(summary || `${newCoords.lat.toFixed(4)}, ${newCoords.lng.toFixed(4)}`);
      } catch (e) {
        // Non-blocking fallback
      }
    }, 350);
  };

  // Instant Ambajogai Landmark Selection
  const handleSelectLandmarkPreset = (landmarkPreset: LandmarkPreset) => {
    triggerHaptic('light');
    const coords = { lat: landmarkPreset.lat, lng: landmarkPreset.lng };
    setSelectedCoords(coords);
    setStreet(landmarkPreset.landmark);
    setArea(landmarkPreset.area);
    setLandmark(`Near ${landmarkPreset.name}`);
    setCity('Ambajogai');
    setState('Maharashtra');
    setPincode(landmarkPreset.pincode);
    setLiveAddressSummary(`${landmarkPreset.name}, ${landmarkPreset.area}, Ambajogai - ${landmarkPreset.pincode}`);
  };

  // Perform search query with Nominatim
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
    if (result.houseNumber) setHouseNo(result.houseNumber);
    if (result.building) setBuilding(result.building);
    if (result.street) setStreet(result.street);
    if (result.area) setArea(result.area);
    if (result.pincode) setPincode(result.pincode);
    if (result.city) setCity(result.city);
    setLiveAddressSummary(result.displayName);
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
      setFormError(phoneVal.error || 'Valid 10-digit mobile number is required');
      triggerHaptic('warning');
      return;
    }

    const streetVal = validateStreetAddress(street);
    if (!streetVal.isValid) {
      setFormError(streetVal.error || 'Street / Road details are required');
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
      building: building.trim(),
      street: street.trim(),
      area: area.trim(),
      landmark: landmark.trim(),
      city: city.trim() || 'Ambajogai',
      state: state.trim() || 'Maharashtra',
      pincode: pincode.trim(),
      latitude: selectedCoords.lat,
      longitude: selectedCoords.lng,
      isConfirmedOnMap: isPinConfirmed,
      isDefault,
      deliveryInstructions: deliveryInstructions.trim(),
    };

    if (editingAddressId) {
      updateAddress(editingAddressId, addressPayload);
      if (isDefault) {
        setDefaultAddress(editingAddressId);
      } else {
        setSelectedAddressId(editingAddressId);
      }
    } else {
      addAddress(addressPayload);
    }

    setViewMode('list');
    onClose();
  };

  const getLabelIcon = (type: string) => {
    switch (type) {
      case 'Home':
        return <Home className="w-4 h-4 text-emerald-600" />;
      case 'Work':
        return <Briefcase className="w-4 h-4 text-blue-600" />;
      case 'Shop':
        return <Store className="w-4 h-4 text-purple-600" />;
      default:
        return <MapPin className="w-4 h-4 text-amber-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-fade-in">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-float p-4 sm:p-6 z-10 animate-slide-up max-h-[92vh] flex flex-col pb-safe">
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
                  : 'Complete Delivery Details'}
              </h3>
              <p className="text-[11px] text-brand-text-muted">
                {viewMode === 'map-picker'
                  ? 'Drag pin to your doorstep'
                  : 'Yogeshwari Dairy Fast Local Delivery'}
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
            className="w-10 h-10 rounded-full bg-[#F4F6F8] flex items-center justify-center text-brand-text-secondary hover:text-black cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* VIEW MODE 1: SAVED ADDRESSES LIST */}
        {viewMode === 'list' && (
          <div className="overflow-y-auto no-scrollbar space-y-3 pb-2 flex-1">
            {savedAddresses.length === 0 && (
              <div className="py-7 px-4 text-center bg-[#F4F6F8] rounded-2xl border border-brand-slate-border mb-2">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#0C831F] mx-auto mb-2.5 shadow-xs">
                  <MapPin className="w-6 h-6" />
                </div>
                <h4 className="font-extrabold text-sm text-slate-900">No Saved Delivery Address</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
                  Pin your exact doorstep in Ambajogai on the map for 20-40 min fresh dairy delivery.
                </p>
              </div>
            )}

            {savedAddresses.map((addr) => {
              const isSelected = addr.id === selectedAddressId;
              const hasCoordinates = Boolean(addr.latitude && addr.longitude);
              const addrService = checkDeliveryServiceability(
                hasCoordinates ? { lat: addr.latitude!, lng: addr.longitude! } : null
              );

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
                    <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                      {getLabelIcon(addr.label)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
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
                        {hasCoordinates && (
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                              addrService.isServiceable
                                ? 'bg-green-50 text-green-700'
                                : 'bg-rose-50 text-rose-700'
                            }`}
                          >
                            {addrService.zoneName}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-brand-text-secondary mt-1 leading-snug">
                        {addr.houseNo ? `${addr.houseNo}, ` : ''}
                        {addr.building ? `${addr.building}, ` : ''}
                        {addr.street}
                        {addr.area ? `, ${addr.area}` : ''}
                        {addr.landmark ? `, Near ${addr.landmark}` : ''}
                      </p>

                      <p className="text-[11px] text-brand-text-muted mt-0.5">
                        {addr.city} - {addr.pincode} &bull; Ph: {addr.phone}
                      </p>

                      {addr.deliveryInstructions && (
                        <div className="mt-1 text-[10px] text-brand-text-secondary flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200/60">
                          <FileText className="w-2.5 h-2.5 text-slate-500" />
                          <span className="truncate">Note: {addr.deliveryInstructions}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => handleStartEdit(addr, e)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Edit address"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDelete(addr.id, e)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete address"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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

            {/* Action Buttons */}
            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={handleStartAddNew}
                className="w-full min-h-[48px] py-3 border-2 border-dashed border-[#0C831F] text-[#0C831F] hover:bg-brand-green-light/30 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-colors bg-brand-green-light/10 shadow-xs cursor-pointer"
              >
                <MapPin className="w-4 h-4" />
                <span>Choose Delivery Location on Map</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  handleStartAddNew();
                  setViewMode('address-form');
                }}
                className="w-full py-2 text-xs font-semibold text-brand-text-muted hover:text-brand-text-primary text-center cursor-pointer"
              >
                Or enter address manually without map
              </button>
            </div>
          </div>
        )}

        {/* VIEW MODE 2: INTERACTIVE LEAFLET MAP PICKER */}
        {viewMode === 'map-picker' && (
          <div className="space-y-2.5 overflow-y-auto no-scrollbar flex-1 pb-2">
            {/* Search Input for OpenStreetMap Nominatim */}
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search area, street or landmark in Ambajogai..."
                className="w-full text-xs pl-8 pr-16 py-2.5 rounded-xl border border-brand-slate-border focus:ring-1 focus:ring-[#0C831F] focus:outline-none min-h-[42px] bg-slate-50/50"
              />
              <Search className="w-4 h-4 text-brand-text-muted absolute left-2.5 top-3" />
              <button
                type="submit"
                disabled={isSearching}
                className="absolute right-1.5 top-1.5 px-3 py-1.5 rounded-lg bg-[#0C831F] text-white text-[11px] font-bold disabled:opacity-50 cursor-pointer shadow-xs"
              >
                {isSearching ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Search'}
              </button>
            </form>

            {/* Search Autocomplete Dropdown */}
            {searchResults.length > 0 && (
              <div className="bg-white border border-brand-slate-border rounded-xl shadow-lg p-1.5 space-y-1 max-h-40 overflow-y-auto">
                {searchResults.map((res) => (
                  <button
                    key={res.placeId}
                    type="button"
                    onClick={() => handleSelectSearchResult(res)}
                    className="w-full text-left p-2 rounded-lg hover:bg-slate-50 text-xs flex items-start gap-2 text-brand-text-primary cursor-pointer"
                  >
                    <MapPin className="w-3.5 h-3.5 text-[#0C831F] shrink-0 mt-0.5" />
                    <span className="truncate">{res.displayName}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Quick 1-Tap Ambajogai Landmark Chips */}
            <div>
              <div className="flex items-center justify-between mb-1 px-0.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Ambajogai Quick Landmarks
                </span>
                <span className="text-[9px] text-slate-400">1-Tap Pin</span>
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {AMBAJOGAI_LANDMARKS.map((lm) => (
                  <button
                    key={lm.id}
                    type="button"
                    onClick={() => handleSelectLandmarkPreset(lm)}
                    className="shrink-0 px-2.5 py-1 rounded-xl bg-slate-100/90 hover:bg-emerald-50 hover:text-emerald-800 text-[11px] font-semibold text-slate-700 border border-slate-200 transition-colors flex items-center gap-1.5 active:scale-95 cursor-pointer"
                  >
                    <span>{lm.icon}</span>
                    <span>{lm.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Use GPS Button */}
            <button
              type="button"
              disabled={isLocating}
              onClick={handleUseCurrentLocation}
              className="w-full py-2.5 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 text-xs font-bold flex items-center justify-center gap-2 transition-colors min-h-[40px] cursor-pointer"
            >
              {isLocating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                  <span>Locking onto Live GPS Satellite Signal...</span>
                </>
              ) : (
                <>
                  <Navigation className="w-3.5 h-3.5 text-blue-600" />
                  <span>Use My Live Device GPS Location</span>
                </>
              )}
            </button>

            {/* GPS Error Notification */}
            {gpsError && (
              <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-xl text-[11px] text-amber-800 flex items-start gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                <span>{gpsError}</span>
              </div>
            )}

            {/* Interactive Leaflet Map Container */}
            <LeafletMapPicker
              initialCoords={selectedCoords}
              deviceCoords={deviceCoords}
              onLocationChange={handleMapLocationChange}
              onDeviceLocated={(coords) => {
                setDeviceCoords(coords);
                setSelectedCoords(coords);
              }}
              height="280px"
            />

            {/* Live Address Preview Card */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 font-bold text-sm">
                📍
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-emerald-700 uppercase tracking-wider">
                    Selected Delivery Point
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 font-semibold">
                    {selectedCoords.lat.toFixed(4)}, {selectedCoords.lng.toFixed(4)}
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-900 truncate mt-0.5">
                  {liveAddressSummary}
                </p>
                <p className="text-[10px] text-slate-500">
                  Doorstep dairy order will be dispatched to this pin
                </p>
              </div>
            </div>

            {/* Out of Delivery Zone Alert */}
            {!serviceCheck.isServiceable && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Outside Delivery Network:</span>
                  <span>{serviceCheck.message}</span>
                </div>
              </div>
            )}

            {/* Confirm Pin Action */}
            <div className="pt-1 flex gap-2">
              <button
                type="button"
                onClick={() => setViewMode('address-form')}
                className="flex-1 min-h-[46px] py-2.5 rounded-xl border border-brand-slate-border text-xs font-bold text-brand-text-secondary hover:bg-slate-50 cursor-pointer"
              >
                Manual Address
              </button>
              <button
                type="button"
                onClick={handleConfirmMapPin}
                className="flex-2 min-h-[46px] py-2.5 rounded-xl bg-[#0C831F] text-white text-xs font-bold hover:bg-[#086617] flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Confirm Pin & Enter Doorstep Details</span>
              </button>
            </div>
          </div>
        )}

        {/* VIEW MODE 3: FULL DELIVERY ADDRESS FORM */}
        {viewMode === 'address-form' && (
          <form onSubmit={handleSaveAddress} className="space-y-3 overflow-y-auto no-scrollbar flex-1 pb-2">
            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-2.5 rounded-xl text-xs font-medium">
                {formError}
              </div>
            )}

            {/* Pin Confirmation Status Banner */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-brand-slate-border text-[11px]">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#0C831F]" />
                <span className="font-semibold text-brand-text-primary">
                  {isPinConfirmed
                    ? `Pin Confirmed (${selectedCoords.lat.toFixed(4)}, ${selectedCoords.lng.toFixed(4)})`
                    : 'Manual Address (No Map Pin)'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setViewMode('map-picker')}
                className="text-[#0C831F] font-bold hover:underline cursor-pointer"
              >
                {isPinConfirmed ? 'Change Pin' : 'Select on Map'}
              </button>
            </div>

            {/* Serviceability Status Indicator */}
            {isPinConfirmed && (
              <div
                className={`p-2 rounded-xl text-xs flex items-center gap-1.5 ${
                  serviceCheck.isServiceable
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span>{serviceCheck.badgeText} &bull; {serviceCheck.zoneName}</span>
              </div>
            )}

            {/* Address Type Tag (Home / Work / Shop / Other) */}
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
                    className={`min-h-[38px] py-1.5 text-xs font-bold rounded-lg border text-center transition-all cursor-pointer ${
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

            {/* Recipient Details: Full Name & Mobile */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold text-brand-text-primary block mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Enter full name"
                  className="w-full text-xs p-2.5 rounded-xl border border-brand-slate-border focus:ring-1 focus:ring-[#0C831F] focus:outline-none min-h-[42px]"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-brand-text-primary block mb-1">
                  10-Digit Mobile <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 10-digit mobile number"
                  className="w-full text-xs p-2.5 rounded-xl border border-brand-slate-border focus:ring-1 focus:ring-[#0C831F] focus:outline-none min-h-[42px]"
                />
              </div>
            </div>

            {/* House / Flat & Building / Apartment */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold text-brand-text-primary block mb-1">
                  House / Flat Number
                </label>
                <input
                  type="text"
                  value={houseNo}
                  onChange={(e) => setHouseNo(e.target.value)}
                  placeholder="e.g. Flat 302 / House 12"
                  className="w-full text-xs p-2.5 rounded-xl border border-brand-slate-border focus:ring-1 focus:ring-[#0C831F] focus:outline-none min-h-[42px]"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-brand-text-primary block mb-1">
                  Building / Apartment
                </label>
                <input
                  type="text"
                  value={building}
                  onChange={(e) => setBuilding(e.target.value)}
                  placeholder="e.g. Sai Complex / Gokul Heights"
                  className="w-full text-xs p-2.5 rounded-xl border border-brand-slate-border focus:ring-1 focus:ring-[#0C831F] focus:outline-none min-h-[42px]"
                />
              </div>
            </div>

            {/* Street / Road & Area / Locality */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold text-brand-text-primary block mb-1">
                  Street / Road <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="e.g. Mandi Bazar / Mangalwar Peth Rd"
                  className="w-full text-xs p-2.5 rounded-xl border border-brand-slate-border focus:ring-1 focus:ring-[#0C831F] focus:outline-none min-h-[42px]"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-brand-text-primary block mb-1">
                  Area / Locality
                </label>
                <input
                  type="text"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="e.g. Mandi Bazar / Gawli Pura"
                  className="w-full text-xs p-2.5 rounded-xl border border-brand-slate-border focus:ring-1 focus:ring-[#0C831F] focus:outline-none min-h-[42px]"
                />
              </div>
            </div>

            {/* Landmark & PIN Code */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold text-brand-text-primary block mb-1">
                  Nearby Landmark
                </label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="e.g. Near Masjid / Yogeshwari Mandir"
                  className="w-full text-xs p-2.5 rounded-xl border border-brand-slate-border focus:ring-1 focus:ring-[#0C831F] focus:outline-none min-h-[42px]"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-brand-text-primary block mb-1">
                  6-Digit PIN Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 431517"
                  className="w-full text-xs p-2.5 rounded-xl border border-brand-slate-border focus:ring-1 focus:ring-[#0C831F] focus:outline-none min-h-[42px]"
                />
              </div>
            </div>

            {/* City & State */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold text-brand-text-primary block mb-1">
                  City
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
                  State
                </label>
                <input
                  type="text"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-brand-slate-border bg-gray-50 focus:outline-none min-h-[42px]"
                />
              </div>
            </div>

            {/* Delivery Instructions */}
            <div>
              <label className="text-xs font-bold text-brand-text-primary block mb-1">
                Delivery Instructions:
              </label>
              <input
                type="text"
                value={deliveryInstructions}
                onChange={(e) => setDeliveryInstructions(e.target.value)}
                placeholder="e.g. Leave with guard / Ring doorbell twice / Call on arrival"
                className="w-full text-xs p-2.5 rounded-xl border border-brand-slate-border focus:ring-1 focus:ring-[#0C831F] focus:outline-none min-h-[42px]"
              />
            </div>

            {/* Set as Default Checkbox */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="isDefaultAddr"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="w-4 h-4 text-[#0C831F] rounded border-gray-300 focus:ring-[#0C831F] cursor-pointer"
              />
              <label htmlFor="isDefaultAddr" className="text-xs font-medium text-brand-text-primary cursor-pointer">
                Set as my default delivery address
              </label>
            </div>

            {/* Form Actions */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className="flex-1 min-h-[44px] py-2.5 rounded-xl border border-brand-slate-border text-xs font-bold text-brand-text-secondary hover:bg-slate-50 cursor-pointer"
              >
                Back to List
              </button>
              <button
                type="submit"
                className="flex-2 min-h-[44px] py-2.5 rounded-xl bg-[#0C831F] text-white text-xs font-bold hover:bg-[#086617] flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
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
