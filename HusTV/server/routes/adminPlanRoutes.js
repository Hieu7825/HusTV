// ============================================
// FILE: server/routes/adminPlanRoutes.js
// ============================================
import express from "express";
import SubscriptionPlan from "../models/SubscriptionPlan.js";
import { protectAdmin } from "../middleware/auth.js";
import { validateCreatePlan } from "../middleware/validation.js";

const router = express.Router();

/**
 * Get all plans (including inactive) - Admin only
 * GET /api/admin/plans
 */
router.get("/", protectAdmin, async (req, res) => {
  try {
    const plans = await SubscriptionPlan.find().sort({
      duration: 1,
      tierRank: 1,
    });

    res.json({
      success: true,
      plans,
      count: plans.length,
    });
  } catch (error) {
    console.error("❌ Error fetching all plans:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch plans",
      error: error.message,
    });
  }
});

/**
 * Get single plan by ID - Admin only
 * GET /api/admin/plans/:id
 */
router.get("/:id", protectAdmin, async (req, res) => {
  try {
    const plan = await SubscriptionPlan.findById(req.params.id);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Plan not found",
      });
    }

    res.json({
      success: true,
      plan,
    });
  } catch (error) {
    console.error("❌ Error fetching plan:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch plan",
      error: error.message,
    });
  }
});

/**
 * Create new plan - Admin only
 * POST /api/admin/plans
 */
router.post("/", protectAdmin, validateCreatePlan, async (req, res) => {
  try {
    const {
      _id,
      planName,
      price,
      description,
      features,
      connectedDevices,
      duration,
      isPopular,
      isActive,
    } = req.body;

    // Check if plan with this ID already exists
    const existingPlan = await SubscriptionPlan.findById(_id);
    if (existingPlan) {
      return res.status(400).json({
        success: false,
        message: "Plan with this ID already exists",
      });
    }

    // Create new plan (tierRank will be auto-calculated)
    const plan = await SubscriptionPlan.create({
      _id,
      planName,
      price,
      description,
      features,
      connectedDevices,
      duration,
      isPopular,
      isActive,
    });

    console.log(`✅ Created plan: ${plan._id} with rank ${plan.tierRank}`);

    res.status(201).json({
      success: true,
      message: "Plan created successfully",
      plan,
    });
  } catch (error) {
    console.error("❌ Error creating plan:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create plan",
      error: error.message,
    });
  }
});

/**
 * Update existing plan - Admin only
 * PUT /api/admin/plans/:id
 */
router.put("/:id", protectAdmin, validateCreatePlan, async (req, res) => {
  try {
    const {
      planName,
      price,
      description,
      features,
      connectedDevices,
      duration,
      isPopular,
      isActive,
    } = req.body;

    const plan = await SubscriptionPlan.findById(req.params.id);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Plan not found",
      });
    }

    // Update fields
    plan.planName = planName;
    plan.price = price;
    plan.description = description;
    plan.features = features;
    plan.connectedDevices = connectedDevices;
    plan.duration = duration;
    plan.isPopular = isPopular;
    plan.isActive = isActive;

    // Save (tierRank will be auto-recalculated)
    await plan.save();

    console.log(`✅ Updated plan: ${plan._id} with new rank ${plan.tierRank}`);

    res.json({
      success: true,
      message: "Plan updated successfully",
      plan,
    });
  } catch (error) {
    console.error("❌ Error updating plan:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update plan",
      error: error.message,
    });
  }
});

/**
 * Delete plan - Admin only
 * DELETE /api/admin/plans/:id
 */
router.delete("/:id", protectAdmin, async (req, res) => {
  try {
    const plan = await SubscriptionPlan.findById(req.params.id);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Plan not found",
      });
    }

    // Check if plan has active subscriptions
    const Subscription = (await import("../models/Subscription.js")).default;
    const activeSubscriptions = await Subscription.countDocuments({
      plan: req.params.id,
      status: "Active",
      isPaid: true,
    });

    if (activeSubscriptions > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete plan with ${activeSubscriptions} active subscription(s)`,
      });
    }

    await plan.deleteOne();

    console.log(`✅ Deleted plan: ${req.params.id}`);

    // Recalculate ranks after deletion
    await SubscriptionPlan.recalculateAllRanks();

    res.json({
      success: true,
      message: "Plan deleted successfully",
    });
  } catch (error) {
    console.error("❌ Error deleting plan:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete plan",
      error: error.message,
    });
  }
});

/**
 * Recalculate all tier ranks - Admin only
 * POST /api/admin/plans/recalculate-ranks
 */
router.post("/recalculate-ranks", protectAdmin, async (req, res) => {
  try {
    const result = await SubscriptionPlan.recalculateAllRanks();

    res.json({
      success: true,
      message: "Tier ranks recalculated successfully",
      updated: result,
    });
  } catch (error) {
    console.error("❌ Error recalculating ranks:", error);
    res.status(500).json({
      success: false,
      message: "Failed to recalculate tier ranks",
      error: error.message,
    });
  }
});

export default router;
