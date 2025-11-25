// server/routes/subscriptionRoutes.js
import express from "express";
import {
  protectUser,
  protectAdmin,
  validateCreateSubscription,
  validateUpgradeSubscription,
  validateCreatePlan,
  paymentLimiter,
} from "../middleware/index.js";
import {
  getAllPlans,
  getPlanById,
  createSubscription,
  getUserSubscriptions,
  getCurrentSubscription,
  cancelSubscription,
  checkSubscriptionStatus,
  upgradeSubscription,
  getUpgradeOptions,
  canUpgrade,
  createOrUpdatePlan,
  deletePlan,
  togglePlanStatus,
} from "../controllers/subscriptionController.js";

const router = express.Router();

// Public routes
router.get("/plans", getAllPlans);
router.get("/plans/:planId", getPlanById);

// User routes (protected)
router.post(
  "/create",
  protectUser,
  paymentLimiter,
  validateCreateSubscription,
  createSubscription
);
router.get("/my-subscriptions", protectUser, getUserSubscriptions);
router.get("/current", protectUser, getCurrentSubscription);
router.delete("/:id/cancel", protectUser, cancelSubscription);
router.get("/status", protectUser, checkSubscriptionStatus);

// Upgrade routes
router.post(
  "/upgrade",
  protectUser,
  paymentLimiter,
  validateUpgradeSubscription,
  upgradeSubscription
);
router.get("/upgrade-options", protectUser, getUpgradeOptions);
router.get("/can-upgrade", protectUser, canUpgrade);

// Admin routes
router.post(
  "/plans/:planId",
  protectAdmin,
  validateCreatePlan,
  createOrUpdatePlan
);
router.delete("/plans/:planId", protectAdmin, deletePlan);
router.patch("/plans/:planId/toggle", protectAdmin, togglePlanStatus);

export default router;
