import { useState, useEffect } from 'react';
import { postsAPI } from '../services/api';
import PostCard from '../components/PostCard';
import CreatePost from '../components/CreatePost';
import './Home.css';

function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const data = await postsAPI.getFollowingPosts();
      setPosts(data);
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]);
    setShowCreatePost(false);
  };

  const handlePostDeleted = (postId) => {
    setPosts(posts.filter(post => post.id !== postId));
  };

  if (loading) {
    return <div className="spinner"></div>;
  }

  return (
    <div className="home">
      <div className="home-container">
        <div className="create-post-button">
          <button className="btn btn-primary" onClick={() => setShowCreatePost(true)}>
            + Create Post
          </button>
        </div>

        {showCreatePost && (
          <CreatePost 
            onClose={() => setShowCreatePost(false)}
            onPostCreated={handlePostCreated}
          />
        )}

        {posts.length === 0 ? (
          <div className="no-posts">
            <p>No posts yet. Follow some users or create your first post!</p>
          </div>
        ) : (
          <div className="posts-feed">
            {posts.map(post => (
              <PostCard 
                key={post.id} 
                post={post} 
                onDelete={handlePostDeleted}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;

