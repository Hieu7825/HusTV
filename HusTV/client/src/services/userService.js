// client/src/services/userService.js
import api from "../lib/axios";

export const userService = {
  // Get user profile
  getUserProfile: async () => {
    return api.get("/users/profile");
  },

  // Get user stats
  getUserStats: async () => {
    return api.get("/users/stats");
  },

  // FAVORITES
  getFavorites: async () => {
    return api.get("/users/favorites");
  },

  toggleFavorite: async (videoId) => {
    return api.post("/users/favorites", { videoId });
  },

  checkFavorite: async (videoId) => {
    return api.get(`/users/favorites/${videoId}`);
  },

  // WATCH HISTORY
  getWatchHistory: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/users/watch-history?${queryString}`);
  },

  updateWatchProgress: async (videoId, data) => {
    return api.post(`/users/watch-progress/${videoId}`, data);
  },

  getWatchProgress: async (videoId) => {
    return api.get(`/users/watch-progress/${videoId}`);
  },

  deleteWatchHistory: async (videoId) => {
    return api.delete(`/users/watch-history/${videoId}`);
  },

  clearWatchHistory: async () => {
    return api.delete("/users/watch-history");
  },

  // PREFERENCES
  getPreferences: async () => {
    return api.get("/users/preferences");
  },

  updatePreferences: async (data) => {
    return api.put("/users/preferences", data);
  },

  // DEVICES
  getDevices: async () => {
    return api.get("/users/devices");
  },

  updateDevice: async (data) => {
    return api.post("/users/devices", data);
  },

  removeDevice: async (deviceId) => {
    return api.delete(`/users/devices/${deviceId}`);
  },

  // RECOMMENDATIONS
  getContinueWatching: async () => {
    return api.get("/users/continue-watching");
  },

  getRecommendedVideos: async () => {
    return api.get("/users/recommended");
  },
};

export default userService;
