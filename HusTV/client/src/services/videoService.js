// client/src/services/videoService.js
import api from "../lib/axios";

export const videoService = {
  // ==================== PUBLIC ENDPOINTS ====================

  // Get all videos with pagination and filters
  getAllVideos: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/videos${queryString ? `?${queryString}` : ""}`);
  },

  // Get single video by ID
  getVideoById: async (id) => {
    return api.get(`/videos/${id}`);
  },

  // Get featured videos (for homepage)
  getFeaturedVideos: async (limit = 6) => {
    return api.get(`/videos/featured?limit=${limit}`);
  },

  // Get trending videos
  getTrendingVideos: async (limit = 10) => {
    return api.get(`/videos/trending?limit=${limit}`);
  },

  // Search videos with filters
  searchVideos: async (query, filters = {}) => {
    return api.get("/videos/search", {
      params: { q: query, ...filters },
    });
  },

  // Get videos by genre
  getVideosByGenre: async (genreId, page = 1, limit = 20) => {
    return api.get(`/videos/genre/${genreId}`, {
      params: { page, limit },
    });
  },

  // Get streaming URL (protected - requires active subscription)
  getStreamingUrl: async (videoId) => {
    return api.get(`/videos/${videoId}/stream`);
  },

  // Get trailer URL (public - no subscription required)
  getTrailerUrl: async (videoId) => {
    return api.get(`/videos/${videoId}/trailer`);
  },

  // Increment view count
  incrementView: async (videoId) => {
    return api.post(`/videos/${videoId}/view`);
  },

  // ==================== ADMIN ENDPOINTS ====================

  /**
   * Create new video with file uploads
   * ✅ KHÔNG set Content-Type - axios tự động xử lý multipart/form-data
   */
  createVideo: async (videoData, onUploadProgress = null) => {
    try {
      return api.post("/videos", videoData, {
        // ✅ KHÔNG có headers: { "Content-Type": "multipart/form-data" }
        onUploadProgress: (progressEvent) => {
          if (onUploadProgress) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onUploadProgress(percentCompleted);
          }
        },
        timeout: 300000, // 5 minutes
      });
    } catch (error) {
      console.error("Error creating video:", error);
      throw error;
    }
  },

  /**
   * Update existing video
   * ✅ KHÔNG set Content-Type - axios tự động xử lý multipart/form-data
   */
  updateVideo: async (id, videoData, onUploadProgress = null) => {
    try {
      return api.put(`/videos/${id}`, videoData, {
        // ✅ KHÔNG có headers: { "Content-Type": "multipart/form-data" }
        onUploadProgress: (progressEvent) => {
          if (onUploadProgress) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onUploadProgress(percentCompleted);
          }
        },
        timeout: 300000,
      });
    } catch (error) {
      console.error("Error updating video:", error);
      throw error;
    }
  },

  // Delete video (admin only)
  deleteVideo: async (id) => {
    return api.delete(`/videos/${id}`);
  },

  // Toggle featured status (admin only)
  toggleFeatured: async (id) => {
    return api.patch(`/videos/${id}/featured`);
  },

  // Toggle trending status (admin only)
  toggleTrending: async (id) => {
    return api.patch(`/videos/${id}/trending`);
  },

  // Batch operations (admin only)
  batchDelete: async (videoIds) => {
    return api.post("/videos/batch/delete", { videoIds });
  },

  batchUpdateStatus: async (videoIds, status) => {
    return api.post("/videos/batch/status", { videoIds, status });
  },

  // Get video statistics (admin only)
  getVideoStats: async (id) => {
    return api.get(`/videos/${id}/stats`);
  },
};

export default videoService;
