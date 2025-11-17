import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNotifications } from '../contexts/NotificationContext';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { getProfilePictureUrl } from '../utils/imageUtils';
import CreatePost from './CreatePost';
import CreateStory from './CreateStory';
import '../styling/Layout.css';

function Layout({ children }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { unreadCount } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showCreateStory, setShowCreateStory] = useState(false);

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully!');
    navigate('/login');
  };

  return (
    <div className="layout">
      {/* Left Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-content">
          {/* Logo */}
          <Link to="/" className="sidebar-logo">
            <h1>Instagram</h1>
          </Link>

          {/* Navigation Links */}
          <nav className="sidebar-nav">
            {/* Home */}
            <Link to="/" className={`sidebar-link ${isActive('/') ? 'active' : ''}`}>
              <svg aria-label="Home" fill="currentColor" height="24" role="img" viewBox="0 0 24 24" width="24">
                {isActive('/') ? (
                  <path d="M22 23h-6.001a1 1 0 0 1-1-1v-5.455a2.997 2.997 0 1 0-5.993 0V22a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V11.543a1.002 1.002 0 0 1 .31-.724l10-9.543a1.001 1.001 0 0 1 1.38 0l10 9.543a1.002 1.002 0 0 1 .31.724V22a1 1 0 0 1-1 1Z"></path>
                ) : (
                  <path d="M9.005 16.545a2.997 2.997 0 0 1 2.997-2.997A2.997 2.997 0 0 1 15 16.545V22h7V11.543L12 2 2 11.543V22h7.005Z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="2"></path>
                )}
              </svg>
              <span>Home</span>
            </Link>

            {/* Search */}
            <Link to="/search" className={`sidebar-link ${isActive('/search') ? 'active' : ''}`}>
              <svg aria-label="Search" fill="currentColor" height="24" role="img" viewBox="0 0 24 24" width="24">
                {isActive('/search') ? (
                  <path d="M18.5 10.5a8 8 0 1 1-8-8 8 8 0 0 1 8 8Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3"></path>
                ) : (
                  <path d="M19 10.5A8.5 8.5 0 1 1 10.5 2a8.5 8.5 0 0 1 8.5 8.5Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                )}
                <line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="16.511" x2="22" y1="16.511" y2="22"></line>
              </svg>
              <span>Search</span>
            </Link>

            {/* Notifications */}
            <Link to="/notifications" className={`sidebar-link ${isActive('/notifications') ? 'active' : ''}`}>
              <div className="notification-icon-wrapper">
                <svg aria-label="Notifications" fill="currentColor" height="24" role="img" viewBox="0 0 24 24" width="24">
                  {isActive('/notifications') ? (
                    <path d="M17.075 1.987a5.852 5.852 0 0 0-5.07 2.66l-.008.012-.01-.014a5.878 5.878 0 0 0-5.062-2.658A6.719 6.719 0 0 0 .5 8.952c0 3.514 2.581 5.757 5.077 7.927.302.262.607.527.91.797l1.089.973c2.112 1.89 3.149 2.813 3.642 3.133a1.438 1.438 0 0 0 1.564 0c.472-.306 1.334-1.07 3.755-3.234l.978-.874c.314-.28.631-.555.945-.827 2.478-2.15 5.04-4.372 5.04-7.895a6.719 6.719 0 0 0-6.425-6.965Z"></path>
                  ) : (
                    <path d="M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.309-2.143-1.823-4.303-3.752C5.141 14.072 2.5 12.167 2.5 9.122a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.84 1.175.98 1.763 1.12 1.763s.278-.588 1.11-1.766a4.17 4.17 0 0 1 3.679-1.938m0-2a6.04 6.04 0 0 0-4.797 2.127 6.052 6.052 0 0 0-4.787-2.127A6.985 6.985 0 0 0 .5 9.122c0 3.61 2.55 5.827 5.015 7.97.283.246.569.494.853.747l1.027.918a44.998 44.998 0 0 0 3.518 3.018 2 2 0 0 0 2.174 0 45.263 45.263 0 0 0 3.626-3.115l.922-.824c.293-.26.59-.519.885-.774 2.334-2.025 4.98-4.32 4.98-7.94a6.985 6.985 0 0 0-6.708-7.218Z"></path>
                  )}
                </svg>
                {unreadCount > 0 && (
                  <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
                )}
              </div>
              <span>Notifications</span>
            </Link>

            {/* Create */}
            <button onClick={() => setShowCreatePost(true)} className="sidebar-link">
              <svg aria-label="New post" fill="currentColor" height="24" role="img" viewBox="0 0 24 24" width="24">
                <path d="M2 12v3.45c0 2.849.698 4.005 1.606 4.944.94.909 2.098 1.608 4.946 1.608h6.896c2.848 0 4.006-.7 4.946-1.608C21.302 19.455 22 18.3 22 15.45V8.552c0-2.849-.698-4.006-1.606-4.945C19.454 2.7 18.296 2 15.448 2H8.552c-2.848 0-4.006.699-4.946 1.607C2.698 4.547 2 5.703 2 8.552Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                <line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="6.545" x2="17.455" y1="12.001" y2="12.001"></line>
                <line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="12.003" x2="12.003" y1="6.545" y2="17.455"></line>
              </svg>
              <span>Create</span>
            </button>

            {/* Profile */}
            <Link to={`/profile/${user?.username}`} className={`sidebar-link ${isActive(`/profile/${user?.username}`) ? 'active' : ''}`}>
              <div className="sidebar-avatar-container">
                <div className="sidebar-avatar">
                  {user?.profile?.profile_picture ? (
                    <img 
                      src={getProfilePictureUrl(user.profile.profile_picture)} 
                      alt="Profile" 
                    />
                  ) : (
                    <div className="sidebar-avatar-placeholder">
                      {user?.username?.[0]?.toUpperCase()}
                    </div>
                  )}
                </div>
                <button 
                  className="sidebar-add-story-btn"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowCreateStory(true);
                  }}
                  title="Add Story"
                >
                  +
                </button>
              </div>
              <span>Profile</span>
            </Link>

            {/* Dark Mode Toggle */}
            <button onClick={toggleTheme} className="sidebar-link theme-toggle">
              {theme === 'dark' ? (
                <svg aria-label="Light mode" fill="currentColor" height="24" role="img" viewBox="0 0 24 24" width="24">
                  <path d="M12 3c.132 0 .263 0 .393.007a7.5 7.5 0 0 0 7.92 12.446A9 9 0 1 1 8.313 4.427 7.483 7.483 0 0 0 12 3Z"></path>
                </svg>
              ) : (
                <svg aria-label="Dark mode" fill="currentColor" height="24" role="img" viewBox="0 0 24 24" width="24">
                  <path d="M12.003 11.996v7.504M12.003 3.996v7.504M4.499 12h7.504M12.003 12h7.504M16.243 16.24l-5.303-5.303M7.757 7.757l5.303 5.303M16.243 7.757l-5.303 5.303M7.757 16.24l5.303-5.303" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
              )}
              <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            </button>

            {/* Logout Button */}
            <button onClick={handleLogout} className="sidebar-link logout-button">
              <svg aria-label="Logout" fill="currentColor" height="24" role="img" viewBox="0 0 24 24" width="24">
                <path d="M16 13v-2H7V8l-5 4 5 4v-3z"></path>
                <path d="M20 3h-9c-1.103 0-2 .897-2 2v4h2V5h9v14h-9v-4H9v4c0 1.103.897 2 2 2h9c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2z"></path>
              </svg>
              <span>Logout</span>
            </button>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {children}
      </main>

      {/* Create Post Modal */}
      {showCreatePost && (
        <CreatePost 
          onClose={() => setShowCreatePost(false)}
          onPostCreated={() => {
            setShowCreatePost(false);
            window.dispatchEvent(new CustomEvent('postCreated'));
            if (location.pathname !== '/') {
              navigate('/');
            }
          }}
        />
      )}

      {/* Create Story Modal */}
      {showCreateStory && (
        <CreateStory 
          onClose={() => setShowCreateStory(false)}
          onStoryCreated={() => {
            setShowCreateStory(false);
            window.dispatchEvent(new CustomEvent('storyCreated'));
            if (location.pathname !== '/') {
              navigate('/');
            }
          }}
        />
      )}
    </div>
  );
}

export default Layout;

