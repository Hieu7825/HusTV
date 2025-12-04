// server/routes/adminRoutes.js
import express from "express";
import { protectAdmin } from "../middleware/index.js";
import {
  isAdmin,
  getDashboardData,
  getAllUsers,
  getAllSubscriptions,
  toggleUserBan,
} from "../controllers/adminController.js";

const router = express.Router();

// Check if user is admin
router.get("/check", protectAdmin, isAdmin);

// Dashboard - Single optimized endpoint
router.get("/dashboard/stats", protectAdmin, getDashboardData);

// Users management
router.get("/users", protectAdmin, getAllUsers);
router.patch("/users/:userId/ban", protectAdmin, toggleUserBan);

// Subscriptions management
router.get("/subscriptions", protectAdmin, getAllSubscriptions);

export default router;
