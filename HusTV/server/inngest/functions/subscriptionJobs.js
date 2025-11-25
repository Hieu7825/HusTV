// inngest/functions/subscriptionJobs.js
import { inngest } from "../index.js";
import Subscription from "../../models/Subscription.js";
import User from "../../models/User.js";
import { sendExpiryReminder } from "../../utils/index.js";

/**
 * Daily cron job to check and update expired subscriptions
 */
export const checkExpiredSubscriptions = inngest.createFunction(
  { id: "check-expired-subscriptions" },
  { cron: "0 0 * * *" }, // Run daily at midnight
  async ({ step }) => {
    await step.run("update-expired-subscriptions", async () => {
      const now = new Date();

      // Find all active subscriptions that have expired
      const expiredSubscriptions = await Subscription.find({
        status: "Active",
        expiryDate: { $lt: now },
        isPaid: true,
      });

      console.log(`Found ${expiredSubscriptions.length} expired subscriptions`);

      let updatedCount = 0;

      for (const subscription of expiredSubscriptions) {
        try {
          // Update subscription status
          subscription.status = "Expired";
          await subscription.save();

          // Update user status
          const user = await User.findById(subscription.user);
          if (
            user &&
            user.currentSubscription?.toString() === subscription._id.toString()
          ) {
            user.subscriptionStatus = "expired";
            user.currentSubscription = null;
            user.subscriptionTier = null;
            await user.save();

            console.log(`✅ Expired subscription for user: ${user.email}`);
          }

          updatedCount++;
        } catch (error) {
          console.error(
            `❌ Error expiring subscription ${subscription._id}:`,
            error
          );
        }
      }

      return {
        success: true,
        totalExpired: expiredSubscriptions.length,
        updated: updatedCount,
      };
    });
  }
);

/**
 * Daily cron job to send expiry reminders (7 days before)
 */
export const sendExpiryReminders = inngest.createFunction(
  { id: "send-expiry-reminders" },
  { cron: "0 9 * * *" }, // Run daily at 9 AM
  async ({ step }) => {
    await step.run("send-reminder-emails", async () => {
      const now = new Date();
      const sevenDaysFromNow = new Date(now);
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

      // Find subscriptions expiring in 7 days
      const expiringSubscriptions = await Subscription.find({
        status: "Active",
        isPaid: true,
        expiryDate: {
          $gte: now,
          $lte: sevenDaysFromNow,
        },
      }).populate("plan");

      console.log(
        `Found ${expiringSubscriptions.length} subscriptions expiring in 7 days`
      );

      let sentCount = 0;

      for (const subscription of expiringSubscriptions) {
        try {
          // Calculate days remaining
          const daysRemaining = Math.ceil(
            (new Date(subscription.expiryDate) - now) / (1000 * 60 * 60 * 24)
          );

          // Send reminder email
          await sendExpiryReminder({
            userEmail: subscription.userEmail,
            userName: subscription.userName,
            planName: subscription.plan.planName,
            expiryDate: subscription.expiryDate,
            daysRemaining,
          });

          console.log(`✅ Sent expiry reminder to: ${subscription.userEmail}`);
          sentCount++;
        } catch (error) {
          console.error(
            `❌ Error sending reminder for ${subscription._id}:`,
            error
          );
        }
      }

      return {
        success: true,
        totalFound: expiringSubscriptions.length,
        emailsSent: sentCount,
      };
    });
  }
);

/**
 * Weekly cron job to clean up cancelled subscriptions older than 6 months
 */
export const cleanupOldSubscriptions = inngest.createFunction(
  { id: "cleanup-old-subscriptions" },
  { cron: "0 2 * * 0" }, // Run every Sunday at 2 AM
  async ({ step }) => {
    await step.run("delete-old-cancelled-subscriptions", async () => {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      // Delete cancelled subscriptions older than 6 months
      const result = await Subscription.deleteMany({
        status: { $in: ["Cancelled", "Expired"] },
        updatedAt: { $lt: sixMonthsAgo },
      });

      console.log(`🗑️ Deleted ${result.deletedCount} old subscriptions`);

      return {
        success: true,
        deletedCount: result.deletedCount,
      };
    });
  }
);

/**
 * Check subscription status on demand
 */
export const checkSubscriptionStatus = inngest.createFunction(
  { id: "check-subscription-status" },
  { event: "subscription/check-status" },
  async ({ event, step }) => {
    const { userId } = event.data;

    await step.run("verify-subscription-status", async () => {
      const user = await User.findById(userId).populate({
        path: "currentSubscription",
        populate: { path: "plan" },
      });

      if (!user) {
        console.log("⚠️ User not found:", userId);
        return { success: false, message: "User not found" };
      }

      // Check if current subscription is expired
      if (user.currentSubscription) {
        const now = new Date();
        if (new Date(user.currentSubscription.expiryDate) < now) {
          // Expire the subscription
          user.currentSubscription.status = "Expired";
          await user.currentSubscription.save();

          user.subscriptionStatus = "expired";
          user.currentSubscription = null;
          user.subscriptionTier = null;
          await user.save();

          console.log(`✅ Expired subscription for user: ${user.email}`);
          return { success: true, status: "expired" };
        }
      }

      return { success: true, status: user.subscriptionStatus };
    });
  }
);
