// client/src/services/adminService.js
import api from "../lib/axios";

export const adminService = {
  // Dashboard
  getDashboardStats: async () => {
    return api.get("/admin/dashboard/stats");
  },

  // Users Management
  getAllUsers: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/admin/users?${queryString}`);
  },

  getUserById: async (userId) => {
    return api.get(`/admin/users/${userId}`);
  },

  updateUserRole: async (userId, role) => {
    return api.patch(`/admin/users/${userId}/role`, { role });
  },

  // Subscriptions Management
  getAllSubscriptions: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/admin/subscriptions?${queryString}`);
  },

  // Revenue Analytics
  getRevenueStats: async () => {
    return api.get("/admin/revenue");
  },

  // Video Management
  getTopVideos: async () => {
    return api.get("/admin/videos/top");
  },

  // Activity Logs
  getActivities: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/admin/activities?${queryString}`);
  },
};

export default adminService;
