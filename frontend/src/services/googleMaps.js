import { Loader } from '@googlemaps/js-api-loader';
import { GOOGLE_MAPS_API_KEY } from '../constants';

let loaderInstance = null;
let loadPromise = null;

/**
 * Load Google Maps JavaScript API with required libraries.
 */
export async function loadGoogleMaps() {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error('Google Maps API key is missing. Set VITE_GOOGLE_MAPS_API_KEY in .env');
  }

  if (window.google?.maps) {
    return window.google.maps;
  }

  if (!loaderInstance) {
    loaderInstance = new Loader({
      apiKey: GOOGLE_MAPS_API_KEY,
      version: 'weekly',
      libraries: ['places', 'geometry'],
    });
  }

  if (!loadPromise) {
    loadPromise = loaderInstance.load();
  }

  await loadPromise;
  return window.google.maps;
}

/**
 * Create a PlacesService for a given map instance.
 */
export function createPlacesService(map) {
  return new window.google.maps.places.PlacesService(map);
}

/**
 * Create Autocomplete on an input element.
 */
export function createAutocomplete(inputElement, options = {}) {
  return new window.google.maps.places.Autocomplete(inputElement, {
    fields: ['place_id', 'geometry', 'name', 'formatted_address'],
    ...options,
  });
}

/**
 * Search nearby places using PlacesService.
 */
export function nearbySearch(service, request) {
  return new Promise((resolve, reject) => {
    service.nearbySearch(request, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK) {
        resolve(results || []);
      } else if (status === window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
        resolve([]);
      } else {
        reject(new Error(`Places search failed: ${status}`));
      }
    });
  });
}

/**
 * Text search for places.
 */
export function textSearch(service, request) {
  return new Promise((resolve, reject) => {
    service.textSearch(request, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK) {
        resolve(results || []);
      } else if (status === window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
        resolve([]);
      } else {
        reject(new Error(`Text search failed: ${status}`));
      }
    });
  });
}

/**
 * Get place details by place_id.
 */
export function getPlaceDetails(service, placeId) {
  return new Promise((resolve, reject) => {
    service.getDetails(
      {
        placeId,
        fields: [
          'place_id',
          'name',
          'formatted_address',
          'geometry',
          'rating',
          'user_ratings_total',
          'photos',
          'formatted_phone_number',
          'international_phone_number',
          'website',
          'opening_hours',
          'types',
          'url',
          'vicinity',
        ],
      },
      (place, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          resolve(place);
        } else {
          reject(new Error(`Place details failed: ${status}`));
        }
      }
    );
  });
}

/**
 * Get directions between two points.
 */
export function getDirections(origin, destination, travelMode = 'DRIVING') {
  return new Promise((resolve, reject) => {
    const directionsService = new window.google.maps.DirectionsService();
    directionsService.route(
      {
        origin,
        destination,
        travelMode: window.google.maps.TravelMode[travelMode],
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          resolve(result);
        } else {
          reject(new Error(`Directions failed: ${status}`));
        }
      }
    );
  });
}

/**
 * Geocode an address to lat/lng.
 */
export function geocodeAddress(address) {
  return new Promise((resolve, reject) => {
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address }, (results, status) => {
      if (status === window.google.maps.GeocoderStatus.OK && results[0]) {
        resolve(results[0].geometry.location);
      } else {
        reject(new Error(`Geocoding failed: ${status}`));
      }
    });
  });
}
