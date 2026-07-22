import { Link, NavLink } from 'react-router-dom';
import { MapPin, Heart, History, LogIn, LogOut, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../common/ThemeToggle';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <MapPin size={28} className="brand-icon" aria-hidden="true" />
          <span>Place Finder</span>
        </Link>

        <nav className="navbar-nav" aria-label="Main navigation">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            <MapPin size={18} />
            <span>Explore</span>
          </NavLink>

          {isAuthenticated && (
            <>
              <NavLink to="/favorites" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                <Heart size={18} />
                <span>Favorites</span>
              </NavLink>
              <NavLink to="/history" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                <History size={18} />
                <span>History</span>
              </NavLink>
            </>
          )}
        </nav>

        <div className="navbar-actions">
          <ThemeToggle />

          {isAuthenticated ? (
            <div className="user-menu">
              <span className="user-name">
                <User size={16} aria-hidden="true" />
                {user?.name}
              </span>
              <button type="button" className="btn btn-ghost" onClick={handleLogout}>
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary">
              <LogIn size={16} />
              <span>Login</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
