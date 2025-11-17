import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import toast from 'react-hot-toast';
import { postsAPI, socialAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { getProfilePictureUrl } from '../utils/imageUtils';
import '../styling/Home.css';

// Lazy load components for better performance
const PostCard = lazy(() => import('../components/PostCard'));
const CreatePost = lazy(() => import('../components/CreatePost'));
const CreateStory = lazy(() => import('../components/CreateStory'));
const StoryViewer = lazy(() => import('../components/StoryViewer'));
const Suggestions = lazy(() => import('../components/Suggestions'));

function Home() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [stories, setStories] = useState([]);
  const [myStories, setMyStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showCreateStory, setShowCreateStory] = useState(false);
  const [viewingStoryUserId, setViewingStoryUserId] = useState(null);

  // Use useCallback to memoize functions
  const loadPosts = useCallback(async () => {
    try {
      const data = await postsAPI.getFollowingPosts();
      setPosts(data);
    } catch (error) {
      console.error('Failed to load posts:', error);
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadStories = useCallback(async () => {
    try {
      // Get all stories from followed users (including own stories)
      const allStories = await socialAPI.getStories();
      
      // Separate own stories from others
      const ownStories = allStories.filter(story => story.user_id === user?.id);
      const otherStories = allStories.filter(story => story.user_id !== user?.id);
      
      setMyStories(ownStories);
      setStories(otherStories);
    } catch (error) {
      console.error('Failed to load stories:', error);
      toast.error('Failed to load stories');
    }
  }, [user?.id]);

  useEffect(() => {
    loadPosts();
    loadStories();
  }, [loadPosts, loadStories]);

  // Listen for post/story creation events from Layout modals
  useEffect(() => {
    const handlePostCreated = () => {
      loadPosts();
    };
    const handleStoryCreated = () => {
      loadStories();
    };

    window.addEventListener('postCreated', handlePostCreated);
    window.addEventListener('storyCreated', handleStoryCreated);

    return () => {
      window.removeEventListener('postCreated', handlePostCreated);
      window.removeEventListener('storyCreated', handleStoryCreated);
    };
  }, [loadPosts, loadStories]);

  const handlePostCreated = useCallback((newPost) => {
    setPosts(prevPosts => [newPost, ...prevPosts]);
    setShowCreatePost(false);
    toast.success('Post created successfully!');
  }, []);

  const handleStoryCreated = useCallback(() => {
    setShowCreateStory(false);
    loadStories(); // Reload stories to get updated list
    toast.success('Story created successfully!');
  }, [loadStories]);

  const handlePostDeleted = useCallback((postId) => {
    setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
    toast.success('Post deleted successfully!');
  }, []);

  if (loading) {
    return <div className="spinner"></div>;
  }

  return (
    <div className="home">
      <div className="home-container">
        {/* Main Feed Column */}
        <div className="home-main">
          {/* Stories Bar - Always show */}
          <div className="stories-container">
            <div className="stories-bar">
              {/* User's own story */}
              <div 
                className="story-item" 
                onClick={() => myStories.length > 0 ? setViewingStoryUserId(user.id) : setShowCreateStory(true)}
              >
                <div className={`story-avatar ${myStories.length > 0 ? 'has-story' : 'add-story'}`}>
                  {user?.profile?.profile_picture ? (
                    <img 
                      src={getProfilePictureUrl(user.profile.profile_picture)} 
                      alt={user.username}
                      loading="lazy"
                    />
                  ) : (
                    <div className="avatar-placeholder">
                      {user?.username?.[0]?.toUpperCase()}
                    </div>
                  )}
                  {myStories.length === 0 && <div className="add-story-icon">+</div>}
                </div>
                <span>{myStories.length > 0 ? 'Your Story' : 'Add Story'}</span>
              </div>

              {/* Other users' stories - grouped by user */}
              {Object.values(
                stories.reduce((acc, story) => {
                  if (!acc[story.user_id]) {
                    acc[story.user_id] = story;
                  }
                  return acc;
                }, {})
              ).map(story => (
                <div 
                  key={story.user_id} 
                  className="story-item"
                  onClick={() => setViewingStoryUserId(story.user_id)}
                >
                  <div className={`story-avatar has-story ${story.has_viewed ? 'viewed' : ''}`}>
                    {story.user?.profile?.profile_picture ? (
                      <img 
                        src={getProfilePictureUrl(story.user.profile.profile_picture)} 
                        alt={story.user.username}
                        loading="lazy"
                      />
                    ) : (
                      <div className="avatar-placeholder">
                        {story.user?.username?.[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>
                  <span>{story.user?.username}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Lazy loaded modals */}
          <Suspense fallback={<div className="spinner"></div>}>
            {showCreatePost && (
              <CreatePost 
                onClose={() => setShowCreatePost(false)}
                onPostCreated={handlePostCreated}
              />
            )}

            {showCreateStory && (
              <CreateStory 
                onClose={() => setShowCreateStory(false)}
                onStoryCreated={handleStoryCreated}
              />
            )}
          </Suspense>

          {/* Posts Feed */}
          {posts.length === 0 ? (
            <div className="no-posts">
              <p>No posts yet. Follow some users or create your first post!</p>
            </div>
          ) : (
            <div className="posts-feed">
              <Suspense fallback={<div className="spinner"></div>}>
                {posts.map(post => (
                  <PostCard 
                    key={post.id} 
                    post={post} 
                    onDelete={handlePostDeleted}
                  />
                ))}
              </Suspense>
            </div>
          )}
        </div>

        {/* Suggestions Sidebar */}
        <Suspense fallback={<div className="spinner"></div>}>
          <Suggestions />
        </Suspense>

        {/* Story Viewer */}
        <Suspense fallback={null}>
          {viewingStoryUserId && (
            <StoryViewer
              userId={viewingStoryUserId}
              onClose={() => {
                setViewingStoryUserId(null);
                loadStories(); // Reload stories in case any were deleted
              }}
            />
          )}
        </Suspense>
      </div>
    </div>
  );
}

export default Home;

