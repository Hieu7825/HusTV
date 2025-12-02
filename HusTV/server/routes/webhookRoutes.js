// ============================================
// FILE 2: server/routes/webhookRoutes.js
// ============================================
import express from "express";
import { stripeWebhookHandler } from "../controllers/stripeWebhooks.js";

const router = express.Router();

/**
 * Stripe Webhook Endpoint
 * ⚠️ CRITICAL: This route MUST use express.raw() middleware
 * ⚠️ This is required for Stripe signature verification
 * ⚠️ DO NOT use express.json() on this route
 *
 * POST /api/webhooks/stripe
 *
 * Handles events:
 * - payment_intent.succeeded
 * - payment_intent.payment_failed
 * - checkout.session.expired
 * - checkout.session.completed
 */
router.post(
  "/stripe",
  express.raw({ type: "application/json" }), // RAW body for signature verification
  stripeWebhookHandler
);

/**
 * Health check endpoint (optional)
 * GET /api/webhooks/health
 */
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Webhook service is running",
    timestamp: new Date().toISOString(),
  });
});

export default router;
