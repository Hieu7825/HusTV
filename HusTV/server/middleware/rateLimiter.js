// middleware/rateLimiter.js
import rateLimit from "express-rate-limit";

/**
 * General API rate limiter
 * 100 requests per 15 minutes
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    message: "Too many requests, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Strict rate limiter for authentication routes
 * 5 requests per 15 minutes
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: "Too many authentication attempts, please try again later",
  },
  skipSuccessfulRequests: true, // Don't count successful requests
});

/**
 * Payment route limiter
 * 10 requests per hour
 */
export const paymentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: {
    success: false,
    message: "Too many payment requests, please try again later",
  },
});

/**
 * Video upload limiter
 * 20 uploads per hour (for admins)
 */
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: "Upload limit reached, please try again later",
  },
});

/**
 * Search rate limiter
 * 50 searches per minute
 */
export const searchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 50,
  message: {
    success: false,
    message: "Too many search requests, please slow down",
  },
});

/**
 * Watch history update limiter
 * Prevent spam updates - 30 per minute
 */
export const watchProgressLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: {
    success: false,
    message: "Too many progress updates",
  },
  skipFailedRequests: true,
});
