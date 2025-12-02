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

  // ✅ FIX: Nhận videoId string, extract _id nếu là object
  toggleFavorite: async (videoId) => {
    // Handle both string và object với _id property
    const id = typeof videoId === "string" ? videoId : videoId?._id;

    if (!id) {
      throw new Error("Invalid videoId: must be string or object with _id");
    }

    return api.post("/users/favorites", { videoId: id });
  },

  checkFavorite: async (videoId) => {
    const id = typeof videoId === "string" ? videoId : videoId?._id;
    return api.get(`/users/favorites/${id}`);
  },

  // WATCH HISTORY
  getWatchHistory: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/users/watch-history?${queryString}`);
  },

  updateWatchProgress: async (videoId, data) => {
    const id = typeof videoId === "string" ? videoId : videoId?._id;
    return api.post(`/users/watch-progress/${id}`, data);
  },

  getWatchProgress: async (videoId) => {
    const id = typeof videoId === "string" ? videoId : videoId?._id;
    return api.get(`/users/watch-progress/${id}`);
  },

  deleteWatchHistory: async (videoId) => {
    const id = typeof videoId === "string" ? videoId : videoId?._id;
    return api.delete(`/users/watch-history/${id}`);
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
