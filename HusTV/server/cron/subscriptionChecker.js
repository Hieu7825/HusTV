// ============================================
// FILE: server/cron/subscriptionChecker.js (NEW)
// ============================================
import cron from "node-cron";
import Subscription from "../models/Subscription.js";
import User from "../models/User.js";
import { clerkClient } from "@clerk/express";

/**
 * 🕐 CRON JOB: Check expired subscriptions
 * Runs every day at 2 AM
 * Cron syntax: "0 2 * * *"
 * - 0: minute 0
 * - 2: hour 2 AM
 * - *: every day
 * - *: every month
 * - *: every day of week
 */
export const startSubscriptionChecker = () => {
  // Run every day at 2 AM
  cron.schedule("0 2 * * *", async () => {
    console.log("⏰ [CRON] Starting subscription expiry check...");

    try {
      // Find all active subscriptions that are expired
      const expiredSubscriptions = await Subscription.find({
        status: "Active",
        isPaid: true,
        expiryDate: { $lte: new Date() }, // Expired
      }).populate("plan");

      console.log(
        `📊 Found ${expiredSubscriptions.length} expired subscriptions`
      );

      let successCount = 0;
      let errorCount = 0;

      for (const subscription of expiredSubscriptions) {
        try {
          // Update subscription status
          subscription.status = "Expired";
          await subscription.save(); // This will trigger auto-sync middleware

          // Update user
          const user = await User.findByClerkId(subscription.user);
          if (user) {
            user.subscriptionStatus = "expired";
            user.currentSubscription = null;
            user.subscriptionTier = null;
            await user.save();
          }

          // Clear Clerk metadata (backup in case middleware fails)
          try {
            await clerkClient.users.updateUserMetadata(subscription.user, {
              publicMetadata: {
                hasActiveSubscription: false,
                subscriptionPlan: null,
                subscriptionExpiry: null,
                subscriptionTier: null,
              },
            });
          } catch (clerkError) {
            console.error(
              `⚠️ Failed to clear Clerk for user ${subscription.user}:`,
              clerkError.message
            );
          }

          successCount++;
          console.log(
            `✅ Expired: ${subscription.user} - ${subscription.plan.planName}`
          );
        } catch (error) {
          errorCount++;
          console.error(
            `❌ Failed to expire subscription ${subscription._id}:`,
            error.message
          );
        }
      }

      console.log(
        `✅ [CRON] Completed: ${successCount} expired, ${errorCount} errors`
      );
    } catch (error) {
      console.error("❌ [CRON] Fatal error:", error);
    }
  });

  console.log("✅ Subscription checker cron job started (runs daily at 2 AM)");
};

/**
 * 🕐 ALTERNATIVE: Run every hour (for testing)
 * Uncomment this if you want hourly checks
 */
export const startHourlyChecker = () => {
  cron.schedule("0 * * * *", async () => {
    console.log("⏰ [HOURLY] Checking subscriptions...");
    // Same logic as above
  });
};

/**
 * 🕐 Manual trigger for testing
 */
export const checkExpiredSubscriptionsNow = async () => {
  console.log("🔍 [MANUAL] Checking expired subscriptions...");

  try {
    const expiredSubscriptions = await Subscription.find({
      status: "Active",
      isPaid: true,
      expiryDate: { $lte: new Date() },
    }).populate("plan");

    console.log(`📊 Found ${expiredSubscriptions.length} expired`);

    for (const sub of expiredSubscriptions) {
      sub.status = "Expired";
      await sub.save();
      console.log(`✅ Expired: ${sub._id}`);
    }

    return {
      success: true,
      expired: expiredSubscriptions.length,
    };
  } catch (error) {
    console.error("❌ Manual check failed:", error);
    throw error;
  }
};

export default { startSubscriptionChecker, checkExpiredSubscriptionsNow };
