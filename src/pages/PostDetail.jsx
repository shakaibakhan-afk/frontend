import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { postsAPI } from '../services/api';
import PostCard from '../components/PostCard';
import './PostDetail.css';

function PostDetail() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPost();
  }, [postId]);

  const loadPost = async () => {
    try {
      const data = await postsAPI.getPost(postId);
      setPost(data);
    } catch (err) {
      setError('Post not found');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    navigate('/');
  };

  if (loading) {
    return <div className="spinner"></div>;
  }

  if (error || !post) {
    return (
      <div className="post-detail-error">
        <p>{error || 'Post not found'}</p>
      </div>
    );
  }

  return (
    <div className="post-detail">
      <div className="post-detail-container">
        <PostCard post={post} onDelete={handleDelete} />
      </div>
    </div>
  );
}

export default PostDetail;

