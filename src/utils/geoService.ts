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

// Yogeshwari Dairy Store Coordinates (Mandi Bazar, Mangalwar Peth Road, near Masjid)
export const STORE_ORIGIN_COORDINATES: GeoCoordinates = {
  lat: 18.7304,
  lng: 76.3879,
};

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
 * Browser Geolocation helper with timeout and friendly error reporting
 */
export async function getUserLocation(): Promise<{ coords: GeoCoordinates; accuracy: number }> {
  if (!navigator.geolocation) {
    throw new Error('Geolocation is not supported by your browser. Please enter your address manually.');
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          coords: {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          },
          accuracy: pos.coords.accuracy,
        });
      },
      (err) => {
        let msg = 'Unable to fetch your device location.';
        if (err.code === err.PERMISSION_DENIED) {
          msg = 'Location permission was denied. You can select your location on the map or type your address manually.';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          msg = 'Location information is currently unavailable. Please check your GPS signal.';
        } else if (err.code === err.TIMEOUT) {
          msg = 'Location request timed out. Please try again or enter your address manually.';
        }
        reject(new Error(msg));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }
    );
  });
}

/**
 * Search places using OpenStreetMap Nominatim
 */
export async function searchAddress(query: string): Promise<GeocodingResult[]> {
  if (!query || query.trim().length < 3) return [];

  try {
    const encoded = encodeURIComponent(`${query.trim()}, Ambajogai, Maharashtra`);
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encoded}&countrycodes=in&limit=5&addressdetails=1`;

    const res = await fetch(url, {
      headers: {
        'Accept-Language': 'en',
      },
    });

    if (!res.ok) return [];

    const data = await res.json();
    if (!Array.isArray(data)) return [];

    return data.map((item: any) => {
      const addr = item.address || {};
      return {
        placeId: String(item.place_id || Math.random()),
        displayName: item.display_name,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        houseNumber: addr.house_number || '',
        street: addr.road || addr.pedestrian || addr.path || '',
        area: addr.suburb || addr.neighbourhood || addr.residential || '',
        city: addr.city || addr.town || addr.village || 'Ambajogai',
        state: addr.state || 'Maharashtra',
        pincode: addr.postcode || '431517',
      };
    });
  } catch (err) {
    console.warn('Geocoding search error:', err);
    return [];
  }
}

/**
 * Reverse geocode coordinates to human-readable address parts
 */
export async function reverseGeocode(lat: number, lng: number): Promise<Partial<GeocodingResult>> {
  if (!isValidCoordinate(lat, lng)) return {};

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`;
    const res = await fetch(url, {
      headers: {
        'Accept-Language': 'en',
      },
    });

    if (!res.ok) return {};

    const data = await res.json();
    const addr = data.address || {};

    return {
      displayName: data.display_name,
      houseNumber: addr.house_number || '',
      street: addr.road || addr.pedestrian || addr.path || '',
      area: addr.suburb || addr.neighbourhood || addr.residential || '',
      city: addr.city || addr.town || addr.village || 'Ambajogai',
      state: addr.state || 'Maharashtra',
      pincode: addr.postcode || '431517',
    };
  } catch (err) {
    console.warn('Reverse geocode error:', err);
    return {};
  }
}
