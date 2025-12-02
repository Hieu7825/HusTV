// server/controllers/stripeWebhooks.js (FIXED FOR STREAMING PLATFORM)
import Stripe from "stripe";
import { constructWebhookEvent } from "../utils/stripe.js";
import Subscription from "../models/Subscription.js";
import Booking from "../models/Booking.js";
import SubscriptionPlan from "../models/SubscriptionPlan.js";
import User from "../models/User.js";
import { inngest } from "../inngest/index.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Stripe Webhook Handler
 * POST /api/webhooks/stripe
 */
export const stripeWebhookHandler = async (request, response) => {
  const sig = request.headers["stripe-signature"];

  let event;

  try {
    // Verify webhook signature using utility function
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

        // Get checkout session from payment intent
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
          subscription.paymentLink = ""; // Clear payment link
          subscription.paymentMethod =
            paymentIntent.payment_method_types[0] || "card";
          subscription.transactionId = paymentIntent.id;
          await subscription.save();

          console.log("✅ Subscription marked as paid:", subscriptionId);

          // If this is an upgrade, cancel old subscription
          if (isUpgrade === "true" && oldSubscriptionId) {
            try {
              const oldSubscription = await Subscription.findByIdAndUpdate(
                oldSubscriptionId,
                { status: "Cancelled" },
                { new: true }
              );

              if (oldSubscription) {
                console.log(
                  `✅ Old subscription cancelled: ${oldSubscriptionId}`
                );
              }
            } catch (upgradeError) {
              console.error(
                "⚠️ Failed to cancel old subscription:",
                upgradeError
              );
            }
          }

          // Update user subscription status
          try {
            const user = await User.findByClerkId(userId);

            if (user) {
              user.subscriptionStatus = "active";
              user.currentSubscription = subscriptionId;

              // Get plan for tier name
              const plan = await SubscriptionPlan.findById(planId);
              if (plan) {
                user.subscriptionTier = plan.planName;
              }

              await user.save();
              console.log("✅ User subscription status updated:", userId);
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
        // NOTE: Booking model exists but used differently in streaming platform
        if (bookingId) {
          console.log(`🎬 Processing booking payment: ${bookingId}`);

          const booking = await Booking.findById(bookingId);

          if (!booking) {
            console.log("⚠️ Booking not found:", bookingId);
            break;
          }

          // Update booking: Mark as paid
          booking.isPaid = true;
          booking.paymentLink = ""; // Clear payment link
          booking.transactionId = paymentIntent.id;
          booking.paymentMethod =
            paymentIntent.payment_method_types[0] || "card";
          await booking.save();

          console.log("✅ Booking marked as paid:", bookingId);

          // Send confirmation email via Inngest
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

        // Get checkout session
        const sessionList = await stripe.checkout.sessions.list({
          payment_intent: paymentIntent.id,
          limit: 1,
        });

        if (sessionList.data.length > 0) {
          const session = sessionList.data[0];
          const { subscriptionId, bookingId } = session.metadata;

          // Handle subscription payment failure
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
            } catch (error) {
              console.error("❌ Failed to cancel subscription:", error);
            }
          }

          // Handle booking payment failure
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
        const { subscriptionId, bookingId } = session.metadata;

        // Handle subscription expiration
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
          } catch (error) {
            console.error("❌ Failed to cancel expired subscription:", error);
          }
        }

        // Handle booking expiration
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

        // This is mainly handled by payment_intent.succeeded
        // But we can log it for monitoring
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

    // Send success response
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
