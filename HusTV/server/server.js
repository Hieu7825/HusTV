import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./configs/db.js";
import { clerkMiddleware } from "@clerk/express";
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js";

// Import routes
import subscriptionRoutes from "./routes/subscriptionRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import videoRoutes from "./routes/videoRoutes.js";
import webhookRoutes from "./routes/webhookRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import genreRoutes from "./routes/genreRoutes.js"; // ⭐ THÊM MỚI

// Import middleware
import { errorHandler, notFound, apiLimiter } from "./middleware/index.js";

const app = express();
const port = 3000;

await connectDB();

// Webhooks need raw body - must be BEFORE express.json()
app.use("/api/webhooks", webhookRoutes);

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(clerkMiddleware());

// Apply rate limiting to all API routes
app.use("/api", apiLimiter);

// API Routes
app.get("/", (req, res) => res.send("HusTV API Server is Live! 🎬"));

// Inngest
app.use("/api/inngest", serve({ client: inngest, functions }));

// Main routes
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/users", userRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/genres", genreRoutes); // ⭐ THÊM MỚI - Genre management
app.use("/api/admin", adminRoutes);

// Error handling (must be last)
app.use(notFound);
app.use(errorHandler);

app.listen(port, () =>
  console.log(`🚀 HusTV Server running at http://localhost:${port}`)
);

export default app;
