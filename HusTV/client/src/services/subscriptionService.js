// ============================================
// FILE 1: client/src/services/subscriptionService.js
// ============================================
import api from "../lib/axios";

/**
 * Subscription Service
 * Handles all subscription-related API calls
 */
export const subscriptionService = {
  /**
   * Get all subscription plans
   * @returns {Promise} Plans array
   */
  getAllPlans: async () => {
    try {
      const response = await api.get("/subscriptions/plans");
      return response;
    } catch (error) {
      console.error("❌ Failed to fetch plans:", error);
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
};

export default subscriptionService;
