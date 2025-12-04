// ============================================
// FILE 3: server/controllers/subscriptionController.js (UPDATED)
// ============================================
import SubscriptionPlan from "../models/SubscriptionPlan.js";
import Subscription from "../models/Subscription.js";
import User from "../models/User.js";
import { createCheckoutSession } from "../utils/stripe.js";
import { clerkClient } from "@clerk/express";

/**
 * Get all subscription plans
 * GET /api/subscriptions/plans
 * Public route
 */
export const getAllPlans = async (req, res) => {
  try {
    // Get all active plans, sorted by tier rank
    const plans = await SubscriptionPlan.find({ isActive: true }).sort({
      duration: 1, // ✅ UPDATED: Sort by duration first
      tierRank: 1, // Then by tier rank
    });

    res.json({
      success: true,
      plans,
      count: plans.length,
    });
  } catch (error) {
    console.error("❌ Error fetching subscription plans:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch subscription plans",
      error: error.message,
    });
  }
};

/**
 * ✅ NEW: Recalculate all tier ranks manually
 * POST /api/subscriptions/plans/recalculate-ranks
 * Admin only
 */
export const recalculateRanks = async (req, res) => {
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
};

/**
 * Create subscription (initiate payment)
 * POST /api/subscriptions/create
 * Protected route
 */
export const createSubscription = async (req, res) => {
  try {
    const { userId } = req.auth;
    const { planId } = req.body;

    if (!planId) {
      return res.status(400).json({
        success: false,
        message: "Plan ID is required",
      });
    }

    const plan = await SubscriptionPlan.findById(planId);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Subscription plan not found",
      });
    }

    if (!plan.isActive) {
      return res.status(400).json({
        success: false,
        message: "This subscription plan is no longer available",
      });
    }

    let user = await User.findByClerkId(userId);

    if (user && user.subscriptionStatus === "active") {
      const currentSub = await Subscription.findById(
        user.currentSubscription
      ).populate("plan");

      if (currentSub && currentSub.isPaid && currentSub.isValid()) {
        const currentPlan = currentSub.plan;

        if (currentPlan._id === planId) {
          return res.status(400).json({
            success: false,
            message: "You already have this subscription plan",
          });
        }

        if (plan.tierRank < currentPlan.tierRank) {
          return res.status(400).json({
            success: false,
            message:
              "Downgrade is not allowed. You already have a higher tier plan.",
          });
        }

        console.log(
          `🔄 User upgrading from ${currentPlan.planName} to ${plan.planName}`
        );
      }
    }

    const clerkUser = await clerkClient.users.getUser(userId);
    const fullName = `${clerkUser.firstName || ""} ${
      clerkUser.lastName || ""
    }`.trim();
    const userName =
      fullName ||
      clerkUser.username ||
      clerkUser.emailAddresses[0]?.emailAddress.split("@")[0] ||
      "User";
    const userEmail = clerkUser.emailAddresses[0]?.emailAddress || "";

    if (!userEmail) {
      return res.status(400).json({
        success: false,
        message: "User email is required",
      });
    }

    const purchaseDate = new Date();
    const expiryDate = new Date(purchaseDate);

    if (plan.duration === "Yearly") {
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    } else {
      expiryDate.setMonth(expiryDate.getMonth() + 1);
    }

    const isUpgrade =
      user && user.subscriptionStatus === "active" && user.currentSubscription;
    const oldSubscriptionId = isUpgrade
      ? user.currentSubscription.toString()
      : null;

    const subscription = await Subscription.create({
      user: userId,
      userName,
      userEmail,
      plan: planId,
      purchaseDate,
      expiryDate,
      amount: plan.price,
      status: "Pending",
      isPaid: false,
    });

    console.log(`📝 Created subscription document: ${subscription._id}`);

    const checkoutSession = await createCheckoutSession({
      subscriptionId: subscription._id.toString(),
      planName: plan.planName,
      price: plan.price,
      userEmail,
      userName,
      userId,
      planId,
      isUpgrade,
      oldSubscriptionId,
      bookingId: null,
    });

    subscription.paymentLink = checkoutSession.url;
    await subscription.save();

    console.log(
      `✅ Stripe checkout session created: ${checkoutSession.sessionId}`
    );

    res.json({
      success: true,
      message: "Checkout session created successfully",
      url: checkoutSession.url,
      sessionId: checkoutSession.sessionId,
      subscriptionId: subscription._id,
      isUpgrade,
    });
  } catch (error) {
    console.error("❌ Error creating subscription:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create subscription",
      error: error.message,
    });
  }
};

export const getCurrentSubscription = async (req, res) => {
  try {
    const { userId } = req.auth;

    const user = await User.findByClerkId(userId).populate({
      path: "currentSubscription",
      populate: { path: "plan" },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.currentSubscription) {
      return res.json({
        success: true,
        subscription: null,
        message: "No active subscription found",
      });
    }

    const subscription = user.currentSubscription;

    if (!subscription.isPaid || subscription.status !== "Active") {
      return res.json({
        success: true,
        subscription: null,
        message: "No active subscription found",
      });
    }

    if (subscription.isExpired()) {
      subscription.status = "Expired";
      await subscription.save();

      user.subscriptionStatus = "expired";
      user.currentSubscription = null;
      user.subscriptionTier = null;
      await user.save();

      // ✅ UPDATE CLERK METADATA - Remove active subscription
      try {
        const { clerkClient } = await import("@clerk/express");
        await clerkClient.users.updateUserMetadata(userId, {
          publicMetadata: {
            hasActiveSubscription: false,
            subscriptionPlan: null,
            subscriptionExpiry: null,
            subscriptionTier: null,
          },
        });
        console.log(
          `✅ Cleared Clerk metadata for expired subscription: ${userId}`
        );
      } catch (clerkError) {
        console.error("⚠️ Failed to clear Clerk metadata:", clerkError);
      }

      return res.json({
        success: true,
        subscription: null,
        message: "Subscription has expired",
      });
    }

    res.json({
      success: true,
      subscription: {
        _id: subscription._id,
        plan: subscription.plan,
        purchaseDate: subscription.purchaseDate,
        expiryDate: subscription.expiryDate,
        amount: subscription.amount,
        status: subscription.status,
        daysRemaining: subscription.daysRemaining,
        isPaid: subscription.isPaid,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching current subscription:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch current subscription",
      error: error.message,
    });
  }
};

export const getSubscriptionHistory = async (req, res) => {
  try {
    const { userId } = req.auth;

    const subscriptions = await Subscription.find({ user: userId })
      .populate("plan")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      subscriptions,
      count: subscriptions.length,
    });
  } catch (error) {
    console.error("❌ Error fetching subscription history:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch subscription history",
      error: error.message,
    });
  }
};

export const cancelSubscription = async (req, res) => {
  try {
    const { userId } = req.auth;

    const user = await User.findByClerkId(userId);

    if (!user || !user.currentSubscription) {
      return res.status(404).json({
        success: false,
        message: "No active subscription found",
      });
    }

    const subscription = await Subscription.findById(user.currentSubscription);

    if (!subscription || !subscription.isPaid) {
      return res.status(404).json({
        success: false,
        message: "No active subscription found",
      });
    }

    subscription.status = "Cancelled";
    await subscription.save();

    user.subscriptionStatus = "cancelled";
    user.currentSubscription = null;
    user.subscriptionTier = null;
    await user.save();

    // ✅ UPDATE CLERK METADATA - Remove active subscription
    try {
      const { clerkClient } = await import("@clerk/express");
      await clerkClient.users.updateUserMetadata(userId, {
        publicMetadata: {
          hasActiveSubscription: false,
          subscriptionPlan: null,
          subscriptionExpiry: null,
          subscriptionTier: null,
        },
      });
      console.log(
        `✅ Cleared Clerk metadata for cancelled subscription: ${userId}`
      );
    } catch (clerkError) {
      console.error("⚠️ Failed to clear Clerk metadata:", clerkError);
    }

    console.log(`❌ Subscription cancelled for user: ${userId}`);

    res.json({
      success: true,
      message: "Subscription cancelled successfully",
    });
  } catch (error) {
    console.error("❌ Error cancelling subscription:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel subscription",
      error: error.message,
    });
  }
};
export const syncClerkMetadata = async (req, res) => {
  try {
    const { userId } = req.auth;

    const user = await User.findByClerkId(userId).populate({
      path: "currentSubscription",
      populate: { path: "plan" },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const subscription = user.currentSubscription;

    // Check if has active subscription
    const hasActive =
      subscription &&
      subscription.isPaid &&
      subscription.status === "Active" &&
      new Date(subscription.expiryDate) > new Date();

    // Update Clerk metadata
    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        hasActiveSubscription: hasActive,
        subscriptionPlan: hasActive ? subscription.plan?.planName : null,
        subscriptionExpiry: hasActive
          ? subscription.expiryDate.toISOString()
          : null,
        subscriptionTier: hasActive ? subscription.plan?.tierRank : null,
      },
    });

    console.log(`✅ Synced Clerk metadata for user ${userId}`);
    console.log(`   - hasActiveSubscription: ${hasActive}`);
    console.log(
      `   - subscriptionPlan: ${hasActive ? subscription.plan?.planName : null}`
    );

    res.json({
      success: true,
      message: "Metadata synced successfully",
      metadata: {
        hasActiveSubscription: hasActive,
        subscriptionPlan: hasActive ? subscription.plan?.planName : null,
        subscriptionExpiry: hasActive ? subscription.expiryDate : null,
        subscriptionTier: hasActive ? subscription.plan?.tierRank : null,
      },
    });
  } catch (error) {
    console.error("❌ Sync error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to sync metadata",
      error: error.message,
    });
  }
};

export default {
  getAllPlans,
  recalculateRanks, // ✅ NEW
  createSubscription,
  getCurrentSubscription,
  getSubscriptionHistory,
  cancelSubscription,
  syncClerkMetadata,
};
