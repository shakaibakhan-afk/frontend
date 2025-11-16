import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usersAPI, socialAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { getProfilePictureUrl } from '../utils/imageUtils';
import '../styling/Suggestions.css';

function Suggestions() {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    try {
      // Get all users and filter out current user and already followed users
      const allUsers = await usersAPI.getAllUsers();
      const following = await socialAPI.getFollowing(user.id);
      const followingIds = following.map(f => f.id);
      
      const filtered = allUsers
        .filter(u => u.id !== user.id && !followingIds.includes(u.id))
        .slice(0, 5); // Show only 5 suggestions
      
      setSuggestions(filtered);
    } catch (error) {
      console.error('Failed to load suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (userId) => {
    try {
      await socialAPI.followUser(userId);
      setSuggestions(suggestions.filter(s => s.id !== userId));
    } catch (error) {
      console.error('Failed to follow user:', error);
    }
  };

  if (loading) {
    return (
      <div className="suggestions-sidebar">
        <div className="suggestions-loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="suggestions-sidebar">
      {/* Current User Profile */}
      <div className="sidebar-user-profile">
        <Link to={`/profile/${user.username}`} className="sidebar-user-link">
          {user?.profile?.profile_picture ? (
            <img 
              src={getProfilePictureUrl(user.profile.profile_picture)} 
              alt={user.username}
              className="sidebar-user-avatar"
            />
          ) : (
            <div className="sidebar-user-avatar-placeholder">
              {user?.username?.[0]?.toUpperCase()}
            </div>
          )}
          <div className="sidebar-user-info">
            <span className="sidebar-username">{user.username}</span>
            <span className="sidebar-fullname">{user.profile?.bio || user.email}</span>
          </div>
        </Link>
      </div>

      {/* Suggestions Header */}
      <div className="suggestions-header">
        <span className="suggestions-title">Suggested for you</span>
        <button className="suggestions-see-all">See All</button>
      </div>

      {/* Suggestions List */}
      <div className="suggestions-list">
        {suggestions.length === 0 ? (
          <div className="no-suggestions">No suggestions available</div>
        ) : (
          suggestions.map(suggestion => (
            <div key={suggestion.id} className="suggestion-item">
              <Link to={`/profile/${suggestion.username}`} className="suggestion-user-link">
                {suggestion.profile?.profile_picture ? (
                  <img 
                    src={getProfilePictureUrl(suggestion.profile.profile_picture)} 
                    alt={suggestion.username}
                    className="suggestion-avatar"
                  />
                ) : (
                  <div className="suggestion-avatar-placeholder">
                    {suggestion.username?.[0]?.toUpperCase()}
                  </div>
                )}
                <div className="suggestion-user-info">
                  <span className="suggestion-username">{suggestion.username}</span>
                  <span className="suggestion-reason">Suggested for you</span>
                </div>
              </Link>
              <button 
                className="suggestion-follow-btn"
                onClick={() => handleFollow(suggestion.id)}
              >
                Follow
              </button>
            </div>
          ))
        )}
      </div>

      {/* Footer Links */}
      <div className="sidebar-footer">
        <div className="footer-links">
          <a href="#">About</a>
          <a href="#">Help</a>
          <a href="#">Press</a>
          <a href="#">API</a>
          <a href="#">Jobs</a>
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">Locations</a>
          <a href="#">Language</a>
        </div>
        <div className="footer-copyright">
          © 2025 INSTAGRAM FROM META
        </div>
      </div>
    </div>
  );
}

export default Suggestions;

