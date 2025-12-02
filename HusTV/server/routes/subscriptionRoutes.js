// ============================================
// FILE 1: server/routes/subscriptionRoutes.js (FIXED)
// ============================================
import express from "express";
import {
  getAllPlans,
  createSubscription,
  getCurrentSubscription,
  getSubscriptionHistory,
  cancelSubscription,
} from "../controllers/subscriptionController.js";
import { protectUser } from "../middleware/auth.js"; // ✅ FIXED: Import from auth.js
import { paymentLimiter } from "../middleware/rateLimiter.js"; // ✅ FIXED: Import from rateLimiter.js
import { validateCreateSubscription } from "../middleware/validation.js"; // ✅ FIXED: Import from validation.js

const router = express.Router();

/**
 * Public Routes
 */

// Get all subscription plans
// GET /api/subscriptions/plans
router.get("/plans", getAllPlans);

/**
 * Protected Routes (require authentication)
 */

// Create new subscription (initiate payment)
// POST /api/subscriptions/create
// Body: { planId: "plan_premium_v3" }
router.post(
  "/create",
  protectUser, // Verify Clerk auth
  paymentLimiter, // Rate limit: 10 requests per hour
  validateCreateSubscription, // Validate request body
  createSubscription
);

// Get current active subscription
// GET /api/subscriptions/current
router.get("/current", protectUser, getCurrentSubscription);

// Get subscription history
// GET /api/subscriptions/history
router.get("/history", protectUser, getSubscriptionHistory);

// Cancel subscription
// POST /api/subscriptions/cancel
router.post("/cancel", protectUser, cancelSubscription);

export default router;
