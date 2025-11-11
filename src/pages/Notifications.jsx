import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { notificationsAPI } from '../services/api';
import './Notifications.css';

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await notificationsAPI.getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationsAPI.markAsRead(notificationId);
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, is_read: true } : n
      ));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await notificationsAPI.deleteNotification(notificationId);
      setNotifications(notifications.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  if (loading) {
    return <div className="spinner"></div>;
  }

  return (
    <div className="notifications">
      <div className="notifications-container">
        <div className="notifications-header">
          <h1>Notifications</h1>
          {notifications.some(n => !n.is_read) && (
            <button onClick={handleMarkAllAsRead} className="btn btn-secondary">
              Mark all as read
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="no-notifications">
            <p>No notifications yet.</p>
          </div>
        ) : (
          <div className="notifications-list">
            {notifications.map(notification => (
              <div 
                key={notification.id} 
                className={`notification-item ${!notification.is_read ? 'unread' : ''}`}
                onClick={() => !notification.is_read && handleMarkAsRead(notification.id)}
              >
                <Link 
                  to={`/profile/${notification.sender_username}`}
                  className="notification-avatar"
                >
                  {notification.sender_profile_picture ? (
                    <img 
                      src={`http://localhost:8000/uploads/profiles/${notification.sender_profile_picture}`} 
                      alt={notification.sender_username} 
                    />
                  ) : (
                    <div className="avatar-placeholder">
                      {notification.sender_username?.[0]?.toUpperCase()}
                    </div>
                  )}
                </Link>

                <div className="notification-content">
                  <p className="notification-message">
                    <Link 
                      to={`/profile/${notification.sender_username}`}
                      className="notification-username"
                    >
                      {notification.sender_username}
                    </Link>
                    {' '}
                    {notification.message.split(notification.sender_username)[1]}
                  </p>
                  <span className="notification-time">
                    {new Date(notification.timestamp).toLocaleDateString()}
                  </span>
                </div>

                {notification.post_id && (
                  <Link 
                    to={`/post/${notification.post_id}`}
                    className="notification-post-link"
                  >
                    View Post
                  </Link>
                )}

                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(notification.id);
                  }}
                  className="notification-delete"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Notifications;

