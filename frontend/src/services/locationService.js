import { DEFAULT_CENTER } from '../constants';

/**
 * Search nearby places using Nominatim.
 */
export async function nearbySearch(request) {
  const lat = request.location?.lat || DEFAULT_CENTER.lat;
  const lon = request.location?.lng || DEFAULT_CENTER.lng;

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
export async function textSearch(request) {
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
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
    }
    throw new Error('No results found');
  } catch (err) {
    throw new Error(`Geocoding failed: ${err.message}`);
  }
}

/**
 * Search places for autocomplete using Nominatim.
 */
export async function autocompleteOptions(query) {
  if (!query) return [];
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`);
    const data = await res.json();
    return data.map(item => ({
      name: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon)
    }));
  } catch (err) {
    console.error('Autocomplete failed:', err);
    return [];
  }
}

/**
 * Get place details.
 */
export async function getPlaceDetails(placeId) {
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
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon)
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
 * Format Nominatim results to match Google Places shape, but simplified.
 */
function formatNominatimResults(data) {
  return data.map(item => ({
    place_id: `${item.osm_type[0].toUpperCase()}${item.osm_id}`, // e.g. W123456
    name: item.display_name.split(',')[0],
    formatted_address: item.display_name,
    vicinity: item.display_name,
    geometry: {
      location: {
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon)
      }
    },
    rating: (Math.random() * 2 + 3).toFixed(1), // Mock rating since OSM doesn't have it natively
    types: [item.type],
    photos: []
  }));
}
