import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { historyAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import EmptyState from '../components/common/EmptyState';
import { History, Search, Trash2, Clock } from 'lucide-react';

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const { data } = await historyAPI.getAll(20);
      setHistory(data.data.history);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load search history.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearAll = async () => {
    try {
      await historyAPI.clear();
      setHistory([]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to clear history.');
    }
  };

  const handleRemove = async (id) => {
    try {
      await historyAPI.remove(id);
      setHistory((prev) => prev.filter((h) => h._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete entry.');
    }
  };

  const repeatSearch = (entry) => {
    navigate('/', {
      state: {
        keyword: entry.keyword,
        location: entry.location,
        category: entry.category,
        lat: entry.lat,
        lng: entry.lng,
      },
    });
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  if (loading) {
    return (
      <div className="page-center">
        <LoadingSpinner message="Loading history..." />
      </div>
    );
  }

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <div>
          <h1>
            <History size={28} /> Search History
          </h1>
          <p>Your recent searches</p>
        </div>
        {history.length > 0 && (
          <button type="button" className="btn btn-danger" onClick={handleClearAll}>
            Clear All
          </button>
        )}
      </div>

      <ErrorMessage message={error} onDismiss={() => setError('')} />

      {history.length === 0 ? (
        <EmptyState
          icon={History}
          title="No search history"
          description="Your recent searches will appear here after you log in and search."
        />
      ) : (
        <div className="history-list">
          {history.map((entry) => (
            <div key={entry._id} className="history-item animate-fade-in">
              <div className="history-icon">
                <Search size={20} />
              </div>
              <div className="history-content">
                <h3>{entry.keyword}</h3>
                <p>{entry.location || 'Current location'}</p>
                {entry.category && entry.category !== 'all' && (
                  <span className="history-tag">{entry.category}</span>
                )}
                <span className="history-date">
                  <Clock size={12} />
                  {formatDate(entry.createdAt)}
                </span>
              </div>
              <div className="history-actions">
                <button type="button" className="btn btn-primary btn-sm" onClick={() => repeatSearch(entry)}>
                  Search Again
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => handleRemove(entry._id)}
                  aria-label="Delete history entry"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
