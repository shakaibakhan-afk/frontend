import { UPLOADS_BASE_URL } from '../services/api';

/**
 * Build full URL for uploaded images
 * @param {string} path - Relative path (e.g., 'profiles/image.jpg')
 * @returns {string} Full URL
 */
export const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path; // Already full URL
  return `${UPLOADS_BASE_URL}/${path}`;
};

/**
 * Build profile picture URL
 * @param {string} filename - Profile picture filename
 * @returns {string} Full URL
 */
export const getProfilePictureUrl = (filename) => {
  if (!filename) return null;
  return getImageUrl(`profiles/${filename}`);
};

/**
 * Build post image URL
 * @param {string} filename - Post image filename
 * @returns {string} Full URL
 */
export const getPostImageUrl = (filename) => {
  if (!filename) return null;
  return getImageUrl(`posts/${filename}`);
};

/**
 * Build story media URL
 * @param {string} filename - Story media filename
 * @returns {string} Full URL
 */
export const getStoryMediaUrl = (filename) => {
  if (!filename) return null;
  return getImageUrl(`stories/${filename}`);
};

