import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { favoritesAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import EmptyState from '../components/common/EmptyState';
import { Heart, Star, MapPin, Trash2 } from 'lucide-react';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const { data } = await favoritesAPI.getAll();
      setFavorites(data.data.favorites);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load favorites.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (placeId) => {
    try {
      await favoritesAPI.remove(placeId);
      setFavorites((prev) => prev.filter((f) => f.placeId !== placeId));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove favorite.');
    }
  };

  const openOnMap = (favorite) => {
    navigate('/', {
      state: {
        placeId: favorite.placeId,
        lat: favorite.lat,
        lng: favorite.lng,
      },
    });
  };

  if (loading) {
    return (
      <div className="page-center">
        <LoadingSpinner message="Loading favorites..." />
      </div>
    );
  }

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <h1>
          <Heart size={28} /> My Favorites
        </h1>
        <p>{favorites.length} saved place{favorites.length !== 1 ? 's' : ''}</p>
      </div>

      <ErrorMessage message={error} onDismiss={() => setError('')} />

      {favorites.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="No favorites yet"
          description="Search for places and tap the heart icon to save them here."
        />
      ) : (
        <div className="favorites-grid">
          {favorites.map((fav) => (
            <div key={fav._id} className="favorite-card animate-fade-in">
              {fav.photoUrl ? (
                <img src={fav.photoUrl} alt={fav.name} className="favorite-img" loading="lazy" />
              ) : (
                <div className="favorite-img placeholder">
                  <MapPin size={32} />
                </div>
              )}

              <div className="favorite-body">
                <h3>{fav.name}</h3>
                <p className="favorite-address">{fav.address}</p>

                {fav.rating > 0 && (
                  <span className="rating">
                    <Star size={14} fill="var(--accent)" stroke="var(--accent)" />
                    {fav.rating}
                  </span>
                )}

                <div className="favorite-actions">
                  <button type="button" className="btn btn-primary btn-sm" onClick={() => openOnMap(fav)}>
                    View on Map
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => handleRemove(fav.placeId)}
                    aria-label={`Remove ${fav.name} from favorites`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
