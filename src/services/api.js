import axios from 'axios';

// Use environment variables for API URLs
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
export const UPLOADS_BASE_URL = import.meta.env.VITE_UPLOADS_BASE_URL || 'http://localhost:8000/uploads';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 errors and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 error and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Don't try to refresh if this is a login or register request
      if (originalRequest.url?.includes('/login') || originalRequest.url?.includes('/register')) {
        return Promise.reject(error);
      }

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        
        if (refreshToken) {
          // Try to refresh the access token
          const response = await axios.post(`${API_BASE_URL}/users/refresh`, {
            refresh_token: refreshToken
          });

          const { access_token, refresh_token: newRefreshToken } = response.data;
          
          // Store new tokens
          localStorage.setItem('token', access_token);
          if (newRefreshToken) {
            localStorage.setItem('refresh_token', newRefreshToken);
          }

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        } else {
          // No refresh token, only redirect if not already on login page
          if (!window.location.pathname.includes('/login')) {
            localStorage.removeItem('token');
            localStorage.removeItem('refresh_token');
            window.location.href = '/login';
          }
        }
      } catch (refreshError) {
        // Refresh failed, only redirect if not already on login page
        if (!window.location.pathname.includes('/login')) {
          localStorage.removeItem('token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (userData) => {
    const response = await api.post('/users/register', userData);
    return response.data;
  },
  
  login: async (username, password) => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    
    const response = await api.post('/users/login', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  
  getCurrentUser: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },
};

// Users API
export const usersAPI = {
  getAllUsers: async () => {
    const response = await api.get('/users/');
    return response.data;
  },

  getUser: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },
  
  getUserByUsername: async (username) => {
    const response = await api.get(`/users/username/${username}`);
    return response.data;
  },
  
  updateProfile: async (profileData) => {
    const response = await api.put('/users/profile', profileData);
    return response.data;
  },
  
  uploadProfilePicture: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/users/profile/picture', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  
  searchUsers: async (query, limit = 20) => {
    const response = await api.get(`/users/search/${query}`, {
      params: { limit },
    });
    return response.data;
  },
};

// Posts API
export const postsAPI = {
  createPost: async (caption, image, tags) => {
    const formData = new FormData();
    if (caption) formData.append('caption', caption);
    formData.append('image', image);
    if (tags) formData.append('tags', tags);
    
    const response = await api.post('/posts/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  
  getPosts: async (skip = 0, limit = 20) => {
    const response = await api.get('/posts/', {
      params: { skip, limit },
    });
    return response.data;
  },
  
  getFollowingPosts: async (skip = 0, limit = 20) => {
    const response = await api.get('/posts/following', {
      params: { skip, limit },
    });
    return response.data;
  },
  
  getPost: async (postId) => {
    const response = await api.get(`/posts/${postId}`);
    return response.data;
  },
  
  getUserPosts: async (userId, skip = 0, limit = 20) => {
    const response = await api.get(`/posts/user/${userId}`, {
      params: { skip, limit },
    });
    return response.data;
  },
  
  updatePost: async (postId, data) => {
    const response = await api.put(`/posts/${postId}`, data);
    return response.data;
  },
  
  deletePost: async (postId) => {
    await api.delete(`/posts/${postId}`);
  },
};

// Social API
export const socialAPI = {
  // Comments
  createComment: async (postId, text, parentId = null) => {
    const response = await api.post('/social/comments', {
      post_id: postId,
      text,
      parent_id: parentId,  // For replies
    });
    return response.data;
  },
  
  getPostComments: async (postId) => {
    const response = await api.get(`/social/comments/post/${postId}`);
    return response.data;
  },
  
  deleteComment: async (commentId) => {
    await api.delete(`/social/comments/${commentId}`);
  },
  
  // Likes
  likePost: async (postId) => {
    const response = await api.post('/social/likes', {
      post_id: postId,
    });
    return response.data;
  },
  
  unlikePost: async (postId) => {
    await api.delete(`/social/likes/post/${postId}`);
  },
  
  getPostLikes: async (postId) => {
    const response = await api.get(`/social/likes/post/${postId}`);
    return response.data;
  },
  
  // Follows
  followUser: async (userId) => {
    const response = await api.post('/social/follows', {
      following_id: userId,
    });
    return response.data;
  },
  
  unfollowUser: async (userId) => {
    await api.delete(`/social/follows/${userId}`);
  },
  
  getFollowers: async (userId) => {
    const response = await api.get(`/social/followers/${userId}`);
    return response.data;
  },
  
  getFollowing: async (userId) => {
    const response = await api.get(`/social/following/${userId}`);
    return response.data;
  },
  
  // Stories
  createStory: async (formData) => {
    const response = await api.post('/social/stories', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  
  getStories: async () => {
    const response = await api.get('/social/stories');
    return response.data;
  },
  
  getUserStories: async (userId) => {
    const response = await api.get(`/social/stories/user/${userId}`);
    return response.data;
  },

  markStoryViewed: async (storyId) => {
    await api.post(`/social/stories/${storyId}/view`);
  },

  getStoryViewers: async (storyId) => {
    const response = await api.get(`/social/stories/${storyId}/views`);
    return response.data;
  },
  
  updateStory: async (storyId, caption) => {
    const formData = new FormData();
    formData.append('caption', caption);
    const response = await api.put(`/social/stories/${storyId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  
  deleteStory: async (storyId) => {
    await api.delete(`/social/stories/${storyId}`);
  },
};

// Notifications API
export const notificationsAPI = {
  getNotifications: async (skip = 0, limit = 50) => {
    const response = await api.get('/notifications/', {
      params: { skip, limit },
    });
    return response.data;
  },
  
  getUnreadNotifications: async () => {
    const response = await api.get('/notifications/unread');
    return response.data;
  },
  
  getUnreadCount: async () => {
    const response = await api.get('/notifications/unread/count');
    return response.data;
  },
  
  markAsRead: async (notificationId) => {
    const response = await api.put(`/notifications/${notificationId}/read`);
    return response.data;
  },
  
  markAllAsRead: async () => {
    const response = await api.put('/notifications/read-all');
    return response.data;
  },
  
  deleteNotification: async (notificationId) => {
    await api.delete(`/notifications/${notificationId}`);
  },
  
  clearAll: async () => {
    await api.delete('/notifications/clear-all');
  },
};

export default api;

