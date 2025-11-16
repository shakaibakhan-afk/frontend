import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { usersAPI, postsAPI, socialAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { getProfilePictureUrl, getPostImageUrl } from '../utils/imageUtils';
import EditProfile from '../components/EditProfile';
import StoryViewer from '../components/StoryViewer';
import CreateStory from '../components/CreateStory';
import '../styling/Profile.css';

function Profile() {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [hasStory, setHasStory] = useState(false);
  const [viewingStory, setViewingStory] = useState(false);
  const [showCreateStory, setShowCreateStory] = useState(false);

  // Use useCallback to memoize loadProfile function
  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      const userData = await usersAPI.getUserByUsername(username);
      setProfile(userData);
      
      const userPosts = await postsAPI.getUserPosts(userData.id);
      setPosts(userPosts);
      
      // Check if user has active stories
      try {
        const userStories = await socialAPI.getUserStories(userData.id);
        setHasStory(userStories.length > 0);
      } catch (err) {
        setHasStory(false);
      }
      
      // Check if following
      if (currentUser && userData.id !== currentUser.id) {
        const followers = await socialAPI.getFollowers(userData.id);
        setIsFollowing(followers.some(f => f.id === currentUser.id));
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
      setProfile(null);
      setPosts([]);
      setHasStory(false);

      if (error.response?.status === 404) {
        setErrorMessage('User not found');
      } else if (error.response?.status === 403) {
        setErrorMessage('Follow this user to view their profile');
      } else {
        setErrorMessage('Failed to load profile');
      }
    } finally {
      setLoading(false);
    }
  }, [username, currentUser]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleFollow = useCallback(async () => {
    try {
      if (isFollowing) {
        await socialAPI.unfollowUser(profile.id);
        setIsFollowing(false);
        setProfile(prev => ({...prev, followers_count: prev.followers_count - 1}));
        toast.success(`Unfollowed ${profile.username}`);
      } else {
        await socialAPI.followUser(profile.id);
        setIsFollowing(true);
        setProfile(prev => ({...prev, followers_count: prev.followers_count + 1}));
        toast.success(`Following ${profile.username}`);
      }
    } catch (error) {
      console.error('Failed to toggle follow:', error);
      toast.error('Failed to update follow status');
    }
  }, [isFollowing, profile]);

  if (loading) {
    return <div className="spinner"></div>;
  }

  if (!profile) {
    return <div className="profile-error">{errorMessage || 'User not found'}</div>;
  }

  const isOwnProfile = currentUser && profile.id === currentUser.id;

  return (
    <div className="profile">
      <div className="profile-container">
        <div className="profile-header">
          <div 
            className={`profile-avatar-large ${hasStory ? 'has-story' : isOwnProfile && !hasStory ? 'add-story' : ''}`}
            onClick={() => {
              if (hasStory) {
                setViewingStory(true);
              } else if (isOwnProfile) {
                setShowCreateStory(true);
              }
            }}
            style={{ cursor: (hasStory || isOwnProfile) ? 'pointer' : 'default' }}
          >
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
            {isOwnProfile && !hasStory && <div className="add-story-icon-profile">+</div>}
          </div>

          <div className="profile-info">
            <div className="profile-info-row">
              <h1 className="profile-username">{profile.username}</h1>
              {isOwnProfile ? (
                <button 
                  className="btn btn-secondary"
                  onClick={() => setShowEditProfile(true)}
                >
                  Edit Profile
                </button>
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

      {showEditProfile && (
        <EditProfile
          user={profile}
          onClose={() => setShowEditProfile(false)}
          onUpdate={loadProfile}
        />
      )}

      {viewingStory && (
        <StoryViewer
          userId={profile.id}
          onClose={() => {
            setViewingStory(false);
            loadProfile(); // Reload to check if story was deleted
          }}
        />
      )}

      {showCreateStory && (
        <CreateStory
          onClose={() => setShowCreateStory(false)}
          onStoryCreated={() => {
            setShowCreateStory(false);
            loadProfile(); // Reload to show new story
          }}
        />
      )}
    </div>
  );
}

export default Profile;

