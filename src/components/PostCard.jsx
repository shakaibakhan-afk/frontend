import { useState } from 'react';
import { Link } from 'react-router-dom';
import { socialAPI, postsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import './PostCard.css';

function PostCard({ post, onDelete }) {
  const [isLiked, setIsLiked] = useState(post.is_liked);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const { user } = useAuth();

  const handleLike = async () => {
    try {
      if (isLiked) {
        await socialAPI.unlikePost(post.id);
        setIsLiked(false);
        setLikesCount(likesCount - 1);
      } else {
        await socialAPI.likePost(post.id);
        setIsLiked(true);
        setLikesCount(likesCount + 1);
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      const newComment = await socialAPI.createComment(post.id, comment);
      setComments([...comments, newComment]);
      setComment('');
    } catch (error) {
      console.error('Failed to create comment:', error);
    }
  };

  const loadComments = async () => {
    if (comments.length === 0) {
      try {
        const data = await socialAPI.getPostComments(post.id);
        setComments(data);
      } catch (error) {
        console.error('Failed to load comments:', error);
      }
    }
    setShowComments(!showComments);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await postsAPI.deletePost(post.id);
        onDelete(post.id);
      } catch (error) {
        console.error('Failed to delete post:', error);
      }
    }
  };

  return (
    <div className="post-card">
      <div className="post-header">
        <Link to={`/profile/${post.username}`} className="post-user">
          <div className="post-avatar">
            {post.user_profile_picture ? (
              <img 
                src={`http://localhost:8000/uploads/profiles/${post.user_profile_picture}`} 
                alt={post.username} 
              />
            ) : (
              <div className="avatar-placeholder">{post.username?.[0]?.toUpperCase()}</div>
            )}
          </div>
          <span className="post-username">{post.username}</span>
        </Link>
        {post.user_id === user?.id && (
          <button onClick={handleDelete} className="post-delete">×</button>
        )}
      </div>

      <div className="post-image">
        <img src={`http://localhost:8000/uploads/posts/${post.image}`} alt="Post" />
      </div>

      <div className="post-actions">
        <button onClick={handleLike} className={`action-btn ${isLiked ? 'liked' : ''}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
            {isLiked ? (
              <path fillRule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z"/>
            ) : (
              <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01L8 2.748zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143c.06.055.119.112.176.171a3.12 3.12 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15z"/>
            )}
          </svg>
        </button>
        <button onClick={loadComments} className="action-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
            <path d="M2.678 11.894a1 1 0 0 1 .287.801 10.97 10.97 0 0 1-.398 2c1.395-.323 2.247-.697 2.634-.893a1 1 0 0 1 .71-.074A8.06 8.06 0 0 0 8 14c3.996 0 7-2.807 7-6 0-3.192-3.004-6-7-6S1 4.808 1 8c0 1.468.617 2.83 1.678 3.894zm-.493 3.905a21.682 21.682 0 0 1-.713.129c-.2.032-.352-.176-.273-.362a9.68 9.68 0 0 0 .244-.637l.003-.01c.248-.72.45-1.548.524-2.319C.743 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7-3.582 7-8 7a9.06 9.06 0 0 1-2.347-.306c-.52.263-1.639.742-3.468 1.105z"/>
          </svg>
        </button>
      </div>

      <div className="post-likes">
        <strong>{likesCount} {likesCount === 1 ? 'like' : 'likes'}</strong>
      </div>

      {post.caption && (
        <div className="post-caption">
          <Link to={`/profile/${post.username}`} className="caption-username">
            {post.username}
          </Link>
          <span className="caption-text">{post.caption}</span>
        </div>
      )}

      {showComments && (
        <div className="post-comments">
          {comments.map(comment => (
            <div key={comment.id} className="comment">
              <Link to={`/profile/${comment.username}`} className="comment-username">
                {comment.username}
              </Link>
              <span className="comment-text">{comment.text}</span>
            </div>
          ))}
          <form onSubmit={handleComment} className="comment-form">
            <input
              type="text"
              placeholder="Add a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="comment-input"
            />
            <button type="submit" disabled={!comment.trim()} className="comment-submit">
              Post
            </button>
          </form>
        </div>
      )}

      <div className="post-timestamp">
        {new Date(post.timestamp).toLocaleDateString()}
      </div>
    </div>
  );
}

export default PostCard;

