// server/routes/adminRoutes.js
import express from "express";
import { protectAdmin } from "../middleware/index.js";
import {
  isAdmin,
  getDashboardData,
  getAllUsers,
  getAllSubscriptions,
  getAllVideos,
  toggleUserBan,
  updateVideoStatus,
  getRevenueStats,
} from "../controllers/adminController.js";

const router = express.Router();

// Check if user is admin
router.get("/check", protectAdmin, isAdmin);

// Dashboard
router.get("/dashboard", protectAdmin, getDashboardData);

// Users management
router.get("/users", protectAdmin, getAllUsers);
router.patch("/users/:userId/ban", protectAdmin, toggleUserBan);

// Subscriptions
router.get("/subscriptions", protectAdmin, getAllSubscriptions);

// Videos management
router.get("/videos", protectAdmin, getAllVideos);
router.patch("/videos/:videoId/status", protectAdmin, updateVideoStatus);

// Revenue stats
router.get("/revenue", protectAdmin, getRevenueStats);

export default router;
