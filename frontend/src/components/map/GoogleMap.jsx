import { useEffect, useRef, useState, useCallback } from 'react';
import { loadGoogleMaps } from '../../services/googleMaps';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';

export default function GoogleMap({
  center,
  places = [],
  selectedPlace,
  userLocation,
  directionsResult,
  onPlaceClick,
  onMapReady,
}) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const userMarkerRef = useRef(null);
  const directionsRendererRef = useRef(null);
  const [mapLoading, setMapLoading] = useState(true);
  const [mapError, setMapError] = useState('');

  // Initialize map
  useEffect(() => {
    let cancelled = false;

    async function initMap() {
      try {
        const maps = await loadGoogleMaps();
        if (cancelled || !mapRef.current) return;

        const map = new maps.Map(mapRef.current, {
          center,
          zoom: 14,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true,
          styles: getMapStyles(),
        });

        mapInstanceRef.current = map;
        directionsRendererRef.current = new maps.DirectionsRenderer({
          suppressMarkers: false,
          polylineOptions: { strokeColor: '#3b82f6', strokeWeight: 5 },
        });
        directionsRendererRef.current.setMap(map);

        onMapReady?.(map);
        setMapLoading(false);
      } catch (err) {
        if (!cancelled) {
          setMapError(err.message);
          setMapLoading(false);
        }
      }
    }

    initMap();
    return () => {
      cancelled = true;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update center
  useEffect(() => {
    if (mapInstanceRef.current && center) {
      mapInstanceRef.current.panTo(center);
    }
  }, [center]);

  // User location marker
  useEffect(() => {
    if (!mapInstanceRef.current || !userLocation || !window.google) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.setMap(null);
    }

    userMarkerRef.current = new window.google.maps.Marker({
      position: userLocation,
      map: mapInstanceRef.current,
      title: 'Your Location',
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: '#4285F4',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 3,
      },
      zIndex: 1000,
    });
  }, [userLocation]);

  // Place markers
  const updateMarkers = useCallback(() => {
    if (!mapInstanceRef.current || !window.google) return;

    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    places.forEach((place) => {
      if (!place.geometry?.location) return;

      const isSelected = selectedPlace?.place_id === place.place_id;
      const marker = new window.google.maps.Marker({
        position: place.geometry.location,
        map: mapInstanceRef.current,
        title: place.name,
        animation: isSelected ? window.google.maps.Animation.BOUNCE : null,
        icon: isSelected
          ? {
              url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
            }
          : undefined,
      });

      marker.addListener('click', () => onPlaceClick(place));
      markersRef.current.push(marker);
    });
  }, [places, selectedPlace, onPlaceClick]);

  useEffect(() => {
    updateMarkers();
  }, [updateMarkers]);

  // Directions
  useEffect(() => {
    if (!directionsRendererRef.current) return;

    if (directionsResult) {
      directionsRendererRef.current.setDirections(directionsResult);
    } else {
      directionsRendererRef.current.setDirections({ routes: [] });
    }
  }, [directionsResult]);

  // Pan to selected place
  useEffect(() => {
    if (selectedPlace?.geometry?.location && mapInstanceRef.current) {
      mapInstanceRef.current.panTo(selectedPlace.geometry.location);
      mapInstanceRef.current.setZoom(16);
    }
  }, [selectedPlace]);

  return (
    <div className="map-container">
      {mapLoading && (
        <div className="map-overlay">
          <LoadingSpinner message="Loading map..." />
        </div>
      )}
      {mapError && <ErrorMessage message={mapError} />}
      <div ref={mapRef} className="google-map" role="application" aria-label="Interactive map" />
    </div>
  );
}

/** Map styles for light/dark themes */
function getMapStyles() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  if (!isDark) return [];

  return [
    { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#38414e' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#17263c' }] },
  ];
}
