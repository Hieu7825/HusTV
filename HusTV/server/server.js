// server/index.js
import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./configs/db.js";
import { clerkMiddleware } from "@clerk/express";
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js";

// Import routes
import webhookRoutes from "./routes/webhookRoutes.js"; // ⚠️ MUST BE FIRST
import subscriptionRoutes from "./routes/subscriptionRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import videoRoutes from "./routes/videoRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import genreRoutes from "./routes/genreRoutes.js";
import adminPlanRoutes from "./routes/adminPlanRoutes.js";

// Import middleware
import { errorHandler, notFound, apiLimiter } from "./middleware/index.js";
import { startSubscriptionChecker } from "./cron/subscriptionChecker.js";

const app = express();
const port = process.env.PORT || 3000;
const corsOptions = {
  origin: ["http://localhost:5173", "https://hustv.vercel.app"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
  ],
  exposedHeaders: ["Content-Length"],
  maxAge: 86400,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// Connect to MongoDB
await connectDB();

// ============================================
// ⚠️ CRITICAL: Webhook routes MUST be BEFORE express.json()
// Stripe webhooks require raw body for signature verification
// ============================================
app.use("/api/webhooks", webhookRoutes);

// ============================================
// Standard Middleware (AFTER webhook routes)
// ============================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.use(
//   cors({
//     origin: [
//       "http://localhost:5173", // Để code ở máy (Local)
//       "https://hustv.vercel.app", // Để chạy trên Vercel (Production)
//     ],
//     credentials: true,
//   })
// );

app.use(clerkMiddleware());

// ============================================
// Rate Limiting (Apply to all API routes)
// ============================================
app.use("/api", apiLimiter);

// ============================================
// Health Check
// ============================================
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "HusTV API Server is Live! 🎬",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// ============================================
// Inngest Event System
// ============================================
app.use("/api/inngest", serve({ client: inngest, functions }));

// ============================================
// API Routes
// ============================================

// Subscription routes (NEW)
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/admin/plans", adminPlanRoutes);
// User routes
app.use("/api/users", userRoutes);

// Video routes
app.use("/api/videos", videoRoutes);

// Genre routes
app.use("/api/genres", genreRoutes);

// Admin routes
app.use("/api/admin", adminRoutes);

// ============================================
// Error Handling (MUST BE LAST)
// ============================================
app.use(notFound);
app.use(errorHandler);
// startSubscriptionChecker();

// ============================================
// Start Server
// ============================================
app.listen(port, () => {
  console.log(`🚀 HusTV Server is Running  `);
});

export default app;
