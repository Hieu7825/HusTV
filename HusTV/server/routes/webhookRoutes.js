// server/routes/webhookRoutes.js
import express from "express";
import { stripeWebhookHandler } from "../controllers/stripeWebhooks.js";

const router = express.Router();

// Stripe webhook (raw body required - special middleware)
router.post(
  "/stripe",
  express.raw({ type: "application/json" }),
  stripeWebhookHandler
);

export default router;
