// inngest/index.js
import { Inngest } from "inngest";

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

// Initialize Inngest client
export const inngest = new Inngest({
  id: "hustv",
  name: "HusTV",
  eventKey: process.env.INNGEST_EVENT_KEY,
});

// Export all functions as array
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

// Export individual functions for testing
export {
  // Clerk sync
  clerkUserCreated,
  clerkUserUpdated,
  clerkUserDeleted,

  // Subscription jobs
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
};
