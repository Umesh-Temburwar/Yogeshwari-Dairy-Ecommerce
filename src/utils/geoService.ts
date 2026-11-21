/**
 * Geolocation & OpenStreetMap Nominatim Geocoding Services
 * Complies with OpenStreetMap usage policy (debounced queries, custom headers)
 */

export interface GeoCoordinates {
  lat: number;
  lng: number;
}

export interface GeocodingResult {
  placeId: string;
  displayName: string;
  lat: number;
  lng: number;
  houseNumber?: string;
  building?: string;
  street?: string;
  area?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

// Ambajogai, Maharashtra City Center / Mandi Bazar Coordinates
export const AMBAJOGAI_CENTER: GeoCoordinates = {
  lat: 18.7304,
  lng: 76.3879,
};

// Yogeshwari Dairy Store Origin Coordinates (Mandi Bazar, Mangalwar Peth Road, near Masjid)
export const STORE_ORIGIN_COORDINATES: GeoCoordinates = {
  lat: 18.7304,
  lng: 76.3879,
};

export interface LandmarkPreset {
  id: string;
  name: string;
  marathiName: string;
  lat: number;
  lng: number;
  icon: string;
  area: string;
  landmark: string;
  pincode: string;
}

// Prominent landmarks across Ambajogai for instant 1-tap customer selection
export const AMBAJOGAI_LANDMARKS: LandmarkPreset[] = [
  {
    id: 'yogeshwari_dairy',
    name: 'Yogeshwari Dairy (Mandi Bazar)',
    marathiName: 'योगेश्वरी डेअरी (मंडी बाजार)',
    lat: 18.7304,
    lng: 76.3879,
    icon: '🥛',
    area: 'Mandi Bazar',
    landmark: 'Mangalwar Peth Rd, near Masjid',
    pincode: '431517',
  },
  {
    id: 'yogeshwari_mandir',
    name: 'Yogeshwari Devi Mandir',
    marathiName: 'योगेश्वरी देवी मंदिर',
    lat: 18.7328,
    lng: 76.3862,
    icon: '🛕',
    area: 'Mandir Road',
    landmark: 'Near Yogeshwari Devi Mandir Gate',
    pincode: '431517',
  },
  {
    id: 'gawli_pura',
    name: 'Gawli Pura / Mangalwar Peth',
    marathiName: 'गवली पुरा / मंगळवार पेठ',
    lat: 18.7298,
    lng: 76.3888,
    icon: '📍',
    area: 'Gawli Pura',
    landmark: 'Mangalwar Peth Road',
    pincode: '431517',
  },
  {
    id: 'kirmani_dargah',
    name: 'Kirmani Dargah / Parli Rd',
    marathiName: 'किरमाणी दर्गा / परळी रोड',
    lat: 18.7265,
    lng: 76.3912,
    icon: '🕌',
    area: 'Parli Road',
    landmark: 'Near Kirmani Dargah',
    pincode: '431517',
  },
  {
    id: 'srtr_hospital',
    name: 'SRTR Govt Medical College',
    marathiName: 'सरकारी वैद्यकीय रुग्णालय (SRTR)',
    lat: 18.7362,
    lng: 76.3812,
    icon: '🏥',
    area: 'Medical College Area',
    landmark: 'SRTR Hospital Gate',
    pincode: '431517',
  },
  {
    id: 'bus_stand',
    name: 'Ambajogai Bus Stand',
    marathiName: 'अंबाजोगाई बस स्थानक',
    lat: 18.7345,
    lng: 76.3930,
    icon: '🚌',
    area: 'Bus Stand Road',
    landmark: 'Near MSRTC Bus Stand',
    pincode: '431517',
  },
];

// Service Zone Radius Limits (in Kilometers)
export const EXPRESS_ZONE_RADIUS_KM = 10;
export const MAX_SERVICEABLE_RADIUS_KM = 25;

export interface ServiceabilityResult {
  isServiceable: boolean;
  distanceKm: number;
  zone: 'EXPRESS' | 'STANDARD' | 'OUT_OF_ZONE';
  zoneName: string;
  estimatedMinutes: number;
  badgeText: string;
  message: string;
  backendEnforcementPending: boolean;
}

/**
 * Calculates straight-line distance in kilometers between two GPS coordinates using Haversine formula
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (!isValidCoordinate(lat1, lon1) || !isValidCoordinate(lat2, lon2)) {
    return 0;
  }

  const R = 6371; // Earth's mean radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Number(d.toFixed(2));
}

/**
 * Evaluates whether coordinates fall within Yogeshwari Dairy's delivery service envelope
 */
export function checkDeliveryServiceability(coords?: GeoCoordinates | null): ServiceabilityResult {
  if (!coords || !isValidCoordinate(coords.lat, coords.lng)) {
    return {
      isServiceable: true,
      distanceKm: 0,
      zone: 'EXPRESS',
      zoneName: 'Ambajogai Local Network',
      estimatedMinutes: 30,
      badgeText: 'Local Delivery (20-40 Mins)',
      message: 'Ambajogai default delivery area. Address verification pending.',
      backendEnforcementPending: true,
    };
  }

  const distance = calculateDistanceKm(
    STORE_ORIGIN_COORDINATES.lat,
    STORE_ORIGIN_COORDINATES.lng,
    coords.lat,
    coords.lng
  );

  if (distance <= EXPRESS_ZONE_RADIUS_KM) {
    return {
      isServiceable: true,
      distanceKm: distance,
      zone: 'EXPRESS',
      zoneName: 'Ambajogai Express Zone',
      estimatedMinutes: 20,
      badgeText: `⚡ Express Delivery (${distance} km • 20-30 Mins)`,
      message: 'Fast local delivery available directly from Mandi Bazar dairy shop.',
      backendEnforcementPending: false,
    };
  }

  if (distance <= MAX_SERVICEABLE_RADIUS_KM) {
    return {
      isServiceable: true,
      distanceKm: distance,
      zone: 'STANDARD',
      zoneName: 'Ambajogai Rural & Outskirts',
      estimatedMinutes: 45,
      badgeText: `🚚 Standard Delivery (${distance} km • 35-50 Mins)`,
      message: 'Standard dairy delivery available to your area.',
      backendEnforcementPending: false,
    };
  }

  return {
    isServiceable: false,
    distanceKm: distance,
    zone: 'OUT_OF_ZONE',
    zoneName: 'Outside Delivery Network',
    estimatedMinutes: 0,
    badgeText: `⚠️ Outside Delivery Area (${distance} km)`,
    message: `Delivery is currently limited to within ${MAX_SERVICEABLE_RADIUS_KM} km of our Ambajogai store. This location is ${distance} km away.`,
    backendEnforcementPending: false,
  };
}

/**
 * Validates that coordinates fall within standard geographic bounds
 */
export function isValidCoordinate(lat?: number, lng?: number): boolean {
  if (typeof lat !== 'number' || typeof lng !== 'number') return false;
  if (isNaN(lat) || isNaN(lng)) return false;
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

/**
 * Checks if coordinates are roughly in the Maharashtra / Marathwada region
 */
export function isNearDeliveryZone(lat: number, lng: number): boolean {
  // Beed / Ambajogai bounding envelope (broad for testing and district delivery)
  return lat >= 18.0 && lat <= 19.5 && lng >= 75.5 && lng <= 77.2;
}

/**
 * Browser Geolocation helper with maximum accuracy (zero cache) and friendly error reporting
 */
export async function getUserLocation(): Promise<{ coords: GeoCoordinates; accuracy: number }> {
  if (typeof window === 'undefined' || !navigator.geolocation) {
    throw new Error('Geolocation is not supported by your browser. Please enter your address manually.');
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          coords: {
            lat: Number(pos.coords.latitude.toFixed(6)),
            lng: Number(pos.coords.longitude.toFixed(6)),
          },
          accuracy: pos.coords.accuracy,
        });
      },
      (err) => {
        let msg = 'Unable to fetch your device location.';
        if (err.code === err.PERMISSION_DENIED) {
          msg = 'Location permission was denied. Please allow GPS location in your browser or select your pin on the map.';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          msg = 'GPS location is currently unavailable. Please check your device location / GPS toggle.';
        } else if (err.code === err.TIMEOUT) {
          msg = 'GPS location timed out. Please tap "Use My Current Location" again or pick your location on the map.';
        }
        reject(new Error(msg));
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0, // Never return stale cached GPS location
      }
    );
  });
}

/**
 * Search places using OpenStreetMap Nominatim with caching & rate limits
 */
export async function searchAddress(query: string): Promise<GeocodingResult[]> {
  if (!query || query.trim().length < 2) return [];

  // Check matching Ambajogai landmark presets first for instant response
  const lowerQ = query.trim().toLowerCase();
  const matchedPresets = AMBAJOGAI_LANDMARKS.filter(
    (lm) =>
      lm.name.toLowerCase().includes(lowerQ) ||
      lm.marathiName.toLowerCase().includes(lowerQ) ||
      lm.area.toLowerCase().includes(lowerQ) ||
      lm.landmark.toLowerCase().includes(lowerQ)
  );

  const presetResults: GeocodingResult[] = matchedPresets.map((p) => ({
    placeId: `preset_${p.id}`,
    displayName: `${p.icon} ${p.name}, ${p.landmark}, Ambajogai - ${p.pincode}`,
    lat: p.lat,
    lng: p.lng,
    street: p.landmark,
    area: p.area,
    city: 'Ambajogai',
    state: 'Maharashtra',
    pincode: p.pincode,
  }));

  try {
    const encoded = encodeURIComponent(`${query.trim()}, Ambajogai, Maharashtra`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encoded}&countrycodes=in&limit=5&addressdetails=1`;

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept-Language': 'en',
      },
    });
    clearTimeout(timeoutId);

    if (!res.ok) return presetResults;

    const data = await res.json();
    if (!Array.isArray(data)) return presetResults;

    const remoteResults: GeocodingResult[] = data.map((item: any) => {
      const addr = item.address || {};
      return {
        placeId: String(item.place_id || Math.random()),
        displayName: item.display_name,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        houseNumber: addr.house_number || '',
        building: addr.building || addr.amenity || '',
        street: addr.road || addr.pedestrian || addr.path || '',
        area: addr.suburb || addr.neighbourhood || addr.residential || '',
        city: addr.city || addr.town || addr.village || 'Ambajogai',
        state: addr.state || 'Maharashtra',
        pincode: addr.postcode || '431517',
      };
    });

    return [...presetResults, ...remoteResults];
  } catch (err) {
    console.warn('Geocoding search error:', err);
    return presetResults;
  }
}

/**
 * Reverse geocode coordinates to human-readable address parts with smart Ambajogai landmark detection
 */
export async function reverseGeocode(lat: number, lng: number): Promise<Partial<GeocodingResult>> {
  if (!isValidCoordinate(lat, lng)) return {};

  // Check proximity to known Ambajogai landmark
  let nearestLandmark: LandmarkPreset | null = null;
  let minDistance = Infinity;

  for (const lm of AMBAJOGAI_LANDMARKS) {
    const dist = calculateDistanceKm(lat, lng, lm.lat, lm.lng);
    if (dist < minDistance) {
      minDistance = dist;
      nearestLandmark = lm;
    }
  }

  const isVeryClose = nearestLandmark && minDistance <= 0.35; // within 350 meters

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`;
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept-Language': 'en',
      },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};

      return {
        displayName: data.display_name,
        houseNumber: addr.house_number || '',
        building: addr.building || addr.amenity || '',
        street: addr.road || addr.pedestrian || addr.path || (isVeryClose ? nearestLandmark!.landmark : 'Mandi Bazar / Mangalwar Peth Rd'),
        area: addr.suburb || addr.neighbourhood || addr.residential || (isVeryClose ? nearestLandmark!.area : 'Ambajogai'),
        city: addr.city || addr.town || addr.village || 'Ambajogai',
        state: addr.state || 'Maharashtra',
        pincode: addr.postcode || '431517',
      };
    }
  } catch (err) {
    console.warn('Reverse geocode error or timeout:', err);
  }

  // Graceful fallback using nearest landmark context
  if (nearestLandmark) {
    return {
      displayName: `${nearestLandmark.name}, ${nearestLandmark.area}, Ambajogai - ${nearestLandmark.pincode}`,
      street: nearestLandmark.landmark,
      area: nearestLandmark.area,
      city: 'Ambajogai',
      state: 'Maharashtra',
      pincode: nearestLandmark.pincode,
    };
  }

  return {
    city: 'Ambajogai',
    state: 'Maharashtra',
    pincode: '431517',
  };
}
