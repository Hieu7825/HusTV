// client/src/services/subscriptionService.js
import api from "../lib/axios";

/**
 * Subscription Service
 * Handles all subscription-related API calls
 */
export const subscriptionService = {
  /**
   * Get all subscription plans (including inactive for admin)
   * @param {boolean} includeInactive - Include inactive plans (admin only)
   * @returns {Promise} Plans array
   */
  getAllPlans: async (includeInactive = false) => {
    try {
      const response = await api.get("/subscriptions/plans", {
        params: { includeInactive },
      });
      return response;
    } catch (error) {
      console.error("❌ Failed to fetch plans:", error);
      throw error;
    }
  },

  /**
   * Get single plan by ID
   * @param {string} planId - Plan ID
   * @returns {Promise} Plan details
   */
  getPlanById: async (planId) => {
    try {
      const response = await api.get(`/subscriptions/plans/${planId}`);
      return response;
    } catch (error) {
      console.error("❌ Failed to fetch plan:", error);
      throw error;
    }
  },

  /**
   * Create or update subscription plan (Admin only)
   * @param {string} planId - Plan ID ("new" for creating new plan)
   * @param {object} planData - Plan data
   * @returns {Promise} Created/updated plan
   */
  createOrUpdatePlan: async (planId, planData) => {
    try {
      let response;

      if (planId === "new" || !planId) {
        // Create new plan
        response = await api.post("/admin/plans", planData);
      } else {
        // Update existing plan
        response = await api.put(`/admin/plans/${planId}`, planData);
      }

      return response;
    } catch (error) {
      console.error("❌ Failed to save plan:", error);
      throw error;
    }
  },

  /**
   * Delete subscription plan (Admin only)
   * @param {string} planId - Plan ID to delete
   * @returns {Promise} Deletion result
   */
  deletePlan: async (planId) => {
    try {
      const response = await api.delete(`/admin/plans/${planId}`);
      return response;
    } catch (error) {
      console.error("❌ Failed to delete plan:", error);
      throw error;
    }
  },

  /**
   * Recalculate all tier ranks (Admin only)
   * @returns {Promise} Recalculation result
   */
  recalculateRanks: async () => {
    try {
      const response = await api.post("/admin/plans/recalculate-ranks");
      return response;
    } catch (error) {
      console.error("❌ Failed to recalculate ranks:", error);
      throw error;
    }
  },

  /**
   * Get current active subscription
   * @returns {Promise} Current subscription or null
   */
  getCurrentSubscription: async () => {
    try {
      const response = await api.get("/subscriptions/current");
      return response;
    } catch (error) {
      console.error("❌ Failed to fetch current subscription:", error);
      throw error;
    }
  },

  /**
   * Get subscription history
   * @returns {Promise} Array of past subscriptions
   */
  getSubscriptionHistory: async () => {
    try {
      const response = await api.get("/subscriptions/history");
      return response;
    } catch (error) {
      console.error("❌ Failed to fetch subscription history:", error);
      throw error;
    }
  },

  /**
   * Create new subscription (initiate payment)
   * @param {string} planId - Plan ID to subscribe to
   * @returns {Promise} Checkout session URL
   */
  createSubscription: async (planId) => {
    try {
      const response = await api.post("/subscriptions/create", { planId });
      return response;
    } catch (error) {
      console.error("❌ Failed to create subscription:", error);
      throw error;
    }
  },

  /**
   * Cancel current subscription
   * @returns {Promise} Cancellation result
   */
  cancelSubscription: async () => {
    try {
      const response = await api.post("/subscriptions/cancel");
      return response;
    } catch (error) {
      console.error("❌ Failed to cancel subscription:", error);
      throw error;
    }
  },

  /**
   * Upgrade subscription to new plan
   * @param {string} newPlanId - New plan ID
   * @returns {Promise} Upgrade checkout session
   */
  upgradeSubscription: async (newPlanId) => {
    try {
      const response = await api.post("/subscriptions/upgrade", { newPlanId });
      return response;
    } catch (error) {
      console.error("❌ Failed to upgrade subscription:", error);
      throw error;
    }
  },
  syncClerkMetadata: async () => {
    return api.post("/subscriptions/sync-clerk");
  },
};

export default subscriptionService;
