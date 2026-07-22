import { PLACE_CATEGORIES, DISTANCE_OPTIONS, RATING_OPTIONS } from '../../constants';

export default function SearchFilters({ filters, onChange }) {
  const handleChange = (key, value) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="search-filters">
      <div className="filter-row">
        <label htmlFor="category">Category</label>
        <select
          id="category"
          value={filters.category}
          onChange={(e) => handleChange('category', e.target.value)}
        >
          {PLACE_CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-row">
        <label htmlFor="distance">Distance</label>
        <select
          id="distance"
          value={filters.distance}
          onChange={(e) => handleChange('distance', Number(e.target.value))}
        >
          {DISTANCE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-row">
        <label htmlFor="rating">Min Rating</label>
        <select
          id="rating"
          value={filters.minRating}
          onChange={(e) => handleChange('minRating', Number(e.target.value))}
        >
          {RATING_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <label className="checkbox-filter">
        <input
          type="checkbox"
          checked={filters.openNow}
          onChange={(e) => handleChange('openNow', e.target.checked)}
        />
        <span>Open Now</span>
      </label>
    </div>
  );
}
