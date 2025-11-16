import { useState, useEffect, useCallback } from 'react';
import { socialAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { getProfilePictureUrl, getStoryMediaUrl } from '../utils/imageUtils';
import '../styling/StoryViewer.css';

function StoryViewer({ userId, onClose }) {
  const { user: currentUser } = useAuth();
  const [stories, setStories] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [viewers, setViewers] = useState([]);
  const [viewersLoading, setViewersLoading] = useState(false);
  const [viewersError, setViewersError] = useState('');
  const [showViewers, setShowViewers] = useState(false);

  useEffect(() => {
    loadUserStories();
  }, [userId]);

  useEffect(() => {
    if (stories.length === 0) return;

    // Auto-advance to next story after 5 seconds
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + 2; // 2% every 100ms = 5 seconds total
      });
    }, 100);

    return () => clearInterval(timer);
  }, [currentIndex, stories]);

  const loadUserStories = async () => {
    try {
      const userStories = await socialAPI.getUserStories(userId);
      if (userStories.length === 0) {
        setError('No active stories');
        setTimeout(onClose, 2000);
        return;
      }
      setStories(userStories);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load stories');
      setTimeout(onClose, 2000);
    } finally {
      setLoading(false);
    }
  };

  const recordStoryView = useCallback(async (story) => {
    if (!story || !currentUser || story.user_id === currentUser.id) return;
    try {
      await socialAPI.markStoryViewed(story.id);
    } catch (err) {
      console.error('Failed to record story view', err);
    }
  }, [currentUser]);

  useEffect(() => {
    if (stories.length === 0) return;
    recordStoryView(stories[currentIndex]);
  }, [stories, currentIndex, recordStoryView]);

  useEffect(() => {
    setShowViewers(false);
    setViewers([]);
    setViewersError('');
  }, [currentIndex]);

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setProgress(0);
    }
  };

  const loadViewers = useCallback(async (storyId) => {
    try {
      setViewersLoading(true);
      setViewersError('');
      const data = await socialAPI.getStoryViewers(storyId);
      setViewers(data);
    } catch (err) {
      setViewersError('Failed to load viewers');
    } finally {
      setViewersLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!showViewers) return;
    const story = stories[currentIndex];
    if (!story || story.user_id !== currentUser?.id) return;
    setViewers(story.viewers || []);
    loadViewers(story.id);
  }, [showViewers, stories, currentIndex, currentUser, loadViewers]);

  const handleDelete = async () => {
    if (!window.confirm('Delete this story?')) return;

    try {
      await socialAPI.deleteStory(stories[currentIndex].id);
      const updatedStories = stories.filter((_, i) => i !== currentIndex);
      
      if (updatedStories.length === 0) {
        onClose();
      } else {
        setStories(updatedStories);
        if (currentIndex >= updatedStories.length) {
          setCurrentIndex(updatedStories.length - 1);
        }
        setProgress(0);
      }
    } catch (err) {
      setError('Failed to delete story');
    }
  };

  if (loading) {
    return (
      <div className="story-viewer-overlay">
        <div className="story-viewer-loading">Loading...</div>
      </div>
    );
  }

  if (error || stories.length === 0) {
    return (
      <div className="story-viewer-overlay" onClick={onClose}>
        <div className="story-viewer-error">{error || 'No stories available'}</div>
      </div>
    );
  }

  const currentStory = stories[currentIndex];

  return (
    <div className="story-viewer-overlay" onClick={onClose}>
      <div className="story-viewer" onClick={(e) => e.stopPropagation()}>
        {/* Progress bars */}
        <div className="story-progress-bars">
          {stories.map((_, index) => (
            <div key={index} className="story-progress-bar">
              <div
                className="story-progress-fill"
                style={{
                  width: index < currentIndex ? '100%' : index === currentIndex ? `${progress}%` : '0%'
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="story-header">
          <div className="story-user-info">
            {currentStory.user?.profile?.profile_picture ? (
              <img
                src={getProfilePictureUrl(currentStory.user.profile.profile_picture)}
                alt={currentStory.user.username}
                className="story-user-avatar"
              />
            ) : (
              <div className="story-user-avatar-placeholder">
                {currentStory.user?.username?.[0]?.toUpperCase()}
              </div>
            )}
            <span className="story-username">{currentStory.user?.username}</span>
            <span className="story-time">
              {new Date(currentStory.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <button onClick={onClose} className="story-close-btn">×</button>
        </div>

        {/* Story Media (Image or Video) */}
        <div className="story-content">
          {currentStory.media_type === 'video' ? (
            <video
              src={getStoryMediaUrl(currentStory.image)}
              className="story-video"
              autoPlay
              loop
              muted
              playsInline
            />
          ) : (
            <img
              src={getStoryMediaUrl(currentStory.image)}
              alt="Story"
              className="story-image"
            />
          )}
          {currentStory.caption && (
            <div className="story-caption">{currentStory.caption}</div>
          )}
        </div>

        {/* Navigation */}
        <div className="story-navigation">
          {currentIndex > 0 && (
            <button onClick={handlePrev} className="story-nav-btn story-nav-prev">
              ‹
            </button>
          )}
          {currentIndex < stories.length - 1 && (
            <button onClick={handleNext} className="story-nav-btn story-nav-next">
              ›
            </button>
          )}
        </div>

        {/* Viewers & Delete controls for own stories */}
        {currentStory.user_id === currentUser?.id && (
          <>
            <div className="story-viewers-panel">
              <button
                className="story-viewers-toggle"
                onClick={() => setShowViewers(!showViewers)}
              >
                {currentStory.views_count > 0
                  ? `Viewed by ${currentStory.views_count} ${currentStory.views_count === 1 ? 'person' : 'people'}`
                  : 'No viewers yet'}
              </button>
              {showViewers && (
                <div className="story-viewers-list" onClick={(e) => e.stopPropagation()}>
                  {viewersLoading && <div className="story-viewers-loading">Loading viewers...</div>}
                  {!viewersLoading && viewersError && (
                    <div className="story-viewers-error">{viewersError}</div>
                  )}
                  {!viewersLoading && !viewersError && viewers.length === 0 && (
                    <div className="story-viewers-empty">No viewers yet</div>
                  )}
                  {!viewersLoading && !viewersError && viewers.length > 0 && (
                    <ul>
                      {viewers.map((viewer) => (
                        <li key={viewer.id}>
                          {viewer.profile_picture ? (
                            <img
                              src={getProfilePictureUrl(viewer.profile_picture)}
                              alt={viewer.username}
                            />
                          ) : (
                            <div className="story-viewer-placeholder">
                              {viewer.username?.[0]?.toUpperCase()}
                            </div>
                          )}
                          <div className="story-viewer-meta">
                            <span className="story-viewer-name">{viewer.username}</span>
                            <span className="story-viewer-time">
                              {new Date(viewer.viewed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
            <button onClick={handleDelete} className="story-delete-btn">
              🗑️ Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default StoryViewer;

