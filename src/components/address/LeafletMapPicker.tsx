import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  AMBAJOGAI_CENTER,
  STORE_ORIGIN_COORDINATES,
  GeoCoordinates,
  checkDeliveryServiceability,
  ServiceabilityResult,
  getUserLocation,
} from '@/utils/geoService';
import {
  Maximize2,
  Minimize2,
  Navigation,
  Loader2,
  Plus,
  Minus,
  Store,
  Compass,
} from 'lucide-react';
import { triggerHaptic } from '@/utils/haptics';

interface LeafletMapPickerProps {
  initialCoords?: GeoCoordinates;
  onLocationChange: (coords: GeoCoordinates) => void;
  height?: string;
  deviceCoords?: GeoCoordinates | null;
  onDeviceLocated?: (coords: GeoCoordinates) => void;
}

// Live GPS Pulsing Blue Dot Icon
const liveGpsIcon = L.divIcon({
  className: 'live-device-gps-marker',
  html: `
    <div style="position: relative; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; transform: translate(-50%, -50%);">
      <div style="position: absolute; width: 28px; height: 28px; background: rgba(37, 99, 235, 0.35); border-radius: 50%; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
      <div style="position: absolute; width: 14px; height: 14px; background: #2563EB; border: 2.5px solid #FFFFFF; border-radius: 50%; box-shadow: 0 2px 6px rgba(0,0,0,0.35);"></div>
    </div>
  `,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

// Yogeshwari Dairy Store Origin Icon
const storeOriginIcon = L.divIcon({
  className: 'store-origin-marker',
  html: `
    <div style="position: relative; width: 34px; height: 34px; transform: translate(-50%, -100%);">
      <div style="width: 34px; height: 34px; background: #0C831F; border: 2.5px solid #FFFFFF; border-radius: 50%; box-shadow: 0 4px 10px rgba(12, 131, 31, 0.4); display: flex; align-items: center; justify-content: center; font-size: 16px;">
        🥛
      </div>
      <div style="width: 10px; height: 4px; background: rgba(0,0,0,0.25); border-radius: 50%; position: absolute; bottom: -3px; left: 12px; filter: blur(1px);"></div>
    </div>
  `,
  iconSize: [34, 34],
  iconAnchor: [17, 34],
});

export const LeafletMapPicker: React.FC<LeafletMapPickerProps> = ({
  initialCoords = AMBAJOGAI_CENTER,
  onLocationChange,
  height = '300px',
  deviceCoords: externalDeviceCoords = null,
  onDeviceLocated,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const deviceMarkerRef = useRef<L.Marker | null>(null);
  const deviceAccuracyCircleRef = useRef<L.Circle | null>(null);
  const storeMarkerRef = useRef<L.Marker | null>(null);

  const [centerCoords, setCenterCoords] = useState<GeoCoordinates>(initialCoords);
  const [deviceCoords, setDeviceCoords] = useState<GeoCoordinates | null>(externalDeviceCoords);
  const [isMapMoving, setIsMapMoving] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [serviceInfo, setServiceInfo] = useState<ServiceabilityResult>(() =>
    checkDeliveryServiceability(initialCoords)
  );

  // Sync external deviceCoords prop
  useEffect(() => {
    if (externalDeviceCoords) {
      setDeviceCoords(externalDeviceCoords);
      updateDeviceMarker(externalDeviceCoords);
    }
  }, [externalDeviceCoords]);

  const updateDeviceMarker = useCallback((coords: GeoCoordinates, accuracyMeters?: number) => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (!deviceMarkerRef.current) {
      deviceMarkerRef.current = L.marker([coords.lat, coords.lng], {
        icon: liveGpsIcon,
        interactive: false,
        zIndexOffset: 1000,
      }).addTo(map);
    } else {
      deviceMarkerRef.current.setLatLng([coords.lat, coords.lng]);
    }

    if (accuracyMeters && accuracyMeters > 0) {
      if (!deviceAccuracyCircleRef.current) {
        deviceAccuracyCircleRef.current = L.circle([coords.lat, coords.lng], {
          radius: Math.min(accuracyMeters, 200),
          color: '#2563EB',
          fillColor: '#3B82F6',
          fillOpacity: 0.12,
          weight: 1,
          interactive: false,
        }).addTo(map);
      } else {
        deviceAccuracyCircleRef.current.setLatLng([coords.lat, coords.lng]);
        deviceAccuracyCircleRef.current.setRadius(Math.min(accuracyMeters, 200));
      }
    }
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [initialCoords.lat, initialCoords.lng],
        zoom: 17,
        zoomControl: false, // Custom controls below
        attributionControl: false,
      });

      // Crisp Modern Voyager Retina Tiles with high reliability
      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        {
          attribution: '&copy; OpenStreetMap &copy; CARTO',
          subdomains: 'abcd',
          maxZoom: 20,
        }
      ).addTo(map);

      // Store Origin Marker (Yogeshwari Dairy in Mandi Bazar)
      storeMarkerRef.current = L.marker(
        [STORE_ORIGIN_COORDINATES.lat, STORE_ORIGIN_COORDINATES.lng],
        {
          icon: storeOriginIcon,
          interactive: true,
        }
      )
        .addTo(map)
        .bindTooltip('<b>Yogeshwari Dairy Products</b><br/>Mandi Bazar, Mangalwar Peth', {
          direction: 'top',
          offset: [0, -32],
        });

      // Map Pan / Drag Event Listeners
      map.on('movestart', () => {
        setIsMapMoving(true);
      });

      map.on('moveend', () => {
        setIsMapMoving(false);
        const center = map.getCenter();
        const newCoords: GeoCoordinates = {
          lat: Number(center.lat.toFixed(6)),
          lng: Number(center.lng.toFixed(6)),
        };
        setCenterCoords(newCoords);
        setServiceInfo(checkDeliveryServiceability(newCoords));
        onLocationChange(newCoords);
      });

      mapInstanceRef.current = map;

      // Force recalculation of container size after mounting and animation
      const timer1 = setTimeout(() => map.invalidateSize(), 80);
      const timer2 = setTimeout(() => map.invalidateSize(), 250);
      const timer3 = setTimeout(() => map.invalidateSize(), 500);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        deviceMarkerRef.current = null;
        deviceAccuracyCircleRef.current = null;
        storeMarkerRef.current = null;
      }
    };
  }, []);

  // Invalidate map size on container resize
  useEffect(() => {
    if (!mapContainerRef.current || !mapInstanceRef.current) return;
    const observer = new ResizeObserver(() => {
      mapInstanceRef.current?.invalidateSize();
    });
    observer.observe(mapContainerRef.current);
    return () => observer.disconnect();
  }, []);

  // Update center when initialCoords changes externally (e.g. from landmark preset or search)
  useEffect(() => {
    if (mapInstanceRef.current) {
      const current = mapInstanceRef.current.getCenter();
      const dist = Math.abs(current.lat - initialCoords.lat) + Math.abs(current.lng - initialCoords.lng);
      if (dist > 0.0001) {
        mapInstanceRef.current.flyTo([initialCoords.lat, initialCoords.lng], 17, {
          animate: true,
          duration: 0.9,
        });
        setCenterCoords(initialCoords);
        setServiceInfo(checkDeliveryServiceability(initialCoords));
      }
    }
  }, [initialCoords.lat, initialCoords.lng]);

  // Locate User Device GPS
  const handleLocateMe = async () => {
    if (isLocating) return;
    setIsLocating(true);
    triggerHaptic('medium');

    try {
      const { coords, accuracy } = await getUserLocation();
      setDeviceCoords(coords);
      updateDeviceMarker(coords, accuracy);

      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo([coords.lat, coords.lng], 18, {
          animate: true,
          duration: 1.2,
        });
      }

      setCenterCoords(coords);
      setServiceInfo(checkDeliveryServiceability(coords));
      onLocationChange(coords);
      if (onDeviceLocated) {
        onDeviceLocated(coords);
      }
      triggerHaptic('success');
    } catch (err: any) {
      triggerHaptic('warning');
      alert(err.message || 'Unable to get live GPS location. Please check your browser permission.');
    } finally {
      setIsLocating(false);
    }
  };

  // Fly to Yogeshwari Dairy Store
  const handleGoToStore = () => {
    triggerHaptic('light');
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(
        [STORE_ORIGIN_COORDINATES.lat, STORE_ORIGIN_COORDINATES.lng],
        17,
        { animate: true, duration: 1 }
      );
    }
  };

  // Zoom controls
  const handleZoomIn = () => {
    triggerHaptic('light');
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    triggerHaptic('light');
    mapInstanceRef.current?.zoomOut();
  };

  const toggleExpand = () => {
    triggerHaptic('light');
    setIsExpanded((prev) => !prev);
    setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 200);
  };

  const effectiveHeight = isExpanded ? '460px' : height;

  return (
    <div className="relative rounded-2xl overflow-hidden border border-brand-slate-border shadow-md transition-all duration-300 bg-slate-100 select-none">
      {/* Map Tile Container */}
      <div ref={mapContainerRef} style={{ height: effectiveHeight, width: '100%' }} />

      {/* FIXED CENTER PIN (Swiggy / Blinkit style center screen cursor) */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-[450]">
        <div className="relative flex flex-col items-center">
          {/* Status Tooltip above Pin */}
          <div
            className={`mb-1 px-2.5 py-1 rounded-full text-[10px] font-black tracking-wide shadow-md transition-all duration-200 backdrop-blur-xs flex items-center gap-1.5 ${
              isMapMoving
                ? 'bg-black/85 text-white scale-105 -translate-y-2'
                : 'bg-emerald-600 text-white scale-100'
            }`}
          >
            <span>{isMapMoving ? 'Locating Doorstep...' : 'Deliver Here 📍'}</span>
          </div>

          {/* Animated Center Delivery Pin */}
          <div
            className={`transition-all duration-200 ease-out transform ${
              isMapMoving ? '-translate-y-3.5 scale-110 drop-shadow-xl' : 'translate-y-0 scale-100 drop-shadow-md'
            }`}
          >
            <div className="w-10 h-10 bg-emerald-600 border-2.5 border-white rounded-full rounded-br-none -rotate-45 flex items-center justify-center shadow-lg">
              <span className="rotate-45 text-white text-base">📍</span>
            </div>
          </div>

          {/* Dynamic Pin Ground Contact Shadow */}
          <div
            className={`w-4 h-1.5 bg-black/35 rounded-full filter blur-[1px] transition-all duration-200 ${
              isMapMoving ? 'scale-75 opacity-40' : 'scale-100 opacity-90'
            }`}
            style={{ marginTop: '-2px' }}
          />

          {/* Precision Center Target Crosshair on Map Ground */}
          <div className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white/90 shadow-xs mt-0.5" />
        </div>
      </div>

      {/* TOP FLOATING OVERLAY: Serviceability & View Controls */}
      <div className="absolute top-2.5 left-2.5 right-2.5 z-[400] flex items-center justify-between pointer-events-none gap-2">
        {/* Serviceability Badge */}
        <div
          className={`pointer-events-auto px-3 py-1.5 rounded-xl text-[11px] font-bold shadow-md backdrop-blur-md flex items-center gap-1.5 transition-colors ${
            serviceInfo.isServiceable
              ? serviceInfo.zone === 'EXPRESS'
                ? 'bg-emerald-700/90 text-white border border-emerald-500/50'
                : 'bg-blue-700/90 text-white border border-blue-500/50'
              : 'bg-rose-700/95 text-white border border-rose-500/50'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span>{serviceInfo.badgeText}</span>
        </div>

        {/* Action Controls: Dairy Store & Expand Map */}
        <div className="pointer-events-auto flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleGoToStore}
            className="h-8 px-2.5 rounded-xl bg-white/95 text-emerald-800 hover:bg-emerald-50 shadow-md flex items-center gap-1 text-xs font-bold transition-all active:scale-95 border border-slate-200 cursor-pointer"
            title="View Yogeshwari Dairy Store"
          >
            <Store className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-[10px] hidden xs:inline">Store</span>
          </button>

          <button
            type="button"
            onClick={toggleExpand}
            className="w-8 h-8 rounded-xl bg-white/95 text-slate-700 hover:text-black shadow-md flex items-center justify-center transition-all active:scale-90 border border-slate-200 cursor-pointer"
            title={isExpanded ? 'Collapse Map' : 'Expand Full Map'}
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* RIGHT SIDE FLOATING CONTROLS: Zoom & Live GPS Button */}
      <div className="absolute right-2.5 bottom-12 z-[400] flex flex-col items-center gap-2 pointer-events-none">
        {/* HIGH-PRECISION LIVE GPS BUTTON */}
        <button
          type="button"
          onClick={handleLocateMe}
          disabled={isLocating}
          className={`pointer-events-auto w-10 h-10 rounded-2xl shadow-lg flex items-center justify-center transition-all active:scale-90 cursor-pointer ${
            deviceCoords
              ? 'bg-blue-600 text-white hover:bg-blue-700 ring-2 ring-blue-300'
              : 'bg-white/95 text-slate-800 hover:bg-blue-50 border border-slate-200'
          }`}
          title="Use My Live GPS Location"
        >
          {isLocating ? (
            <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
          ) : (
            <Navigation className={`w-4 h-4 ${deviceCoords ? 'text-white' : 'text-blue-600'}`} />
          )}
        </button>

        {/* Zoom In / Out Buttons */}
        <div className="pointer-events-auto bg-white/95 backdrop-blur-xs rounded-xl shadow-md border border-slate-200 overflow-hidden flex flex-col">
          <button
            type="button"
            onClick={handleZoomIn}
            className="w-8 h-8 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors border-b border-slate-100 cursor-pointer"
            title="Zoom In"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="w-8 h-8 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* BOTTOM FOOTER BAR: Live Coordinates & Pan Hint */}
      <div className="absolute bottom-2 left-2.5 right-2.5 z-[400] flex items-center justify-between pointer-events-none gap-2">
        <div className="pointer-events-auto bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold text-slate-700 border border-slate-200 shadow-sm flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>
            {centerCoords.lat.toFixed(4)}, {centerCoords.lng.toFixed(4)}
          </span>
        </div>

        <div className="bg-black/75 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-xl shadow-sm flex items-center gap-1">
          <Compass className="w-3 h-3 text-emerald-400" />
          <span>Pan map to align doorstep</span>
        </div>
      </div>
    </div>
  );
};
