import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useGeolocation } from '../hooks/useGeolocation';
import { useAuth } from '../context/AuthContext';
import { PLACE_CATEGORIES, DEFAULT_CENTER } from '../constants';
import {
  loadGoogleMaps,
  createPlacesService,
  createAutocomplete,
  nearbySearch,
  textSearch,
  getPlaceDetails,
  getDirections,
  geocodeAddress,
} from '../services/googleMaps';
import { favoritesAPI, historyAPI } from '../services/api';
import { getDistanceMeters, getPhotoUrl } from '../utils/helpers';
import { GOOGLE_MAPS_API_KEY } from '../constants';
import GoogleMap from '../components/map/GoogleMap';
import SearchBar from '../components/search/SearchBar';
import SearchFilters from '../components/search/SearchFilters';
import PlaceCard from '../components/places/PlaceCard';
import PlaceDetails from '../components/places/PlaceDetails';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import EmptyState from '../components/common/EmptyState';
import { Search } from 'lucide-react';

export default function HomePage() {
  const location = useLocation();
  const { location: userLocation, refresh: refreshLocation } = useGeolocation();
  const { isAuthenticated } = useAuth();

  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [searchCenter, setSearchCenter] = useState(null);
  const [keyword, setKeyword] = useState('');
  const [locationText, setLocationText] = useState('');
  const [filters, setFilters] = useState({
    category: 'all',
    distance: 5000,
    minRating: 0,
    openNow: false,
  });

  const [places, setPlaces] = useState([]);
  const [filteredPlaces, setFilteredPlaces] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [selectedDetails, setSelectedDetails] = useState(null);
  const [directionsResult, setDirectionsResult] = useState(null);
  const [directionsInfo, setDirectionsInfo] = useState(null);

  const [searchLoading, setSearchLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [error, setError] = useState('');

  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  const locationInputRef = useRef(null);
  const placesServiceRef = useRef(null);
  const mapRef = useRef(null);

  // Handle navigation from favorites/history pages
  useEffect(() => {
    const state = location.state;
    if (!state) return;

    if (state.keyword) setKeyword(state.keyword);
    if (state.location) setLocationText(state.location);
    if (state.category) setFilters((prev) => ({ ...prev, category: state.category }));
    if (state.lat && state.lng) {
      const center = { lat: state.lat, lng: state.lng };
      setSearchCenter(center);
      setMapCenter(center);
    }

    window.history.replaceState({}, document.title);
  }, [location.state]);

  // Set map center from geolocation
  useEffect(() => {
    if (userLocation) {
      setMapCenter(userLocation);
      if (!searchCenter) setSearchCenter(userLocation);
    }
  }, [userLocation, searchCenter]);

  // Setup Google Places Autocomplete
  useEffect(() => {
    let autocomplete = null;

    async function setupAutocomplete() {
      await loadGoogleMaps();
      if (locationInputRef.current) {
        autocomplete = createAutocomplete(locationInputRef.current, {
          types: ['geocode'],
        });
        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          if (place.geometry?.location) {
            const loc = {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
            };
            setSearchCenter(loc);
            setMapCenter(loc);
            setLocationText(place.formatted_address || place.name || '');
          }
        });
      }
    }

    setupAutocomplete();
    return () => {
      if (autocomplete) window.google?.maps?.event?.clearInstanceListeners(autocomplete);
    };
  }, []);

  const onMapReady = useCallback((map) => {
    mapRef.current = map;
    placesServiceRef.current = createPlacesService(map);
  }, []);

  // Apply client-side filters
  useEffect(() => {
    let results = [...places];
    const center = searchCenter || userLocation || DEFAULT_CENTER;

    if (filters.minRating > 0) {
      results = results.filter((p) => (p.rating || 0) >= filters.minRating);
    }

    if (filters.openNow) {
      results = results.filter((p) => p.opening_hours?.open_now === true);
    }

    if (filters.distance && center) {
      results = results.filter((p) => {
        if (!p.geometry?.location) return false;
        const dist = getDistanceMeters(
          center.lat,
          center.lng,
          p.geometry.location.lat(),
          p.geometry.location.lng()
        );
        return dist <= filters.distance;
      });
    }

    setFilteredPlaces(results);
  }, [places, filters, searchCenter, userLocation]);

  const performSearch = async () => {
    setError('');
    setSearchLoading(true);
    setSelectedPlace(null);
    setSelectedDetails(null);
    setDirectionsResult(null);
    setDirectionsInfo(null);

    try {
      await loadGoogleMaps();
      if (!placesServiceRef.current && mapRef.current) {
        placesServiceRef.current = createPlacesService(mapRef.current);
      }
      if (!placesServiceRef.current) {
        throw new Error('Map not ready. Please wait and try again.');
      }

      let center = searchCenter || userLocation || DEFAULT_CENTER;

      // Geocode location text if provided and no autocomplete selection
      if (locationText.trim()) {
        try {
          const geocoded = await geocodeAddress(locationText);
          center = { lat: geocoded.lat(), lng: geocoded.lng() };
          setSearchCenter(center);
          setMapCenter(center);
        } catch {
          // Use existing center if geocoding fails
        }
      }

      const category = PLACE_CATEGORIES.find((c) => c.value === filters.category);
      let results = [];

      if (keyword.trim()) {
        // Text search with keyword
        const query = locationText.trim()
          ? `${keyword} in ${locationText}`
          : `${keyword} near me`;

        results = await textSearch(placesServiceRef.current, {
          query,
          location: new window.google.maps.LatLng(center.lat, center.lng),
          radius: filters.distance,
          openNow: filters.openNow || undefined,
        });
      } else if (category && category.type) {
        // Nearby search by category type
        results = await nearbySearch(placesServiceRef.current, {
          location: new window.google.maps.LatLng(center.lat, center.lng),
          radius: filters.distance,
          type: category.type,
          openNow: filters.openNow || undefined,
        });
      } else {
        // General nearby search
        results = await nearbySearch(placesServiceRef.current, {
          location: new window.google.maps.LatLng(center.lat, center.lng),
          radius: filters.distance,
          openNow: filters.openNow || undefined,
        });
      }

      setPlaces(results);
      setMapCenter(center);

      // Save to history if logged in
      if (isAuthenticated && (keyword.trim() || filters.category !== 'all')) {
        try {
          await historyAPI.add({
            keyword: keyword.trim() || category?.label || 'Nearby places',
            location: locationText || `${center.lat.toFixed(4)}, ${center.lng.toFixed(4)}`,
            category: filters.category,
            lat: center.lat,
            lng: center.lng,
          });
        } catch {
          // Non-critical - don't block search
        }
      }
    } catch (err) {
      setError(err.message || 'Search failed. Please try again.');
      setPlaces([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handlePlaceClick = async (place) => {
    setSelectedPlace(place);
    setDetailsLoading(true);
    setDirectionsResult(null);
    setDirectionsInfo(null);
    setError('');

    try {
      const details = await getPlaceDetails(placesServiceRef.current, place.place_id);
      setSelectedDetails(details);

      if (isAuthenticated) {
        const { data } = await favoritesAPI.check(place.place_id);
        setIsFavorite(data.data.isFavorite);
      }
    } catch (err) {
      setError(err.message || 'Failed to load place details.');
      setSelectedDetails(place);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleGetDirections = async () => {
    if (!selectedDetails || !userLocation) {
      setError('Enable location access to get directions.');
      return;
    }

    try {
      const origin = userLocation;
      const dest = {
        lat: selectedDetails.geometry.location.lat(),
        lng: selectedDetails.geometry.location.lng(),
      };

      const result = await getDirections(origin, dest);
      setDirectionsResult(result);

      const leg = result.routes[0]?.legs[0];
      if (leg) {
        setDirectionsInfo({
          distance: leg.distance.text,
          duration: leg.duration.text,
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to get directions.');
    }
  };

  const handleToggleFavorite = async () => {
    if (!isAuthenticated || !selectedDetails) return;

    setFavoriteLoading(true);
    try {
      if (isFavorite) {
        await favoritesAPI.remove(selectedDetails.place_id);
        setIsFavorite(false);
      } else {
        const photoUrl =
          selectedDetails.photos?.length > 0
            ? getPhotoUrl(selectedDetails.photos[0], GOOGLE_MAPS_API_KEY)
            : '';

        await favoritesAPI.add({
          placeId: selectedDetails.place_id,
          name: selectedDetails.name,
          address: selectedDetails.formatted_address || selectedDetails.vicinity,
          rating: selectedDetails.rating || 0,
          photoUrl,
          lat: selectedDetails.geometry.location.lat(),
          lng: selectedDetails.geometry.location.lng(),
          types: selectedDetails.types || [],
        });
        setIsFavorite(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update favorites.');
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleUseLocation = () => {
    refreshLocation();
    if (userLocation) {
      setSearchCenter(userLocation);
      setMapCenter(userLocation);
      setLocationText('My current location');
    }
  };

  const closeDetails = () => {
    setSelectedPlace(null);
    setSelectedDetails(null);
    setDirectionsResult(null);
    setDirectionsInfo(null);
  };

  return (
    <div className="home-page">
      <aside className="sidebar">
        <SearchBar
          keyword={keyword}
          locationText={locationText}
          onKeywordChange={setKeyword}
          onLocationChange={setLocationText}
          onSearch={performSearch}
          onUseLocation={handleUseLocation}
          locationInputRef={locationInputRef}
          loading={searchLoading}
        />

        <SearchFilters filters={filters} onChange={setFilters} />

        <ErrorMessage message={error} onDismiss={() => setError('')} />

        <div className="results-panel">
          {searchLoading ? (
            <LoadingSpinner message="Searching places..." />
          ) : filteredPlaces.length > 0 ? (
            <>
              <p className="results-count">{filteredPlaces.length} places found</p>
              <div className="place-list">
                {filteredPlaces.map((place) => (
                  <PlaceCard
                    key={place.place_id}
                    place={place}
                    userLocation={userLocation}
                    isSelected={selectedPlace?.place_id === place.place_id}
                    onClick={handlePlaceClick}
                  />
                ))}
              </div>
            </>
          ) : places.length > 0 ? (
            <EmptyState
              title="No matches"
              description="Try adjusting your filters to see more results."
            />
          ) : (
            <EmptyState
              icon={Search}
              title="Search for places"
              description="Enter a keyword or select a category to discover places near you."
            />
          )}
        </div>
      </aside>

      <section className="map-section">
        <GoogleMap
          center={mapCenter}
          places={filteredPlaces}
          selectedPlace={selectedPlace}
          userLocation={userLocation}
          directionsResult={directionsResult}
          onPlaceClick={handlePlaceClick}
          onMapReady={onMapReady}
        />

        {(selectedDetails || detailsLoading) && (
          <div className="details-overlay">
            {detailsLoading ? (
              <LoadingSpinner message="Loading details..." />
            ) : (
              <PlaceDetails
                place={selectedDetails}
                onClose={closeDetails}
                onGetDirections={handleGetDirections}
                onToggleFavorite={handleToggleFavorite}
                isFavorite={isFavorite}
                favoriteLoading={favoriteLoading}
                directionsInfo={directionsInfo}
                isAuthenticated={isAuthenticated}
              />
            )}
          </div>
        )}
      </section>
    </div>
  );
}
