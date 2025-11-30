// inngest/index.js
import { inngest } from "./client.js";

// Import all function modules
import {
  clerkUserCreated,
  clerkUserUpdated,
  clerkUserDeleted,
} from "./functions/clerkSync.js";

import {
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

// Export inngest client and functions
export { inngest };

export const functions = [
  // Clerk sync functions
  clerkUserCreated,
  clerkUserUpdated,
  clerkUserDeleted,

  // Subscription management
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
