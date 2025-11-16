import { useState } from 'react';
import { socialAPI } from '../services/api';
import '../styling/CreateStory.css';

function CreateStory({ onClose, onStoryCreated }) {
  const [media, setMedia] = useState(null);
  const [mediaType, setMediaType] = useState('');  // 'image' or 'video'
  const [caption, setCaption] = useState('');
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file type
      const type = file.type.startsWith('video/') ? 'video' : 'image';
      
      // Set size limit based on type (50MB for videos, 10MB for images)
      const maxSize = type === 'video' ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
      
      if (file.size > maxSize) {
        setError(`File size must be less than ${maxSize / (1024 * 1024)}MB`);
        return;
      }
      
      setMedia(file);
      setMediaType(type);
      setPreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!media) {
      setError('Please select an image or video');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('media', media);  // Changed from 'image' to 'media'
      if (caption) {
        formData.append('caption', caption);
      }

      const newStory = await socialAPI.createStory(formData);
      onStoryCreated(newStory);
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create story');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content create-story-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create Story</h2>
          <button onClick={onClose} className="modal-close">×</button>
        </div>

        <form onSubmit={handleSubmit} className="create-story-form">
          {preview ? (
            <div className="story-preview">
              {mediaType === 'video' ? (
                <video src={preview} controls className="story-video-preview" />
              ) : (
                <img src={preview} alt="Preview" className="story-image-preview" />
              )}
              <button
                type="button"
                onClick={() => {
                  setMedia(null);
                  setMediaType('');
                  setPreview('');
                }}
                className="remove-preview"
              >
                ×
              </button>
            </div>
          ) : (
            <div className="story-upload">
              <label htmlFor="story-media" className="upload-label">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M.002 3a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-12a2 2 0 0 1-2-2V3zm1 9v1a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12zm5-6.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0z"/>
                </svg>
                <p>Click to upload photo or video</p>
                <span style={{fontSize: '12px', color: '#8e8e8e'}}>Images up to 10MB, Videos up to 50MB</span>
              </label>
              <input
                id="story-media"
                type="file"
                accept="image/*,video/*"
                onChange={handleMediaChange}
                className="file-input-hidden"
              />
            </div>
          )}

          {preview && (
            <div className="form-group">
              <input
                type="text"
                placeholder="Add a caption..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="caption-input"
              />
            </div>
          )}

          {error && <div className="error-message">{error}</div>}

          <div className="modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !media}
            >
              {loading ? 'Sharing...' : 'Share Story'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateStory;

