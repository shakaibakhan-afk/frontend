import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usersAPI, postsAPI, socialAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import './Profile.css';

function Profile() {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, [username]);

  const loadProfile = async () => {
    try {
      const userData = await usersAPI.getUserByUsername(username);
      setProfile(userData);
      
      const userPosts = await postsAPI.getUserPosts(userData.id);
      setPosts(userPosts);
      
      // Check if following
      if (currentUser && userData.id !== currentUser.id) {
        const followers = await socialAPI.getFollowers(userData.id);
        setIsFollowing(followers.some(f => f.id === currentUser.id));
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await socialAPI.unfollowUser(profile.id);
        setIsFollowing(false);
        setProfile({...profile, followers_count: profile.followers_count - 1});
      } else {
        await socialAPI.followUser(profile.id);
        setIsFollowing(true);
        setProfile({...profile, followers_count: profile.followers_count + 1});
      }
    } catch (error) {
      console.error('Failed to toggle follow:', error);
    }
  };

  if (loading) {
    return <div className="spinner"></div>;
  }

  if (!profile) {
    return <div className="profile-error">User not found</div>;
  }

  const isOwnProfile = currentUser && profile.id === currentUser.id;

  return (
    <div className="profile">
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-avatar-large">
            {profile.profile?.profile_picture ? (
              <img 
                src={`http://localhost:8000/uploads/profiles/${profile.profile.profile_picture}`} 
                alt={profile.username} 
              />
            ) : (
              <div className="avatar-placeholder-large">
                {profile.username?.[0]?.toUpperCase()}
              </div>
            )}
          </div>

          <div className="profile-info">
            <div className="profile-info-row">
              <h1 className="profile-username">{profile.username}</h1>
              {isOwnProfile ? (
                <button className="btn btn-secondary">Edit Profile</button>
              ) : (
                <button 
                  onClick={handleFollow}
                  className={`btn ${isFollowing ? 'btn-secondary' : 'btn-primary'}`}
                >
                  {isFollowing ? 'Unfollow' : 'Follow'}
                </button>
              )}
            </div>

            <div className="profile-stats">
              <div className="profile-stat">
                <strong>{profile.posts_count || 0}</strong> posts
              </div>
              <div className="profile-stat">
                <strong>{profile.followers_count || 0}</strong> followers
              </div>
              <div className="profile-stat">
                <strong>{profile.following_count || 0}</strong> following
              </div>
            </div>

            {profile.profile?.bio && (
              <div className="profile-bio">{profile.profile.bio}</div>
            )}

            {profile.profile?.website && (
              <a 
                href={profile.profile.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="profile-website"
              >
                {profile.profile.website}
              </a>
            )}
          </div>
        </div>

        <div className="profile-posts">
          <div className="posts-header">
            <h2>Posts</h2>
          </div>
          
          {posts.length === 0 ? (
            <div className="no-posts">
              <p>{isOwnProfile ? 'You haven\'t posted anything yet.' : 'No posts yet.'}</p>
            </div>
          ) : (
            <div className="posts-grid">
              {posts.map(post => (
                <Link key={post.id} to={`/post/${post.id}`} className="post-grid-item">
                  <img 
                    src={`http://localhost:8000/uploads/posts/${post.image}`} 
                    alt="Post" 
                  />
                  <div className="post-overlay">
                    <span>❤ {post.likes_count}</span>
                    <span>💬 {post.comments_count}</span>
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

export default Profile;

