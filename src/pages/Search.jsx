import { useState } from 'react';
import { Link } from 'react-router-dom';
import { usersAPI } from '../services/api';
import { getProfilePictureUrl } from '../utils/imageUtils';
import '../styling/Search.css';

function Search() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    
    if (query.trim() === '') {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const allUsers = await usersAPI.getAllUsers();
      const filtered = allUsers.filter(user => 
        user.username.toLowerCase().includes(query.toLowerCase()) ||
        user.email.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(filtered);
    } catch (error) {
      console.error('Failed to search users:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="search-page">
      <div className="search-container">
        <div className="search-header">
          <h2>Search</h2>
          <div className="search-input-container">
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="search-results">
          {loading ? (
            <div className="search-loading">Searching...</div>
          ) : searchQuery === '' ? (
            <div className="search-empty">
              <p>Search for users by username or email</p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="search-empty">
              <p>No users found for "{searchQuery}"</p>
            </div>
          ) : (
            <div className="search-results-list">
              {searchResults.map(user => (
                <Link 
                  key={user.id} 
                  to={`/profile/${user.username}`}
                  className="search-result-item"
                >
                  {user.profile?.profile_picture ? (
                    <img 
                      src={getProfilePictureUrl(user.profile.profile_picture)} 
                      alt={user.username}
                      className="search-result-avatar"
                    />
                  ) : (
                    <div className="search-result-avatar-placeholder">
                      {user.username?.[0]?.toUpperCase()}
                    </div>
                  )}
                  <div className="search-result-info">
                    <span className="search-result-username">{user.username}</span>
                    <span className="search-result-email">{user.email}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Search;

