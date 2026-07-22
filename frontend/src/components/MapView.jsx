import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Leaflet when using React Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Create a custom red icon for selected places
const selectedIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const defaultIcon = new L.Icon.Default();

// Component to handle map center updates
function MapUpdater({ center, zoom }) {
    const map = useMap();
    useEffect(() => {
        if (center && center.lat !== undefined && center.lng !== undefined) {
            map.setView([center.lat, center.lng], zoom || map.getZoom());
        } else if (Array.isArray(center) && center.length === 2) {
            map.setView(center, zoom || map.getZoom());
        }
    }, [center, zoom, map]);
    return null;
}

export default function MapView({
    center,
    zoom = 13,
    places = [],
    selectedPlace,
    userLocation,
    onPlaceClick,
}) {
    // Determine center format, handle Google Maps {lat: ..., lng: ...} vs array [lat, lng]
    const defaultCenter = [11.0168, 76.9558];

    let mapCenter = defaultCenter;
    if (center) {
        if (Array.isArray(center) && center.length === 2) {
            mapCenter = center;
        } else if (center.lat && center.lng) {
            mapCenter = [center.lat, center.lng];
        }
    }

    return (
        <div className="map-container" style={{ height: '100%', width: '100%', minHeight: '400px' }}>
            <MapContainer center={mapCenter} zoom={zoom} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <MapUpdater center={mapCenter} zoom={selectedPlace ? 16 : zoom} />

                {userLocation && (
                    <Marker
                        position={userLocation.lat ? [userLocation.lat, userLocation.lng] : userLocation}
                        title="Your Location"
                    >
                        <Popup>Your Location</Popup>
                    </Marker>
                )}

                {places.map((place, index) => {
                    let lat, lng;

                    if (place.latitude && place.longitude) {
                        lat = place.latitude;
                        lng = place.longitude;
                    } else if (place.geometry?.location) {
                        lat = typeof place.geometry.location.lat === 'function'
                            ? place.geometry.location.lat()
                            : place.geometry.location.lat;
                        lng = typeof place.geometry.location.lng === 'function'
                            ? place.geometry.location.lng()
                            : place.geometry.location.lng;
                    }

                    if (lat === undefined || lng === undefined) return null;

                    const isSelected = selectedPlace && (
                        selectedPlace.place_id === place.place_id ||
                        selectedPlace.name === place.name
                    );

                    return (
                        <Marker
                            key={place.place_id || index}
                            position={[lat, lng]}
                            icon={isSelected ? selectedIcon : defaultIcon}
                            eventHandlers={{
                                click: () => {
                                    if (onPlaceClick) onPlaceClick(place);
                                },
                            }}
                        >
                            <Popup>
                                <strong>{place.name}</strong>
                                <br />
                                {place.formatted_address || place.vicinity || ''}
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>
        </div>
    );
}
