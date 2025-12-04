// client/src/services/adminService.js
import api from "../lib/axios";

export const adminService = {
  // ✅ THÊM MỚI: Check if current user is admin
  checkAdmin: async () => {
    return api.get("/admin/check");
  },

  // Dashboard - Single optimized API call
  getDashboardStats: async () => {
    return api.get("/admin/dashboard/stats");
  },

  // Users Management
  getAllUsers: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/admin/users${queryString ? `?${queryString}` : ""}`);
  },

  toggleUserBan: async (userId) => {
    return api.patch(`/admin/users/${userId}/ban`);
  },

  // Subscriptions Management
  getAllSubscriptions: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(
      `/admin/subscriptions${queryString ? `?${queryString}` : ""}`
    );
  },
};

export default adminService;
