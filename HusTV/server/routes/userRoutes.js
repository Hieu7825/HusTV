// server/routes/userRoutes.js
import express from "express";
import {
  protectUser,
  validateUpdatePreferences,
  validateUpdateDevice,
  validateWatchProgress,
  validatePagination,
  watchProgressLimiter,
} from "../middleware/index.js";
import {
  getUserProfile,
  getUserStats,
  toggleFavorite,
  getFavorites,
  checkFavorite,
  getWatchHistory,
  updateWatchProgress,
  getWatchProgress,
  deleteWatchHistory,
  clearWatchHistory,
  updatePreferences,
  getPreferences,
  getDevices,
  updateDevice,
  removeDevice,
  getContinueWatching,
  getRecommendedVideos,
} from "../controllers/userController.js";

const router = express.Router();

// All routes require authentication
router.use(protectUser);

// Profile & Stats
router.get("/profile", getUserProfile);
router.get("/stats", getUserStats);

// Favorites
router.post("/favorites", toggleFavorite);
router.get("/favorites", getFavorites);
router.get("/favorites/:videoId", checkFavorite);

// Watch History & Progress
router.get("/watch-history", validatePagination, getWatchHistory);
router.post(
  "/watch-progress/:videoId",
  watchProgressLimiter,
  validateWatchProgress,
  updateWatchProgress
);
router.get("/watch-progress/:videoId", getWatchProgress);
router.delete("/watch-history/:videoId", deleteWatchHistory);
router.delete("/watch-history", clearWatchHistory);

// Preferences
router.put("/preferences", validateUpdatePreferences, updatePreferences);
router.get("/preferences", getPreferences);

// Devices
router.get("/devices", getDevices);
router.post("/devices", validateUpdateDevice, updateDevice);
router.delete("/devices", removeDevice);

// Recommendations
router.get("/continue-watching", getContinueWatching);
router.get("/recommended", getRecommendedVideos);

export default router;
