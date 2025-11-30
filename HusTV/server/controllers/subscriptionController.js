// controllers/subscriptionController.js
import SubscriptionPlan from "../models/SubscriptionPlan.js";
import Subscription from "../models/Subscription.js";
import User from "../models/User.js";
import {
  createCheckoutSession,
  calculateUpgradePrice,
} from "../utils/index.js";
import { clerkClient } from "@clerk/express";
import { inngest } from "../inngest/index.js";

// API to get all subscription plans
export const getAllPlans = async (req, res) => {
  try {
    const plans = await SubscriptionPlan.find({ isActive: true }).sort({
      tierRank: 1,
    });

    res.json({ success: true, plans });
  } catch (error) {
    console.error("Error fetching plans:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// API to get single plan by ID
export const getPlanById = async (req, res) => {
  try {
    const { planId } = req.params;

    const plan = await SubscriptionPlan.findById(planId);

    if (!plan) {
      return res
        .status(404)
        .json({ success: false, message: "Plan not found" });
    }

    res.json({ success: true, plan });
  } catch (error) {
    console.error("Error fetching plan:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// API to create subscription (Stripe checkout)
export const createSubscription = async (req, res) => {
  try {
    const { userId } = req.auth;
    const { planId } = req.body;

    // Get user and plan
    const user = await User.findByClerkId(userId);
    const plan = await SubscriptionPlan.findById(planId);

    if (!plan) {
      return res
        .status(404)
        .json({ success: false, message: "Plan not found" });
    }

    if (!plan.isActive) {
      return res
        .status(400)
        .json({ success: false, message: "Plan is not active" });
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

    // Calculate expiry date based on plan duration
    const purchaseDate = new Date();
    const expiryDate = new Date(purchaseDate);

    if (plan.duration === "Yearly") {
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    } else {
      expiryDate.setMonth(expiryDate.getMonth() + 1);
    }

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
      isPaid: false,
    });

    // Create Stripe checkout session using utility
    const checkoutSession = await createCheckoutSession({
      subscriptionId: subscription._id.toString(),
      planName: plan.planName,
      price: plan.price,
      userEmail,
      userName,
      userId,
      isUpgrade: false,
      oldSubscriptionId: null,
    });

    // Save payment link
    subscription.paymentLink = checkoutSession.url;
    await subscription.save();

    res.json({
      success: true,
      message: "Checkout session created",
      url: checkoutSession.url,
      subscriptionId: subscription._id,
    });
  } catch (error) {
    console.error("Error creating subscription:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// API to get user's subscriptions
export const getUserSubscriptions = async (req, res) => {
  try {
    const { userId } = req.auth;

    const subscriptions = await Subscription.find({ user: userId })
      .populate("plan")
      .sort({ createdAt: -1 });

    res.json({ success: true, subscriptions });
  } catch (error) {
    console.error("Error fetching user subscriptions:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// API to get current active subscription
export const getCurrentSubscription = async (req, res) => {
  try {
    const { userId } = req.auth;

    const user = await User.findByClerkId(userId).populate({
      path: "currentSubscription",
      populate: { path: "plan" },
    });

    if (!user.currentSubscription) {
      return res.json({
        success: true,
        subscription: null,
        message: "No active subscription",
      });
    }

    res.json({
      success: true,
      subscription: user.currentSubscription,
    });
  } catch (error) {
    console.error("Error fetching current subscription:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// API to cancel subscription
export const cancelSubscription = async (req, res) => {
  try {
    const { userId } = req.auth;
    const { id } = req.params;

    const subscription = await Subscription.findById(id);

    if (!subscription) {
      return res
        .status(404)
        .json({ success: false, message: "Subscription not found" });
    }

    if (subscription.user !== userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to cancel this subscription",
      });
    }

    if (subscription.status !== "Active") {
      return res.status(400).json({
        success: false,
        message: "Subscription is not active",
      });
    }

    // Update subscription status
    subscription.status = "Cancelled";
    await subscription.save();

    // Update user subscription status
    const user = await User.findByClerkId(userId);
    if (user.currentSubscription?.toString() === id) {
      user.subscriptionStatus = "cancelled";
      user.currentSubscription = null;
      user.subscriptionTier = null;
      await user.save();
    }

    res.json({
      success: true,
      message: "Subscription cancelled successfully",
    });
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// API to check subscription status
export const checkSubscriptionStatus = async (req, res) => {
  try {
    const { userId } = req.auth;

    const user = await User.findByClerkId(userId);

    res.json({
      success: true,
      hasActiveSubscription: user.subscriptionStatus === "active",
      status: user.subscriptionStatus,
      tier: user.subscriptionTier,
    });
  } catch (error) {
    console.error("Error checking subscription status:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// API to upgrade subscription
export const upgradeSubscription = async (req, res) => {
  try {
    const { userId } = req.auth;
    const { newPlanId } = req.body;

    // Get user's current subscription
    const user = await User.findByClerkId(userId).populate({
      path: "currentSubscription",
      populate: { path: "plan" },
    });

    if (!user.currentSubscription || user.subscriptionStatus !== "active") {
      return res.status(400).json({
        success: false,
        message: "No active subscription to upgrade",
      });
    }

    const currentSubscription = user.currentSubscription;
    const currentPlan = currentSubscription.plan;

    // Get new plan
    const newPlan = await SubscriptionPlan.findById(newPlanId);

    if (!newPlan) {
      return res
        .status(404)
        .json({ success: false, message: "Plan not found" });
    }

    if (!newPlan.isActive) {
      return res
        .status(400)
        .json({ success: false, message: "Plan is not active" });
    }

    // Check if new plan rank is higher
    if (newPlan.tierRank <= currentPlan.tierRank) {
      return res.status(400).json({
        success: false,
        message: "Can only upgrade to higher tier plans",
      });
    }

    // Calculate upgrade price using utility function
    const upgradePrice = calculateUpgradePrice(
      currentPlan.price,
      newPlan.price
    );

    if (upgradePrice === 0) {
      return res.status(400).json({
        success: false,
        message: "No upgrade cost required",
      });
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

    // Keep the same expiry date from current subscription
    const expiryDate = currentSubscription.expiryDate;

    // Create new subscription document for upgrade
    const newSubscription = await Subscription.create({
      user: userId,
      userName,
      userEmail,
      plan: newPlanId,
      purchaseDate: new Date(),
      expiryDate,
      amount: upgradePrice, // Only charge the difference
      status: "Active",
      isPaid: false,
    });

    // Create Stripe checkout session using utility
    const checkoutSession = await createCheckoutSession({
      subscriptionId: newSubscription._id.toString(),
      planName: newPlan.planName,
      price: upgradePrice,
      userEmail,
      userName,
      userId,
      isUpgrade: true,
      oldSubscriptionId: currentSubscription._id.toString(),
    });

    // Save payment link
    newSubscription.paymentLink = checkoutSession.url;
    await newSubscription.save();

    res.json({
      success: true,
      message: "Upgrade checkout session created",
      url: checkoutSession.url,
      upgradeInfo: {
        currentPlan: currentPlan.planName,
        newPlan: newPlan.planName,
        currentPrice: currentPlan.price,
        newPrice: newPlan.price,
        upgradePrice,
        expiryDate,
      },
    });
  } catch (error) {
    console.error("Error upgrading subscription:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// API to get upgrade options (available higher tier plans)
export const getUpgradeOptions = async (req, res) => {
  try {
    const { userId } = req.auth;

    // Get user's current subscription
    const user = await User.findByClerkId(userId).populate({
      path: "currentSubscription",
      populate: { path: "plan" },
    });

    if (!user.currentSubscription || user.subscriptionStatus !== "active") {
      return res.json({
        success: false,
        message: "No active subscription",
        upgradeOptions: [],
      });
    }

    const currentPlan = user.currentSubscription.plan;

    // Find higher tier plans
    const upgradeOptions = await SubscriptionPlan.find({
      isActive: true,
      tierRank: { $gt: currentPlan.tierRank },
    }).sort({ tierRank: 1 });

    // Calculate upgrade price for each option using utility function
    const optionsWithPrice = upgradeOptions.map((plan) => ({
      ...plan.toObject(),
      upgradePrice: calculateUpgradePrice(currentPlan.price, plan.price),
      currentPlan: {
        _id: currentPlan._id,
        planName: currentPlan.planName,
        price: currentPlan.price,
        tierRank: currentPlan.tierRank,
      },
    }));

    res.json({
      success: true,
      currentPlan: {
        _id: currentPlan._id,
        planName: currentPlan.planName,
        price: currentPlan.price,
        tierRank: currentPlan.tierRank,
      },
      upgradeOptions: optionsWithPrice,
    });
  } catch (error) {
    console.error("Error fetching upgrade options:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// API to check if user can upgrade
export const canUpgrade = async (req, res) => {
  try {
    const { userId } = req.auth;

    const user = await User.findByClerkId(userId).populate({
      path: "currentSubscription",
      populate: { path: "plan" },
    });

    if (!user.currentSubscription || user.subscriptionStatus !== "active") {
      return res.json({
        success: true,
        canUpgrade: false,
        message: "No active subscription",
      });
    }

    const currentPlan = user.currentSubscription.plan;

    // Check if there are higher tier plans available
    const higherPlans = await SubscriptionPlan.countDocuments({
      isActive: true,
      tierRank: { $gt: currentPlan.tierRank },
    });

    res.json({
      success: true,
      canUpgrade: higherPlans > 0,
      currentTier: currentPlan.tierRank,
      currentPlanName: currentPlan.planName,
    });
  } catch (error) {
    console.error("Error checking upgrade eligibility:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// API to create/update plan (admin only)
export const createOrUpdatePlan = async (req, res) => {
  try {
    const { planId } = req.params;
    const planData = req.body;

    if (planId && planId !== "new") {
      // Update existing plan
      const plan = await SubscriptionPlan.findByIdAndUpdate(planId, planData, {
        new: true,
        runValidators: true,
      });

      if (!plan) {
        return res
          .status(404)
          .json({ success: false, message: "Plan not found" });
      }

      res.json({
        success: true,
        message: "Plan updated successfully",
        plan,
      });
    } else {
      // Create new plan
      const plan = await SubscriptionPlan.create(planData);

      res.json({
        success: true,
        message: "Plan created successfully",
        plan,
      });
    }
  } catch (error) {
    console.error("Error creating/updating plan:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// API to delete plan (admin only)
export const deletePlan = async (req, res) => {
  try {
    const { planId } = req.params;

    // Check if any active subscriptions exist for this plan
    const activeSubscriptions = await Subscription.countDocuments({
      plan: planId,
      status: "Active",
    });

    if (activeSubscriptions > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete plan with ${activeSubscriptions} active subscriptions`,
      });
    }

    const plan = await SubscriptionPlan.findByIdAndDelete(planId);

    if (!plan) {
      return res
        .status(404)
        .json({ success: false, message: "Plan not found" });
    }

    res.json({
      success: true,
      message: "Plan deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting plan:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// API to toggle plan active status (admin only)
export const togglePlanStatus = async (req, res) => {
  try {
    const { planId } = req.params;

    const plan = await SubscriptionPlan.findById(planId);

    if (!plan) {
      return res
        .status(404)
        .json({ success: false, message: "Plan not found" });
    }

    plan.isActive = !plan.isActive;
    await plan.save();

    res.json({
      success: true,
      message: `Plan ${plan.isActive ? "activated" : "deactivated"}`,
      isActive: plan.isActive,
    });
  } catch (error) {
    console.error("Error toggling plan status:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
