// ============================================
// FILE 5: inngest/index.js - UPDATED (add cleanup function)
// ============================================
import { inngest } from "./client.js";

import {
  clerkUserCreated,
  clerkUserUpdated,
  clerkUserDeleted,
} from "./functions/clerkSync.js";

import {
  cleanupUnpaidSubscriptions, // ✅ NEW
  checkExpiredSubscriptions,
  sendExpiryReminders,
  cleanupOldSubscriptions,
  checkSubscriptionStatus,
} from "./functions/subscriptionJobs.js";

import {
  sendSubscriptionConfirmedEmail,
  sendSubscriptionUpgradedEmail,
  sendWelcomeEmail,
  sendNewContentNotification,
} from "./functions/emailAutomation.js";

import {
  processVideoAfterUpload,
  notifyVideoUploaded,
  updateVideoStatistics,
  cleanupDraftVideos,
} from "./functions/videoProcessing.js";

export { inngest };

export const functions = [
  // Clerk sync functions
  clerkUserCreated,
  clerkUserUpdated,
  clerkUserDeleted,

  // Subscription management
  cleanupUnpaidSubscriptions, // ✅ NEW - runs every minute
  checkExpiredSubscriptions,
  sendExpiryReminders,
  cleanupOldSubscriptions,
  checkSubscriptionStatus,

  // Email automation
  sendSubscriptionConfirmedEmail,
  sendSubscriptionUpgradedEmail,
  sendWelcomeEmail,
  sendNewContentNotification,

  // Video processing
  processVideoAfterUpload,
  notifyVideoUploaded,
  updateVideoStatistics,
  cleanupDraftVideos,
];

export default { inngest, functions };
