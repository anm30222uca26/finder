import {
  Star,
  MapPin,
  Phone,
  Globe,
  Clock,
  Navigation,
  Heart,
  ExternalLink,
} from 'lucide-react';
import { getPhotoUrl, isPlaceOpenNow } from '../../utils/helpers';

export default function PlaceDetails({
  place,
  onClose,
  onGetDirections,
  onToggleFavorite,
  isFavorite,
  favoriteLoading,
  directionsInfo,
  isAuthenticated,
}) {
  if (!place) return null;

  const photoUrl = place.photos?.length > 0 ? getPhotoUrl(place.photos[0]) : '';
  const openNow = isPlaceOpenNow(place.opening_hours);
  const phone = place.formatted_phone_number || place.international_phone_number;

  return (
    <div className="place-details animate-slide-up">
      <button type="button" className="close-btn" onClick={onClose} aria-label="Close details">
        ×
      </button>

      {photoUrl && (
        <div className="place-photo">
          <img src={photoUrl} alt={place.name} loading="lazy" />
        </div>
      )}

      <div className="place-details-body">
        <div className="place-header">
          <h2>{place.name}</h2>
          {isAuthenticated && (
            <button
              type="button"
              className={`favorite-btn ${isFavorite ? 'active' : ''}`}
              onClick={onToggleFavorite}
              disabled={favoriteLoading}
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart size={22} fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
          )}
        </div>

        {place.rating > 0 && (
          <div className="place-rating">
            <Star size={16} fill="var(--accent)" stroke="var(--accent)" />
            <span>{place.rating}</span>
            {place.user_ratings_total && (
              <span className="rating-count">({place.user_ratings_total} reviews)</span>
            )}
          </div>
        )}

        <p className="place-address">
          <MapPin size={14} />
          {place.formatted_address || place.vicinity}
        </p>

        {openNow !== null && (
          <p className={`open-status ${openNow ? 'open' : 'closed'}`}>
            <Clock size={14} />
            {openNow ? 'Open now' : 'Closed now'}
          </p>
        )}

        {place.opening_hours?.weekday_text && (
          <div className="opening-hours">
            <h4>Opening Hours</h4>
            <ul>
              {place.opening_hours.weekday_text.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        )}

        {phone && (
          <a href={`tel:${phone}`} className="place-link">
            <Phone size={14} />
            {phone}
          </a>
        )}

        {place.website && (
          <a href={place.website} target="_blank" rel="noopener noreferrer" className="place-link">
            <Globe size={14} />
            Website
            <ExternalLink size={12} />
          </a>
        )}

        {directionsInfo && (
          <div className="directions-info">
            <Navigation size={16} />
            <span>
              {directionsInfo.distance} · {directionsInfo.duration}
            </span>
          </div>
        )}

        <div className="place-actions">
          <button type="button" className="btn btn-primary" onClick={onGetDirections}>
            <Navigation size={16} />
            Get Directions
          </button>

          {place.url && (
            <a
              href={place.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
            >
              View on OpenStreetMap
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
