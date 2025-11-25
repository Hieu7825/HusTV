// utils/stripe.js
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Create Stripe checkout session for new subscription
 * @param {Object} params - Checkout parameters
 * @returns {Promise<Object>} Checkout session
 */
export const createCheckoutSession = async ({
  subscriptionId,
  planName,
  price,
  userEmail,
  userName,
  userId,
  isUpgrade = false,
  oldSubscriptionId = null,
}) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: userEmail,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: isUpgrade ? `Upgrade to ${planName}` : planName,
              description: isUpgrade
                ? `Upgrade your subscription to ${planName}`
                : `${planName} Subscription`,
            },
            unit_amount: Math.round(price * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      metadata: {
        subscriptionId,
        userId,
        userName,
        planName,
        isUpgrade: isUpgrade.toString(),
        ...(oldSubscriptionId && { oldSubscriptionId }),
      },
      success_url: `${process.env.WEBSITE_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.WEBSITE_URL}/subscription/cancel`,
      expires_at: Math.floor(Date.now() / 1000) + 1800, // 30 minutes
    });

    return {
      success: true,
      sessionId: session.id,
      url: session.url,
    };
  } catch (error) {
    console.error("Stripe checkout session error:", error);
    throw new Error(`Failed to create checkout session: ${error.message}`);
  }
};

/**
 * Create recurring subscription (for future use)
 * @param {Object} params - Subscription parameters
 * @returns {Promise<Object>} Subscription result
 */
export const createRecurringSubscription = async ({
  customerId,
  priceId,
  metadata,
}) => {
  try {
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      metadata,
      payment_behavior: "default_incomplete",
      expand: ["latest_invoice.payment_intent"],
    });

    return {
      success: true,
      subscriptionId: subscription.id,
      clientSecret: subscription.latest_invoice.payment_intent.client_secret,
    };
  } catch (error) {
    console.error("Stripe subscription error:", error);
    throw new Error(`Failed to create subscription: ${error.message}`);
  }
};

/**
 * Cancel Stripe subscription
 * @param {string} subscriptionId - Stripe subscription ID
 * @returns {Promise<Object>} Cancellation result
 */
export const cancelStripeSubscription = async (subscriptionId) => {
  try {
    const subscription = await stripe.subscriptions.cancel(subscriptionId);

    return {
      success: true,
      status: subscription.status,
      canceledAt: subscription.canceled_at,
    };
  } catch (error) {
    console.error("Stripe cancellation error:", error);
    throw new Error(`Failed to cancel subscription: ${error.message}`);
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
    };
  } catch (error) {
    console.error("Get payment intent error:", error);
    throw new Error(`Failed to retrieve payment intent: ${error.message}`);
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
      amountTotal: session.amount_total / 100,
      metadata: session.metadata,
    };
  } catch (error) {
    console.error("Get checkout session error:", error);
    throw new Error(`Failed to retrieve session: ${error.message}`);
  }
};

/**
 * Create Stripe customer
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
    console.error("Create customer error:", error);
    throw new Error(`Failed to create customer: ${error.message}`);
  }
};

/**
 * Create refund
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
    };
  } catch (error) {
    console.error("Refund error:", error);
    throw new Error(`Failed to create refund: ${error.message}`);
  }
};

/**
 * Construct webhook event (for webhook verification)
 * @param {string} payload - Request body
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
    console.error("Webhook verification error:", error);
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
 * @param {string} currency - Currency code
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

export default {
  createCheckoutSession,
  createRecurringSubscription,
  cancelStripeSubscription,
  getPaymentIntent,
  getCheckoutSession,
  createCustomer,
  createRefund,
  constructWebhookEvent,
  calculateUpgradePrice,
  formatPrice,
  validateWebhookSignature,
};
