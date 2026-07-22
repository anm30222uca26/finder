import { Search, Navigation, MapPin } from 'lucide-react';

export default function SearchBar({
  keyword,
  locationText,
  onKeywordChange,
  onLocationChange,
  onSearch,
  onUseLocation,
  locationInputRef,
  loading,
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch();
  };

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <div className="search-input-group">
        <Search size={18} className="input-icon" aria-hidden="true" />
        <input
          type="text"
          placeholder="Search places (hospitals, parks, restaurants...)"
          value={keyword}
          onChange={(e) => onKeywordChange(e.target.value)}
          aria-label="Search keyword"
        />
      </div>

      <div className="search-input-group">
        <MapPin size={18} className="input-icon" aria-hidden="true" />
        <input
          ref={locationInputRef}
          type="text"
          placeholder="Location (city, address...)"
          value={locationText}
          onChange={(e) => onLocationChange(e.target.value)}
          aria-label="Search location"
        />
        <button
          type="button"
          className="btn btn-icon"
          onClick={onUseLocation}
          title="Use my location"
          aria-label="Use my current location"
        >
          <Navigation size={18} />
        </button>
      </div>

      <button type="submit" className="btn btn-primary search-btn" disabled={loading}>
        {loading ? 'Searching...' : 'Search'}
      </button>
    </form>
  );
}
