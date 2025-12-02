// server/utils/stripe.js
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Create Stripe checkout session for subscription or booking
 * @param {Object} params - Checkout parameters
 * @returns {Promise<Object>} Checkout session
 */
export const createCheckoutSession = async ({
  subscriptionId = null,
  bookingId = null,
  planName,
  price,
  userEmail,
  userName,
  userId,
  isUpgrade = false,
  oldSubscriptionId = null,
  planId = null,
}) => {
  try {
    // Determine product name and description
    let productName = planName;
    let description = "";

    if (bookingId) {
      // For booking: planName = movie title
      productName = planName;
      description = `Movie Booking - ${planName}`;
    } else if (subscriptionId) {
      // For subscription
      if (isUpgrade) {
        productName = `Upgrade to ${planName}`;
        description = `Upgrade your subscription to ${planName}`;
      } else {
        productName = planName;
        description = `${planName} Subscription`;
      }
    }

    // Build metadata based on type
    const metadata = {};

    if (bookingId) {
      // Booking metadata
      metadata.bookingId = bookingId;
      metadata.userName = userName;
      metadata.userEmail = userEmail;
    } else if (subscriptionId) {
      // Subscription metadata
      metadata.subscriptionId = subscriptionId;
      metadata.userId = userId;
      metadata.userName = userName;
      metadata.planName = planName;
      metadata.isUpgrade = isUpgrade.toString();

      if (planId) {
        metadata.planId = planId;
      }

      if (oldSubscriptionId) {
        metadata.oldSubscriptionId = oldSubscriptionId;
      }
    }

    // Determine success and cancel URLs
    const successUrl = bookingId
      ? `${process.env.WEBSITE_URL}/loading/my-bookings?session_id={CHECKOUT_SESSION_ID}`
      : `${process.env.WEBSITE_URL}/my-subscriptions?session_id={CHECKOUT_SESSION_ID}`;

    const cancelUrl = bookingId
      ? `${process.env.WEBSITE_URL}/my-bookings?cancelled=true`
      : `${process.env.WEBSITE_URL}/my-subscriptions?cancelled=true`;

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: userEmail,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: productName,
              description,
            },
            unit_amount: Math.round(price * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      metadata,
      success_url: successUrl,
      cancel_url: cancelUrl,
      expires_at: Math.floor(Date.now() / 1000) + 1800, // Expires in 30 minutes
    });

    return {
      success: true,
      sessionId: session.id,
      url: session.url,
    };
  } catch (error) {
    console.error("❌ Stripe checkout session error:", error);
    throw new Error(`Failed to create checkout session: ${error.message}`);
  }
};

/**
 * Retrieve checkout session details
 * @param {string} sessionId - Checkout session ID
 * @returns {Promise<Object>} Session details
 */
export const getCheckoutSession = async (sessionId) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    return {
      success: true,
      id: session.id,
      paymentStatus: session.payment_status,
      paymentIntentId: session.payment_intent,
      customerEmail: session.customer_email,
      amountTotal: session.amount_total / 100, // Convert from cents
      metadata: session.metadata,
    };
  } catch (error) {
    console.error("❌ Get checkout session error:", error);
    throw new Error(`Failed to retrieve session: ${error.message}`);
  }
};

/**
 * Retrieve payment intent details
 * @param {string} paymentIntentId - Payment intent ID
 * @returns {Promise<Object>} Payment intent details
 */
export const getPaymentIntent = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    return {
      success: true,
      id: paymentIntent.id,
      amount: paymentIntent.amount / 100, // Convert from cents
      currency: paymentIntent.currency,
      status: paymentIntent.status,
      metadata: paymentIntent.metadata,
      created: paymentIntent.created,
      paymentMethodTypes: paymentIntent.payment_method_types,
    };
  } catch (error) {
    console.error("❌ Get payment intent error:", error);
    throw new Error(`Failed to retrieve payment intent: ${error.message}`);
  }
};

/**
 * Construct webhook event (for webhook verification)
 * @param {string} payload - Request body (raw)
 * @param {string} signature - Stripe signature header
 * @returns {Object} Verified event
 */
export const constructWebhookEvent = (payload, signature) => {
  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    return event;
  } catch (error) {
    console.error("❌ Webhook verification error:", error);
    throw new Error(`Webhook verification failed: ${error.message}`);
  }
};

/**
 * Calculate upgrade price difference
 * @param {number} currentPrice - Current plan price
 * @param {number} newPrice - New plan price
 * @returns {number} Price difference (always positive or 0)
 */
export const calculateUpgradePrice = (currentPrice, newPrice) => {
  const difference = newPrice - currentPrice;
  return difference > 0 ? difference : 0;
};

/**
 * Format price for display
 * @param {number} price - Price in dollars
 * @param {string} currency - Currency code (default: USD)
 * @returns {string} Formatted price
 */
export const formatPrice = (price, currency = "USD") => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(price);
};

/**
 * Validate webhook signature (alternative to constructWebhookEvent)
 * @param {string} payload - Request body
 * @param {string} signature - Stripe signature
 * @returns {boolean} Is valid
 */
export const validateWebhookSignature = (payload, signature) => {
  try {
    stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Create Stripe customer (optional for future recurring subscriptions)
 * @param {Object} params - Customer parameters
 * @returns {Promise<Object>} Customer details
 */
export const createCustomer = async ({ email, name, userId }) => {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        userId,
      },
    });

    return {
      success: true,
      customerId: customer.id,
      email: customer.email,
    };
  } catch (error) {
    console.error("❌ Create customer error:", error);
    throw new Error(`Failed to create customer: ${error.message}`);
  }
};

/**
 * Create refund (for cancellations)
 * @param {string} paymentIntentId - Payment intent ID
 * @param {number} amount - Refund amount (optional, full refund if not provided)
 * @returns {Promise<Object>} Refund details
 */
export const createRefund = async (paymentIntentId, amount = null) => {
  try {
    const refundParams = {
      payment_intent: paymentIntentId,
    };

    if (amount) {
      refundParams.amount = Math.round(amount * 100); // Convert to cents
    }

    const refund = await stripe.refunds.create(refundParams);

    return {
      success: true,
      refundId: refund.id,
      amount: refund.amount / 100,
      status: refund.status,
      created: refund.created,
    };
  } catch (error) {
    console.error("❌ Refund error:", error);
    throw new Error(`Failed to create refund: ${error.message}`);
  }
};

/**
 * List checkout sessions by payment intent
 * @param {string} paymentIntentId - Payment intent ID
 * @returns {Promise<Object>} Session list
 */
export const listCheckoutSessions = async (paymentIntentId) => {
  try {
    const sessions = await stripe.checkout.sessions.list({
      payment_intent: paymentIntentId,
      limit: 1,
    });

    return {
      success: true,
      sessions: sessions.data,
    };
  } catch (error) {
    console.error("❌ List sessions error:", error);
    throw new Error(`Failed to list sessions: ${error.message}`);
  }
};

// Export all functions
export default {
  createCheckoutSession,
  getCheckoutSession,
  getPaymentIntent,
  constructWebhookEvent,
  calculateUpgradePrice,
  formatPrice,
  validateWebhookSignature,
  createCustomer,
  createRefund,
  listCheckoutSessions,
};
