import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { AMBAJOGAI_CENTER, GeoCoordinates } from '@/utils/geoService';

interface LeafletMapPickerProps {
  initialCoords?: GeoCoordinates;
  onLocationChange: (coords: GeoCoordinates) => void;
  height?: string;
}

// Custom modern SVG Pin for customer delivery location
const customerPinIcon = L.divIcon({
  className: 'custom-customer-pin',
  html: `
    <div style="position: relative; width: 40px; height: 40px; transform: translate(-50%, -100%);">
      <div style="width: 40px; height: 40px; background: #0C831F; border: 3px solid #FFFFFF; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); box-shadow: 0 4px 12px rgba(12, 131, 31, 0.45); display: flex; items-center; justify-content: center;">
        <span style="transform: rotate(45deg); color: #FFFFFF; font-size: 18px; margin-top: -2px;">📍</span>
      </div>
      <div style="width: 12px; height: 6px; background: rgba(0,0,0,0.25); border-radius: 50%; position: absolute; bottom: -4px; left: 14px; filter: blur(1px);"></div>
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
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

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Map if not already created
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
        const newCoords = { lat: Number(pos.lat.toFixed(6)), lng: Number(pos.lng.toFixed(6)) };
        setCoords(newCoords);
        onLocationChange(newCoords);
      });

      map.on('click', (e: L.LeafletMouseEvent) => {
        const newCoords = { lat: Number(e.latlng.lat.toFixed(6)), lng: Number(e.latlng.lng.toFixed(6)) };
        marker.setLatLng([newCoords.lat, newCoords.lng]);
        setCoords(newCoords);
        onLocationChange(newCoords);
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;

      // Invalidate size once rendered
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

  // Update center & marker when initialCoords changes externally (e.g. from GPS or search)
  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.setView([initialCoords.lat, initialCoords.lng], 16, { animate: true });
      markerRef.current.setLatLng([initialCoords.lat, initialCoords.lng]);
      setCoords(initialCoords);
    }
  }, [initialCoords.lat, initialCoords.lng]);

  return (
    <div className="relative rounded-2xl overflow-hidden border border-brand-slate-border shadow-xs">
      <div ref={mapContainerRef} style={{ height, width: '100%' }} />

      {/* Floating Coordinates Tag */}
      <div className="absolute bottom-2 left-2 z-[400] bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-lg text-[10px] font-mono font-semibold text-brand-text-secondary border border-brand-slate-border shadow-xs flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>
          Lat: {coords.lat.toFixed(4)}, Lng: {coords.lng.toFixed(4)}
        </span>
      </div>

      {/* Floating Hint */}
      <div className="absolute top-2 right-2 z-[400] bg-black/70 backdrop-blur-xs text-white text-[10px] font-medium px-2 py-0.5 rounded-md pointer-events-none">
        Tap map or drag pin
      </div>
    </div>
  );
};
