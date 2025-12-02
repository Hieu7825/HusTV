// server/controllers/subscriptionController.js
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
      tierRank: 1,
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
 * Create subscription (initiate payment)
 * POST /api/subscriptions/create
 * Protected route
 */
export const createSubscription = async (req, res) => {
  try {
    const { userId } = req.auth;
    const { planId } = req.body;

    // Validate plan ID
    if (!planId) {
      return res.status(400).json({
        success: false,
        message: "Plan ID is required",
      });
    }

    // Get plan details
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

    // Get user from database
    let user = await User.findByClerkId(userId);

    // Check if user already has an active subscription
    if (user && user.subscriptionStatus === "active") {
      const currentSub = await Subscription.findById(
        user.currentSubscription
      ).populate("plan");

      if (currentSub && currentSub.isPaid && currentSub.isValid()) {
        const currentPlan = currentSub.plan;

        // Check if trying to buy the same plan
        if (currentPlan._id === planId) {
          return res.status(400).json({
            success: false,
            message: "You already have this subscription plan",
          });
        }

        // Check if trying to downgrade (not allowed)
        if (plan.tierRank < currentPlan.tierRank) {
          return res.status(400).json({
            success: false,
            message:
              "Downgrade is not allowed. You already have a higher tier plan.",
          });
        }

        // If upgrade, we'll handle it below
        console.log(
          `🔄 User upgrading from ${currentPlan.planName} to ${plan.planName}`
        );
      }
    }

    // Get user info from Clerk
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

    // Calculate expiry date based on plan duration
    const purchaseDate = new Date();
    const expiryDate = new Date(purchaseDate);

    if (plan.duration === "Yearly") {
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    } else {
      // Monthly
      expiryDate.setMonth(expiryDate.getMonth() + 1);
    }

    // Determine if this is an upgrade
    const isUpgrade =
      user && user.subscriptionStatus === "active" && user.currentSubscription;
    const oldSubscriptionId = isUpgrade
      ? user.currentSubscription.toString()
      : null;

    // Create subscription document
    const subscription = await Subscription.create({
      user: userId,
      userName,
      userEmail,
      plan: planId,
      purchaseDate,
      expiryDate,
      amount: plan.price,
      status: "Active",
      isPaid: false, // Will be set to true after payment
    });

    console.log(`📝 Created subscription document: ${subscription._id}`);

    // Create Stripe checkout session using utility function
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
      bookingId: null, // This is subscription, not booking
    });

    // Save payment link to subscription
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

/**
 * Get current active subscription
 * GET /api/subscriptions/current
 * Protected route
 */
export const getCurrentSubscription = async (req, res) => {
  try {
    const { userId } = req.auth;

    // Get user with current subscription
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

    // Check if user has a subscription
    if (!user.currentSubscription) {
      return res.json({
        success: true,
        subscription: null,
        message: "No active subscription found",
      });
    }

    const subscription = user.currentSubscription;

    // Verify subscription is paid and valid
    if (!subscription.isPaid || subscription.status !== "Active") {
      return res.json({
        success: true,
        subscription: null,
        message: "No active subscription found",
      });
    }

    // Check if expired
    if (subscription.isExpired()) {
      // Update status if expired
      subscription.status = "Expired";
      await subscription.save();

      user.subscriptionStatus = "expired";
      user.currentSubscription = null;
      user.subscriptionTier = null;
      await user.save();

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

/**
 * Get subscription history
 * GET /api/subscriptions/history
 * Protected route
 */
export const getSubscriptionHistory = async (req, res) => {
  try {
    const { userId } = req.auth;

    // Get all subscriptions for this user
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

/**
 * Cancel subscription (for future use)
 * POST /api/subscriptions/cancel
 * Protected route
 */
export const cancelSubscription = async (req, res) => {
  try {
    const { userId } = req.auth;

    // Get user with current subscription
    const user = await User.findByClerkId(userId);

    if (!user || !user.currentSubscription) {
      return res.status(404).json({
        success: false,
        message: "No active subscription found",
      });
    }

    // Get subscription
    const subscription = await Subscription.findById(user.currentSubscription);

    if (!subscription || !subscription.isPaid) {
      return res.status(404).json({
        success: false,
        message: "No active subscription found",
      });
    }

    // Update subscription status
    subscription.status = "Cancelled";
    await subscription.save();

    // Update user subscription status
    user.subscriptionStatus = "cancelled";
    user.currentSubscription = null;
    user.subscriptionTier = null;
    await user.save();

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

export default {
  getAllPlans,
  createSubscription,
  getCurrentSubscription,
  getSubscriptionHistory,
  cancelSubscription,
};
