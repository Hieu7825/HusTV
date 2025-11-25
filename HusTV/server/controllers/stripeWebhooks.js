// controllers/stripeWebhooks.js
import { constructWebhookEvent } from "../utils/index.js";
import Subscription from "../models/Subscription.js";
import SubscriptionPlan from "../models/SubscriptionPlan.js";
import User from "../models/User.js";
import { inngest } from "../inngest/index.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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
      case "payment_intent.succeeded": {
        console.log("💰 Payment intent succeeded");
        const paymentIntent = event.data.object;

        // Get checkout session
        const sessionList = await stripe.checkout.sessions.list({
          payment_intent: paymentIntent.id,
          limit: 1,
        });

        if (sessionList.data.length === 0) {
          console.log("⚠️ No session found for payment intent");
          break;
        }

        const session = sessionList.data[0];
        const { subscriptionId, userId, planId, isUpgrade, oldSubscriptionId } =
          session.metadata;

        if (!subscriptionId) {
          console.log("⚠️ No subscription ID in metadata");
          break;
        }

        // Update new subscription status
        const subscription = await Subscription.findById(
          subscriptionId
        ).populate("plan");
        if (!subscription) {
          console.log("⚠️ Subscription not found:", subscriptionId);
          break;
        }

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
          const oldSubscription = await Subscription.findByIdAndUpdate(
            oldSubscriptionId,
            { status: "Cancelled" },
            { new: true }
          );
          console.log("✅ Old subscription cancelled:", oldSubscriptionId);
        }

        // Update user subscription status
        const user = await User.findById(userId);
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
          console.log("✅ Email event sent to Inngest");
        } catch (inngestError) {
          console.error(
            "⚠️ Failed to send Inngest event:",
            inngestError.message
          );
          // Don't fail the webhook if email fails
        }

        break;
      }

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
          const { subscriptionId } = session.metadata;

          if (subscriptionId) {
            // Mark subscription as failed
            await Subscription.findByIdAndUpdate(subscriptionId, {
              status: "Cancelled",
              paymentLink: "",
            });

            console.log(
              "⚠️ Subscription cancelled due to payment failure:",
              subscriptionId
            );
          }
        }
        break;
      }

      case "checkout.session.expired": {
        console.log("⏰ Checkout session expired");
        const session = event.data.object;
        const { subscriptionId } = session.metadata;

        if (subscriptionId) {
          // Cancel subscription if checkout expired
          await Subscription.findByIdAndUpdate(subscriptionId, {
            status: "Cancelled",
            paymentLink: "",
          });

          console.log(
            "⚠️ Subscription cancelled due to expired checkout:",
            subscriptionId
          );
        }
        break;
      }

      case "checkout.session.completed": {
        console.log("✅ Checkout session completed");
        const session = event.data.object;

        // This is handled by payment_intent.succeeded
        // But we can log it for monitoring
        console.log("Session ID:", session.id);
        console.log("Payment status:", session.payment_status);
        break;
      }

      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }

    response.json({ received: true, type: event.type });
  } catch (error) {
    console.error("❌ Webhook processing error:", error);
    response.status(500).json({
      error: "Webhook processing failed",
      message: error.message,
    });
  }
};
