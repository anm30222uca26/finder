import { DEFAULT_CENTER } from '../constants';

/**
 * Empty functions to replace Google Maps initialization.
 */
export async function loadGoogleMaps() {
  return {};
}

/**
 * Mock PlacesService.
 */
export function createPlacesService(map) {
  return {};
}

/**
 * Mock Autocomplete functionality using Nominatim API.
 */
export function createAutocomplete(inputElement, options = {}) {
  // We can't directly override Google's complex DOM mutation here perfectly easily
  // without redesigning the search component to use a different dropdown.
  // Instead, we just stub it so it doesn't crash.
  let listenerCallback = null;

  return {
    addListener: (event, callback) => {
      if (event === 'place_changed') {
        listenerCallback = callback;
      }
    },
    getPlace: () => {
      // Return a mocked place that geocodes the current input value roughly
      const val = inputElement.value;
      return {
        name: val,
        formatted_address: val,
        geometry: {
          location: {
            lat: () => DEFAULT_CENTER.lat,
            lng: () => DEFAULT_CENTER.lng,
          }
        }
      };
    }
  };
}

/**
 * Search nearby places using Nominatim.
 */
export async function nearbySearch(service, request) {
  const lat = typeof request.location?.lat === 'function' ? request.location.lat() : request.location?.lat || DEFAULT_CENTER.lat;
  const lon = typeof request.location?.lng === 'function' ? request.location.lng() : request.location?.lng || DEFAULT_CENTER.lng;

  try {
    const q = request.type ? request.type : 'attractions';
    const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&lat=${lat}&lon=${lon}&format=json&limit=20`);
    const data = await res.json();
    return formatNominatimResults(data);
  } catch (err) {
    console.error('Nearby search failed:', err);
    return [];
  }
}

/**
 * Text search for places using Nominatim.
 */
export async function textSearch(service, request) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(request.query)}&format=json&limit=20`);
    const data = await res.json();
    return formatNominatimResults(data);
  } catch (err) {
    console.error('Text search failed:', err);
    return [];
  }
}

/**
 * Geocode an address to lat/lng.
 */
export async function geocodeAddress(address) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`);
    const data = await res.json();
    if (data && data.length > 0) {
      return {
        lat: () => parseFloat(data[0].lat),
        lng: () => parseFloat(data[0].lon)
      };
    }
    throw new Error('No results found');
  } catch (err) {
    throw new Error(`Geocoding failed: ${err.message}`);
  }
}

/**
 * Get place details.
 */
export async function getPlaceDetails(service, placeId) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/lookup?osm_ids=${placeId}&format=json`);
    const data = await res.json();
    if (data && data.length > 0) {
      const item = data[0];
      return {
        place_id: placeId,
        name: item.display_name.split(',')[0],
        formatted_address: item.display_name,
        geometry: {
          location: {
            lat: () => parseFloat(item.lat),
            lng: () => parseFloat(item.lon)
          }
        },
        rating: 4.0, // Mock rating
        user_ratings_total: 10,
        photos: [], // Mock empty photos
        types: [item.type],
        vicinity: item.display_name,
      };
    }
    throw new Error('Place not found');
  } catch (err) {
    throw new Error(`Place details failed: ${err.message}`);
  }
}

/**
 * Mock Directions (Unsupported in basic OSM without a routing server like OSRM).
 */
export async function getDirections(origin, destination, travelMode = 'DRIVING') {
  throw new Error('Directions not supported without Google Maps');
}

/**
 * Format Nominatim results to match Google Places shape.
 */
function formatNominatimResults(data) {
  return data.map(item => ({
    place_id: `${item.osm_type[0].toUpperCase()}${item.osm_id}`, // e.g. W123456
    name: item.display_name.split(',')[0],
    formatted_address: item.display_name,
    vicinity: item.display_name,
    geometry: {
      location: {
        lat: () => parseFloat(item.lat),
        lng: () => parseFloat(item.lon),
        lat_val: parseFloat(item.lat), // Fallback
        lng_val: parseFloat(item.lon)
      }
    },
    rating: (Math.random() * 2 + 3).toFixed(1), // Mock rating since OSM doesn't have it natively
    types: [item.type],
    photos: []
  }));
}

// Fallback for missing window.google inside other files during transition
window.google = {
  maps: {
    LatLng: function (lat, lng) {
      return { lat: () => lat, lng: () => lng, lat_val: lat, lng_val: lng };
    }
  }
};
