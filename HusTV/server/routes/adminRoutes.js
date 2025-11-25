// server/routes/adminRoutes.js
import express from "express";
import { protectAdmin } from "../middleware/index.js";
import {
  getDashboardStats,
  getAllUsers,
  getUserDetails,
  updateUserRole,
  getAllSubscriptionsAdmin,
  getRevenueStats,
  getTopVideos,
  getRecentActivities,
} from "../controllers/adminController.js";

const router = express.Router();

// All routes require admin
router.use(protectAdmin);

router.get("/dashboard/stats", getDashboardStats);
router.get("/users", getAllUsers);
router.get("/users/:userId", getUserDetails);
router.patch("/users/:userId/role", updateUserRole);
router.get("/subscriptions", getAllSubscriptionsAdmin);
router.get("/revenue", getRevenueStats);
router.get("/videos/top", getTopVideos);
router.get("/activities", getRecentActivities);

export default router;
