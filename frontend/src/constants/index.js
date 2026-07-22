export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const PLACE_CATEGORIES = [
  { value: 'all', label: 'All Places' },
  { value: 'hospital', label: 'Hospitals', type: 'hospital' },
  { value: 'park', label: 'Parks', type: 'park' },
  { value: 'restaurant', label: 'Restaurants', type: 'restaurant' },
  { value: 'hotel', label: 'Hotels', type: 'lodging' },
  { value: 'school', label: 'Schools', type: 'school' },
  { value: 'temple', label: 'Temples', type: 'hindu_temple' },
  { value: 'atm', label: 'ATMs', type: 'atm' },
  { value: 'gas_station', label: 'Petrol Stations', type: 'gas_station' },
  { value: 'shopping_mall', label: 'Shopping Malls', type: 'shopping_mall' },
  { value: 'airport', label: 'Airports', type: 'airport' },
  { value: 'tourist_attraction', label: 'Tourist Attractions', type: 'tourist_attraction' },
  { value: 'beach', label: 'Beaches', type: 'natural_feature' },
];

export const DISTANCE_OPTIONS = [
  { value: 1000, label: '1 km' },
  { value: 2000, label: '2 km' },
  { value: 5000, label: '5 km' },
  { value: 10000, label: '10 km' },
  { value: 25000, label: '25 km' },
  { value: 50000, label: '50 km' },
];

export const RATING_OPTIONS = [
  { value: 0, label: 'Any rating' },
  { value: 3, label: '3+ stars' },
  { value: 3.5, label: '3.5+ stars' },
  { value: 4, label: '4+ stars' },
  { value: 4.5, label: '4.5+ stars' },
];

export const DEFAULT_CENTER = { lat: 28.6139, lng: 77.209 }; // New Delhi fallback
