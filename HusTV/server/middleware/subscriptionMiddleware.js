// ============================================
// FILE 3: server/middleware/subscriptionMiddleware.js
// ============================================
import rateLimit from "express-rate-limit";

/**
 * Validate create subscription request
 */
export const validateCreateSubscription = (req, res, next) => {
  const { planId } = req.body;

  // Validate planId exists
  if (!planId) {
    return res.status(400).json({
      success: false,
      message: "Plan ID is required",
    });
  }

  // Validate planId format (should start with "plan_")
  if (typeof planId !== "string" || !planId.startsWith("plan_")) {
    return res.status(400).json({
      success: false,
      message: "Invalid plan ID format",
    });
  }

  next();
};

/**
 * Rate limiter for payment endpoints
 * Limit: 10 requests per 15 minutes per user
 */
export const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each user to 10 requests per windowMs
  message: {
    success: false,
    message: "Too many payment requests. Please try again later.",
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  // Use user ID as key (from Clerk auth)
  keyGenerator: (req) => {
    return req.auth?.userId || req.ip;
  },
  // Skip rate limiting for successful requests
  skipSuccessfulRequests: false,
  // Skip rate limiting for failed requests
  skipFailedRequests: true,
});

/**
 * Validate cancel subscription request
 */
export const validateCancelSubscription = (req, res, next) => {
  // No body validation needed for cancel
  // Just ensure user is authenticated (handled by protectUser)
  next();
};

export default {
  validateCreateSubscription,
  paymentLimiter,
  validateCancelSubscription,
};
