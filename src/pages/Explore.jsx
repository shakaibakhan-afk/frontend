import { useState, useEffect } from 'react';
import { postsAPI } from '../services/api';
import { Link } from 'react-router-dom';
import { getPostImageUrl } from '../utils/imageUtils';
import '../styling/Explore.css';

function Explore() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const data = await postsAPI.getPosts(0, 30);
      setPosts(data);
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="spinner"></div>;
  }

  return (
    <div className="explore">
      <div className="explore-container">
        <h2 className="explore-title">Explore</h2>
        
        {posts.length === 0 ? (
          <div className="no-posts">
            <p>No posts to explore yet.</p>
          </div>
        ) : (
          <div className="explore-grid">
            {posts.map(post => (
              <Link 
                key={post.id} 
                to={`/post/${post.id}`} 
                className="explore-item"
              >
                <img 
                  src={getPostImageUrl(post.image)} 
                  alt="Post" 
                />
                <div className="explore-overlay">
                  <span className="explore-stat">
                    ❤ {post.likes_count}
                  </span>
                  <span className="explore-stat">
                    💬 {post.comments_count}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Explore;

