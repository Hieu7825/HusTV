// middleware/validateSubscription.js
import User from "../models/User.js";
import SubscriptionPlan from "../models/SubscriptionPlan.js";

/**
 * Middleware to check if user has active subscription
 * Used for protected video routes
 */
export const requireActiveSubscription = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get user with current subscription
    const user = await User.findById(userId).populate("currentSubscription");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if user has active subscription
    if (user.subscriptionStatus !== "active") {
      return res.status(403).json({
        success: false,
        message: "Active subscription required",
        subscriptionStatus: user.subscriptionStatus,
        requiresUpgrade: true,
      });
    }

    // Check if subscription is expired
    const currentSub = user.currentSubscription;
    if (currentSub && new Date(currentSub.expiryDate) < new Date()) {
      return res.status(403).json({
        success: false,
        message: "Subscription expired",
        expiryDate: currentSub.expiryDate,
        requiresRenewal: true,
      });
    }

    // Attach subscription info to request
    req.subscription = currentSub;

    next();
  } catch (error) {
    console.error("Subscription validation error:", error);
    return res.status(500).json({
      success: false,
      message: "Error validating subscription",
      error: error.message,
    });
  }
};

/**
 * Middleware to check if user can watch video
 * Checks both subscription and device limit
 */
export const canWatchVideo = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const deviceId = req.headers["x-device-id"];

    if (!deviceId) {
      return res.status(400).json({
        success: false,
        message: "Device ID required in headers (x-device-id)",
      });
    }

    const user = await User.findById(userId).populate("currentSubscription");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check subscription status
    const canWatch = await user.canWatch();

    if (!canWatch) {
      return res.status(403).json({
        success: false,
        message: "Cannot watch video - subscription required or expired",
        subscriptionStatus: user.subscriptionStatus,
      });
    }

    // Check device limit
    const device = user.connectedDevices.find((d) => d.deviceId === deviceId);

    if (!device) {
      // Try to add new device
      const canAdd = await user.canAddDevice();

      if (!canAdd) {
        return res.status(403).json({
          success: false,
          message: "Device limit reached",
          connectedDevices: user.connectedDevices.length,
          maxDevices: user.currentSubscription?.plan?.connectedDevices || 1,
        });
      }
    }

    next();
  } catch (error) {
    console.error("Watch validation error:", error);
    return res.status(500).json({
      success: false,
      message: "Error validating watch permission",
      error: error.message,
    });
  }
};

/**
 * Middleware to validate subscription tier for upgrade
 */
export const validateUpgrade = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { newPlanId } = req.body;

    if (!newPlanId) {
      return res.status(400).json({
        success: false,
        message: "New plan ID is required",
      });
    }

    const user = await User.findById(userId).populate({
      path: "currentSubscription",
      populate: { path: "plan" },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if user has active subscription
    if (user.subscriptionStatus !== "active") {
      return res.status(403).json({
        success: false,
        message: "No active subscription to upgrade",
      });
    }

    // Get new plan
    const newPlan = await SubscriptionPlan.findById(newPlanId);

    if (!newPlan || !newPlan.isActive) {
      return res.status(404).json({
        success: false,
        message: "Plan not found or inactive",
      });
    }

    const currentPlan = user.currentSubscription.plan;

    // Validate tierRank
    if (newPlan.tierRank <= currentPlan.tierRank) {
      return res.status(400).json({
        success: false,
        message: "Can only upgrade to higher tier plans",
        currentTier: currentPlan.tierRank,
        newTier: newPlan.tierRank,
      });
    }

    // Attach plans to request
    req.currentPlan = currentPlan;
    req.newPlan = newPlan;
    req.currentSubscription = user.currentSubscription;

    next();
  } catch (error) {
    console.error("Upgrade validation error:", error);
    return res.status(500).json({
      success: false,
      message: "Error validating upgrade",
      error: error.message,
    });
  }
};
