// inngest/functions/emailAutomation.js
import { inngest } from "../client.js";
import Subscription from "../../models/Subscription.js";
import SubscriptionPlan from "../../models/SubscriptionPlan.js";
import User from "../../models/User.js";
import {
  sendSubscriptionConfirmation,
  sendUpgradeConfirmation,
  sendPaymentReceipt,
} from "../../utils/index.js";

/**
 * Send subscription confirmation email
 */
export const sendSubscriptionConfirmedEmail = inngest.createFunction(
  { id: "send-subscription-confirmed-email" },
  { event: "subscription/confirmed" },
  async ({ event, step }) => {
    const { subscriptionId, userId, planId } = event.data;

    await step.run("send-confirmation-email", async () => {
      try {
        // Get subscription details
        const subscription = await Subscription.findById(
          subscriptionId
        ).populate("plan");

        if (!subscription) {
          console.log("⚠️ Subscription not found:", subscriptionId);
          return { success: false, message: "Subscription not found" };
        }

        // Send confirmation email
        await sendSubscriptionConfirmation({
          userEmail: subscription.userEmail,
          userName: subscription.userName,
          planName: subscription.plan.planName,
          price: subscription.plan.price,
          expiryDate: subscription.expiryDate,
          features: subscription.plan.features,
        });

        console.log(
          "✅ Subscription confirmation email sent to:",
          subscription.userEmail
        );
        return { success: true };
      } catch (error) {
        console.error("❌ Error sending confirmation email:", error);
        throw error;
      }
    });

    // Optional: Send payment receipt
    await step.run("send-payment-receipt", async () => {
      try {
        const subscription = await Subscription.findById(
          subscriptionId
        ).populate("plan");

        await sendPaymentReceipt({
          userEmail: subscription.userEmail,
          userName: subscription.userName,
          planName: subscription.plan.planName,
          amount: subscription.amount,
          transactionId: subscription.transactionId,
          paymentDate: subscription.purchaseDate,
        });

        console.log("✅ Payment receipt sent to:", subscription.userEmail);
        return { success: true };
      } catch (error) {
        console.error("⚠️ Error sending payment receipt:", error);
        // Don't throw - receipt is optional
        return { success: false, error: error.message };
      }
    });
  }
);

/**
 * Send subscription upgrade confirmation email
 */
export const sendSubscriptionUpgradedEmail = inngest.createFunction(
  { id: "send-subscription-upgraded-email" },
  { event: "subscription/upgraded" },
  async ({ event, step }) => {
    const { subscriptionId, userId, planId, oldSubscriptionId } = event.data;

    await step.run("send-upgrade-email", async () => {
      try {
        // Get new subscription
        const newSubscription = await Subscription.findById(
          subscriptionId
        ).populate("plan");

        if (!newSubscription) {
          console.log("⚠️ New subscription not found:", subscriptionId);
          return { success: false, message: "Subscription not found" };
        }

        // Get old subscription for comparison
        let oldPlanName = "Previous Plan";
        if (oldSubscriptionId) {
          const oldSubscription = await Subscription.findById(
            oldSubscriptionId
          ).populate("plan");
          if (oldSubscription) {
            oldPlanName = oldSubscription.plan.planName;
          }
        }

        // Send upgrade email
        await sendUpgradeConfirmation({
          userEmail: newSubscription.userEmail,
          userName: newSubscription.userName,
          oldPlanName,
          newPlanName: newSubscription.plan.planName,
          upgradePrice: newSubscription.amount,
          expiryDate: newSubscription.expiryDate,
          newFeatures: newSubscription.plan.features,
        });

        console.log(
          "✅ Upgrade confirmation email sent to:",
          newSubscription.userEmail
        );
        return { success: true };
      } catch (error) {
        console.error("❌ Error sending upgrade email:", error);
        throw error;
      }
    });

    // Optional: Send payment receipt for upgrade
    await step.run("send-upgrade-receipt", async () => {
      try {
        const subscription = await Subscription.findById(
          subscriptionId
        ).populate("plan");

        await sendPaymentReceipt({
          userEmail: subscription.userEmail,
          userName: subscription.userName,
          planName: `Upgrade to ${subscription.plan.planName}`,
          amount: subscription.amount,
          transactionId: subscription.transactionId,
          paymentDate: subscription.purchaseDate,
        });

        console.log("✅ Upgrade receipt sent to:", subscription.userEmail);
        return { success: true };
      } catch (error) {
        console.error("⚠️ Error sending upgrade receipt:", error);
        return { success: false, error: error.message };
      }
    });
  }
);

/**
 * Send welcome email to new users
 */
export const sendWelcomeEmail = inngest.createFunction(
  { id: "send-welcome-email" },
  { event: "user/welcome" },
  async ({ event, step }) => {
    const { userId, userEmail, userName } = event.data;

    await step.run("send-welcome-email", async () => {
      try {
        const { sendEmail } = await import("../../utils/index.js");

        await sendEmail({
          to: userEmail,
          subject: "Welcome to HusTV! 🎬",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; text-align: center;">
                <h1>Welcome to HusTV!</h1>
              </div>
              <div style="padding: 30px; background: #f9f9f9;">
                <p style="font-size: 16px;">Hi ${userName},</p>
                <p>Thank you for joining HusTV! We're excited to have you on board.</p>
                
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3>🎬 What's Next?</h3>
                  <ul style="line-height: 1.8;">
                    <li>Browse our collection of movies and shows</li>
                    <li>Choose a subscription plan to start watching</li>
                    <li>Create your favorites list</li>
                    <li>Track your watch history</li>
                  </ul>
                </div>

                <a href="${process.env.WEBSITE_URL}/subscriptions" 
                   style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0;">
                  View Subscription Plans
                </a>

                <p style="margin-top: 30px; color: #666;">
                  Need help? Contact us at support@hustv.com
                </p>
              </div>
            </div>
          `,
          text: `Welcome to HusTV, ${userName}! Browse our collection and choose a subscription plan to start watching.`,
        });

        console.log("✅ Welcome email sent to:", userEmail);
        return { success: true };
      } catch (error) {
        console.error("❌ Error sending welcome email:", error);
        throw error;
      }
    });
  }
);

/**
 * Send notification when new content is added
 */
export const sendNewContentNotification = inngest.createFunction(
  { id: "send-new-content-notification" },
  { event: "content/new-release" },
  async ({ event, step }) => {
    const { videoId, videoTitle } = event.data;

    await step.run("notify-active-subscribers", async () => {
      try {
        // Get all active subscribers
        const activeUsers = await User.find({
          subscriptionStatus: "active",
          "preferences.notifications": true,
        }).limit(100); // Batch processing

        console.log(
          `📧 Sending new content notifications to ${activeUsers.length} users`
        );

        const { sendEmail } = await import("../../utils/index.js");

        // Send emails in batches
        for (const user of activeUsers) {
          try {
            await sendEmail({
              to: user.email,
              subject: `New on HusTV: ${videoTitle} 🎬`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
                    <h2>New Content Alert! 🎉</h2>
                  </div>
                  <div style="padding: 30px; background: #f9f9f9;">
                    <p style="font-size: 16px;">Hi ${user.name},</p>
                    <p>Great news! A new title is now available on HusTV:</p>
                    
                    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                      <h3>${videoTitle}</h3>
                      <p>Start watching now and enjoy!</p>
                    </div>

                    <a href="${process.env.WEBSITE_URL}/watch/${videoId}" 
                       style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">
                      Watch Now
                    </a>
                  </div>
                </div>
              `,
              text: `New on HusTV: ${videoTitle}. Watch now at ${process.env.WEBSITE_URL}/watch/${videoId}`,
            });
          } catch (emailError) {
            console.error(
              `⚠️ Failed to send to ${user.email}:`,
              emailError.message
            );
          }
        }

        console.log("✅ New content notifications sent");
        return { success: true, notified: activeUsers.length };
      } catch (error) {
        console.error("❌ Error sending content notifications:", error);
        throw error;
      }
    });
  }
);
