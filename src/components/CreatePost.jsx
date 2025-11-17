import { useState } from 'react';
import { postsAPI } from '../services/api';
import '../styling/CreatePost.css';

const MAX_CAPTION_LENGTH = 150;

function CreatePost({ onClose, onPostCreated }) {
  const [caption, setCaption] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) {
      setError('Please select an image');
      return;
    }
    if (caption.trim().length > MAX_CAPTION_LENGTH) {
      setError(`Caption cannot exceed ${MAX_CAPTION_LENGTH} characters.`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const newPost = await postsAPI.createPost(caption, image, '');
      onPostCreated(newPost);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create New Post</h2>
          <button onClick={onClose} className="modal-close">×</button>
        </div>

        <form onSubmit={handleSubmit} className="create-post-form">
          <div className="image-upload">
            {imagePreview ? (
              <div className="image-preview">
                <img src={imagePreview} alt="Preview" />
                <button 
                  type="button" 
                  onClick={() => {
                    setImage(null);
                    setImagePreview(null);
                  }}
                  className="change-image-btn"
                >
                  Change Image
                </button>
              </div>
            ) : (
              <label className="image-upload-label">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
                <div className="upload-placeholder">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8.5 11.5a.5.5 0 0 1-1 0V7.707L6.354 8.854a.5.5 0 1 1-.708-.708l2-2a.5.5 0 0 1 .708 0l2 2a.5.5 0 0 1-.708.708L8.5 7.707V11.5z"/>
                    <path d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2zM9.5 3A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5v2z"/>
                  </svg>
                  <p>Click to select an image</p>
                </div>
              </label>
            )}
          </div>

          <div className="form-field">
            <textarea
              placeholder="Write a caption..."
              value={caption}
              onChange={(e) => setCaption(e.target.value.slice(0, MAX_CAPTION_LENGTH))}
              rows="3"
              className="caption-input"
              maxLength={MAX_CAPTION_LENGTH}
            />
            <div className="char-counter">
              {caption.length}/{MAX_CAPTION_LENGTH}
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button 
            type="submit" 
            className="btn btn-primary submit-btn"
            disabled={loading || !image}
          >
            {loading ? 'Posting...' : 'Share Post'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreatePost;

