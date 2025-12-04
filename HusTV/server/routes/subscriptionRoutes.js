// ============================================
// FILE 4: server/routes/subscriptionRoutes.js (UPDATED)
// ============================================
import express from "express";
import {
  getAllPlans,
  recalculateRanks, // ✅ NEW
  createSubscription,
  getCurrentSubscription,
  getSubscriptionHistory,
  cancelSubscription,
  syncClerkMetadata,
} from "../controllers/subscriptionController.js";
import { protectUser, protectAdmin } from "../middleware/auth.js";
import { paymentLimiter } from "../middleware/rateLimiter.js";
import { validateCreateSubscription } from "../middleware/validation.js";

const router = express.Router();

/**
 * Public Routes
 */
router.get("/plans", getAllPlans);

/**
 * Admin Routes
 */
// ✅ NEW: Manual recalculate ranks endpoint
router.post("/plans/recalculate-ranks", protectAdmin, recalculateRanks);

/**
 * Protected Routes (require authentication)
 */
router.post(
  "/create",
  protectUser,
  paymentLimiter,
  validateCreateSubscription,
  createSubscription
);

router.get("/current", protectUser, getCurrentSubscription);
router.get("/history", protectUser, getSubscriptionHistory);
router.post("/cancel", protectUser, cancelSubscription);
router.post("/sync-clerk", protectUser, syncClerkMetadata);

export default router;
