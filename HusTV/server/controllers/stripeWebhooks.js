// ============================================
// FILE: server/controllers/stripeWebhooks.js
// Complete code with auto-sync Clerk metadata
// ============================================
import Stripe from "stripe";
import { constructWebhookEvent } from "../utils/stripe.js";
import Subscription from "../models/Subscription.js";
import Booking from "../models/Booking.js";
import SubscriptionPlan from "../models/SubscriptionPlan.js";
import User from "../models/User.js";
import { inngest } from "../inngest/index.js";
import { clerkClient } from "@clerk/express";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * 🔥 HELPER: Sync Clerk Metadata
 */
const syncClerkMetadata = async (userId) => {
  try {
    console.log(`🔄 [AUTO-SYNC] Syncing Clerk metadata for: ${userId}`);

    const user = await User.findOne({ clerkId: userId }).populate({
      path: "currentSubscription",
      populate: { path: "plan" },
    });

    if (!user) {
      console.error("❌ [AUTO-SYNC] User not found:", userId);
      return;
    }

    const subscription = user.currentSubscription;

    const hasActive =
      subscription &&
      subscription.isPaid &&
      subscription.status === "Active" &&
      new Date(subscription.expiryDate) > new Date();

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

    console.log(`✅ [AUTO-SYNC] Clerk metadata synced for: ${userId}`);
    if (hasActive) {
      console.log(`   └─ Plan: ${subscription.plan?.planName}`);
      console.log(`   └─ Tier: ${subscription.plan?.tierRank}`);
      console.log(`   └─ Expires: ${subscription.expiryDate.toISOString()}`);
    } else {
      console.log(`   └─ Metadata cleared (no active subscription)`);
    }
  } catch (error) {
    console.error("❌ [AUTO-SYNC] Failed:", error.message);
  }
};

/**
 * Stripe Webhook Handler
 * POST /api/webhooks/stripe
 */
export const stripeWebhookHandler = async (request, response) => {
  const sig = request.headers["stripe-signature"];

  let event;

  try {
    event = constructWebhookEvent(request.body, sig);
  } catch (error) {
    console.error("❌ Webhook signature verification failed:", error.message);
    return response.status(400).send(`Webhook Error: ${error.message}`);
  }

  console.log(`📩 Webhook received: ${event.type}`);

  try {
    switch (event.type) {
      // ============================================
      // CASE 1: Payment Intent Succeeded
      // ============================================
      case "payment_intent.succeeded": {
        console.log("💰 Payment intent succeeded");
        const paymentIntent = event.data.object;

        const sessionList = await stripe.checkout.sessions.list({
          payment_intent: paymentIntent.id,
          limit: 1,
        });

        if (sessionList.data.length === 0) {
          console.log("⚠️ No session found for payment intent");
          break;
        }

        const session = sessionList.data[0];
        const {
          subscriptionId,
          bookingId,
          userId,
          planId,
          isUpgrade,
          oldSubscriptionId,
        } = session.metadata;

        // ============ Handle SUBSCRIPTION Payment ============
        if (subscriptionId) {
          console.log(`💳 Processing subscription payment: ${subscriptionId}`);

          const subscription = await Subscription.findById(
            subscriptionId
          ).populate("plan");

          if (!subscription) {
            console.log("⚠️ Subscription not found:", subscriptionId);
            break;
          }

          // Update subscription: Mark as paid
          subscription.isPaid = true;
          subscription.status = "Active";
          subscription.paymentLink = "";
          subscription.paymentMethod =
            paymentIntent.payment_method_types[0] || "card";
          subscription.transactionId = paymentIntent.id;
          await subscription.save();

          console.log("✅ Subscription marked as paid:", subscriptionId);

          // If this is an upgrade, cancel old subscription
          if (isUpgrade === "true" && oldSubscriptionId) {
            try {
              await Subscription.findByIdAndUpdate(oldSubscriptionId, {
                status: "Cancelled",
              });
              console.log(
                `✅ Old subscription cancelled: ${oldSubscriptionId}`
              );
            } catch (upgradeError) {
              console.error(
                "⚠️ Failed to cancel old subscription:",
                upgradeError
              );
            }
          }

          // Update user subscription status
          try {
            const user = await User.findOne({ clerkId: userId });

            if (user) {
              user.subscriptionStatus = "active";
              user.currentSubscription = subscriptionId;

              const plan = await SubscriptionPlan.findById(planId);
              if (plan) {
                user.subscriptionTier = plan.planName;
              }

              await user.save();
              console.log("✅ User subscription status updated:", userId);

              // ============================================
              // 🔥 AUTO-SYNC: Sync Clerk metadata
              // ============================================
              await syncClerkMetadata(userId);
            } else {
              console.log("⚠️ User not found for subscription update:", userId);
            }
          } catch (userError) {
            console.error("⚠️ Failed to update user:", userError);
          }

          // Send confirmation email via Inngest
          try {
            await inngest.send({
              name:
                isUpgrade === "true"
                  ? "subscription/upgraded"
                  : "subscription/confirmed",
              data: {
                subscriptionId,
                userId,
                planId,
                isUpgrade: isUpgrade === "true",
                ...(oldSubscriptionId && { oldSubscriptionId }),
              },
            });
            console.log("✅ Subscription email event sent to Inngest");
          } catch (inngestError) {
            console.error(
              "⚠️ Failed to send Inngest event:",
              inngestError.message
            );
          }
        }

        // ============ Handle BOOKING Payment ============
        if (bookingId) {
          console.log(`🎬 Processing booking payment: ${bookingId}`);

          const booking = await Booking.findById(bookingId);

          if (!booking) {
            console.log("⚠️ Booking not found:", bookingId);
            break;
          }

          booking.isPaid = true;
          booking.paymentLink = "";
          booking.transactionId = paymentIntent.id;
          booking.paymentMethod =
            paymentIntent.payment_method_types[0] || "card";
          await booking.save();

          console.log("✅ Booking marked as paid:", bookingId);

          try {
            await inngest.send({
              name: "booking/confirmed",
              data: {
                bookingId,
                userId: booking.user,
              },
            });
            console.log("✅ Booking email event sent to Inngest");
          } catch (inngestError) {
            console.error(
              "⚠️ Failed to send Inngest event:",
              inngestError.message
            );
          }
        }

        break;
      }

      // ============================================
      // CASE 2: Payment Intent Failed
      // ============================================
      case "payment_intent.payment_failed": {
        console.log("❌ Payment intent failed");
        const paymentIntent = event.data.object;

        const sessionList = await stripe.checkout.sessions.list({
          payment_intent: paymentIntent.id,
          limit: 1,
        });

        if (sessionList.data.length > 0) {
          const session = sessionList.data[0];
          const { subscriptionId, bookingId, userId } = session.metadata;

          if (subscriptionId) {
            try {
              await Subscription.findByIdAndUpdate(subscriptionId, {
                status: "Cancelled",
                paymentLink: "",
              });

              console.log(
                "⚠️ Subscription cancelled due to payment failure:",
                subscriptionId
              );

              // ============================================
              // 🔥 AUTO-SYNC: Clear metadata on failure
              // ============================================
              if (userId) {
                await syncClerkMetadata(userId);
              }
            } catch (error) {
              console.error("❌ Failed to cancel subscription:", error);
            }
          }

          if (bookingId) {
            try {
              await Booking.findByIdAndUpdate(bookingId, {
                isPaid: false,
                paymentLink: "",
              });

              console.log(
                "⚠️ Booking marked as unpaid due to payment failure:",
                bookingId
              );
            } catch (error) {
              console.error("❌ Failed to handle booking failure:", error);
            }
          }
        }
        break;
      }

      // ============================================
      // CASE 3: Checkout Session Expired
      // ============================================
      case "checkout.session.expired": {
        console.log("⏰ Checkout session expired");
        const session = event.data.object;
        const { subscriptionId, bookingId, userId } = session.metadata;

        if (subscriptionId) {
          try {
            await Subscription.findByIdAndUpdate(subscriptionId, {
              status: "Cancelled",
              paymentLink: "",
            });

            console.log(
              "⚠️ Subscription cancelled due to expired checkout:",
              subscriptionId
            );

            // ============================================
            // 🔥 AUTO-SYNC: Clear metadata on expiry
            // ============================================
            if (userId) {
              await syncClerkMetadata(userId);
            }
          } catch (error) {
            console.error("❌ Failed to cancel expired subscription:", error);
          }
        }

        if (bookingId) {
          try {
            await Booking.findByIdAndUpdate(bookingId, {
              isPaid: false,
              paymentLink: "",
            });

            console.log("⚠️ Booking expired:", bookingId);
          } catch (error) {
            console.error("❌ Failed to handle booking expiration:", error);
          }
        }
        break;
      }

      // ============================================
      // CASE 4: Checkout Session Completed
      // ============================================
      case "checkout.session.completed": {
        console.log("✅ Checkout session completed");
        const session = event.data.object;

        console.log("Session ID:", session.id);
        console.log("Payment status:", session.payment_status);
        console.log("Customer email:", session.customer_email);
        break;
      }

      // ============================================
      // Default: Unhandled Event Type
      // ============================================
      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }

    response.json({
      received: true,
      type: event.type,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Webhook processing error:", error);
    console.error("Error stack:", error.stack);

    response.status(500).json({
      error: "Webhook processing failed",
      message: error.message,
    });
  }
};

export default { stripeWebhookHandler };
