import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  AMBAJOGAI_CENTER,
  GeoCoordinates,
  checkDeliveryServiceability,
  ServiceabilityResult,
} from '@/utils/geoService';
import { Compass, Maximize2, Minimize2 } from 'lucide-react';

interface LeafletMapPickerProps {
  initialCoords?: GeoCoordinates;
  onLocationChange: (coords: GeoCoordinates) => void;
  height?: string;
}

// Custom modern SVG Pin for customer delivery location
const customerPinIcon = L.divIcon({
  className: 'custom-customer-pin',
  html: `
    <div style="position: relative; width: 44px; height: 44px; transform: translate(-50%, -100%);">
      <div style="width: 44px; height: 44px; background: #0C831F; border: 3px solid #FFFFFF; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); box-shadow: 0 6px 16px rgba(12, 131, 31, 0.45); display: flex; align-items: center; justify-content: center;">
        <span style="transform: rotate(45deg); color: #FFFFFF; font-size: 20px; margin-top: -3px;">📍</span>
      </div>
      <div style="width: 14px; height: 6px; background: rgba(0,0,0,0.3); border-radius: 50%; position: absolute; bottom: -4px; left: 15px; filter: blur(1.5px);"></div>
    </div>
  `,
  iconSize: [44, 44],
  iconAnchor: [22, 44],
});

export const LeafletMapPicker: React.FC<LeafletMapPickerProps> = ({
  initialCoords = AMBAJOGAI_CENTER,
  onLocationChange,
  height = '280px',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const [coords, setCoords] = useState<GeoCoordinates>(initialCoords);
  const [isExpanded, setIsExpanded] = useState(false);
  const [serviceInfo, setServiceInfo] = useState<ServiceabilityResult>(() =>
    checkDeliveryServiceability(initialCoords)
  );

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [initialCoords.lat, initialCoords.lng],
        zoom: 16,
        zoomControl: true,
        attributionControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      const marker = L.marker([initialCoords.lat, initialCoords.lng], {
        icon: customerPinIcon,
        draggable: true,
      }).addTo(map);

      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        const newCoords = {
          lat: Number(pos.lat.toFixed(6)),
          lng: Number(pos.lng.toFixed(6)),
        };
        setCoords(newCoords);
        setServiceInfo(checkDeliveryServiceability(newCoords));
        onLocationChange(newCoords);
      });

      map.on('click', (e: L.LeafletMouseEvent) => {
        const newCoords = {
          lat: Number(e.latlng.lat.toFixed(6)),
          lng: Number(e.latlng.lng.toFixed(6)),
        };
        marker.setLatLng([newCoords.lat, newCoords.lng]);
        setCoords(newCoords);
        setServiceInfo(checkDeliveryServiceability(newCoords));
        onLocationChange(newCoords);
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;

      setTimeout(() => {
        map.invalidateSize();
      }, 250);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  // Update center & marker when initialCoords changes externally
  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.setView([initialCoords.lat, initialCoords.lng], 16, { animate: true });
      markerRef.current.setLatLng([initialCoords.lat, initialCoords.lng]);
      setCoords(initialCoords);
      setServiceInfo(checkDeliveryServiceability(initialCoords));
    }
  }, [initialCoords.lat, initialCoords.lng]);

  const handleRecenter = () => {
    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.setView([coords.lat, coords.lng], 16, { animate: true });
    }
  };

  const toggleExpand = () => {
    setIsExpanded((prev) => !prev);
    setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 200);
  };

  const effectiveHeight = isExpanded ? '440px' : height;

  return (
    <div className="relative rounded-2xl overflow-hidden border border-brand-slate-border shadow-xs transition-all duration-300">
      <div ref={mapContainerRef} style={{ height: effectiveHeight, width: '100%' }} />

      {/* Top Bar: Serviceability & Expand Controls */}
      <div className="absolute top-2 left-2 right-2 z-[400] flex items-center justify-between pointer-events-none gap-2">
        {/* Serviceability Badge */}
        <div
          className={`pointer-events-auto px-2.5 py-1 rounded-xl text-[10px] font-bold shadow-xs backdrop-blur-xs flex items-center gap-1.5 ${
            serviceInfo.isServiceable
              ? serviceInfo.zone === 'EXPRESS'
                ? 'bg-emerald-600/90 text-white'
                : 'bg-blue-600/90 text-white'
              : 'bg-rose-600/95 text-white'
          }`}
        >
          <span>{serviceInfo.badgeText}</span>
        </div>

        {/* Quick Map Action Controls */}
        <div className="pointer-events-auto flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleRecenter}
            className="w-7 h-7 rounded-lg bg-white/95 text-slate-700 hover:text-black shadow-xs flex items-center justify-center text-xs transition-transform active:scale-90"
            title="Recenter on Pin"
          >
            <Compass className="w-4 h-4 text-emerald-600" />
          </button>
          <button
            type="button"
            onClick={toggleExpand}
            className="w-7 h-7 rounded-lg bg-white/95 text-slate-700 hover:text-black shadow-xs flex items-center justify-center text-xs transition-transform active:scale-90"
            title={isExpanded ? 'Collapse Map' : 'Expand Map'}
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Bottom Coordinates & Drag Tip */}
      <div className="absolute bottom-2 left-2 right-2 z-[400] flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-lg text-[10px] font-mono font-semibold text-brand-text-secondary border border-brand-slate-border shadow-xs flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>
            {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
          </span>
        </div>

        <div className="bg-black/75 backdrop-blur-xs text-white text-[10px] font-medium px-2 py-0.5 rounded-md shadow-xs">
          Drag pin or click map
        </div>
      </div>
    </div>
  );
};
