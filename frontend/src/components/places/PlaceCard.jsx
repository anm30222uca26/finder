import { Star, MapPin } from 'lucide-react';
import { GOOGLE_MAPS_API_KEY } from '../../constants';
import { getPhotoUrl, getDistanceMeters, formatDistance } from '../../utils/helpers';

export default function PlaceCard({ place, userLocation, isSelected, onClick }) {
  const photoUrl =
    place.photos?.length > 0 ? getPhotoUrl(place.photos[0], GOOGLE_MAPS_API_KEY, 200) : null;

  const distance =
    userLocation && place.geometry?.location
      ? formatDistance(
          getDistanceMeters(
            userLocation.lat,
            userLocation.lng,
            place.geometry.location.lat(),
            place.geometry.location.lng()
          )
        )
      : null;

  return (
    <button
      type="button"
      className={`place-card ${isSelected ? 'selected' : ''} animate-fade-in`}
      onClick={() => onClick(place)}
    >
      {photoUrl ? (
        <img src={photoUrl} alt="" className="place-card-img" loading="lazy" />
      ) : (
        <div className="place-card-img placeholder">
          <MapPin size={24} />
        </div>
      )}

      <div className="place-card-body">
        <h3>{place.name}</h3>
        <p className="place-card-address">{place.vicinity || place.formatted_address}</p>

        <div className="place-card-meta">
          {place.rating > 0 && (
            <span className="rating">
              <Star size={12} fill="var(--accent)" stroke="var(--accent)" />
              {place.rating}
            </span>
          )}
          {distance && <span className="distance">{distance}</span>}
          {place.opening_hours?.open_now !== undefined && (
            <span className={place.opening_hours.open_now ? 'open-badge' : 'closed-badge'}>
              {place.opening_hours.open_now ? 'Open' : 'Closed'}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
