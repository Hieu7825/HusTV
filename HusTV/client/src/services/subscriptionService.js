// client/src/services/subscriptionService.js
import api from "../lib/axios";

export const subscriptionService = {
  // Get all plans
  getAllPlans: async () => {
    return api.get("/subscriptions/plans");
  },

  // Get single plan
  getPlanById: async (planId) => {
    return api.get(`/subscriptions/plans/${planId}`);
  },

  // Get user's subscriptions
  getUserSubscriptions: async () => {
    return api.get("/subscriptions/my-subscriptions");
  },

  // Get current subscription
  getCurrentSubscription: async () => {
    return api.get("/subscriptions/current");
  },

  // Check subscription status
  checkSubscriptionStatus: async () => {
    return api.get("/subscriptions/status");
  },

  // Create subscription (purchase)
  createSubscription: async (planId) => {
    return api.post("/subscriptions/create", { planId });
  },

  // Cancel subscription
  cancelSubscription: async (subscriptionId) => {
    return api.delete(`/subscriptions/${subscriptionId}/cancel`);
  },

  // Get upgrade options
  getUpgradeOptions: async () => {
    return api.get("/subscriptions/upgrade-options");
  },

  // Check if can upgrade
  canUpgrade: async () => {
    return api.get("/subscriptions/can-upgrade");
  },

  // Upgrade subscription
  upgradeSubscription: async (newPlanId) => {
    return api.post("/subscriptions/upgrade", { newPlanId });
  },

  // ADMIN: Create/Update plan
  createOrUpdatePlan: async (planId, data) => {
    return api.post(`/subscriptions/plans/${planId}`, data);
  },

  // ADMIN: Delete plan
  deletePlan: async (planId) => {
    return api.delete(`/subscriptions/plans/${planId}`);
  },

  // ADMIN: Toggle plan status
  togglePlanStatus: async (planId) => {
    return api.patch(`/subscriptions/plans/${planId}/toggle`);
  },
};

export default subscriptionService;
