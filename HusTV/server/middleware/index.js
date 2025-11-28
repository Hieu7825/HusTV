// middleware/index.js
// Central export file for all middleware

// Authentication
export * from "./auth.js";

// Upload
export * from "./uploadVideo.js";

// Error handling
export * from "./errorHandler.js";

// Subscription validation
export * from "./validateSubscription.js";

// Rate limiting - import explicitly to avoid conflicts
export {
  apiLimiter,
  authLimiter,
  paymentLimiter,
  uploadLimiter,
  searchLimiter,
  watchProgressLimiter,
} from "./rateLimiter.js";

// Request validation
export * from "./validation.js";
