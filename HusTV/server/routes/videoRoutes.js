// server/routes/videoRoutes.js
import express from "express";
import {
  protectUser,
  protectAdmin,
  optionalAuth,
  requireActiveSubscription,
  canWatchVideo,
  uploadSingleVideo,
  handleUploadError,
  validateCreateVideo,
  validateUpdateVideo,
  validatePagination,
  validateSearch,
  uploadLimiter,
  searchLimiter,
} from "../middleware/index.js";
import {
  getAllVideos,
  getVideoById,
  searchVideos,
  getFeaturedVideos,
  getTrendingVideos,
  getVideosByGenre,
  streamVideo,
  uploadVideo,
  updateVideo,
  deleteVideo,
  toggleFeatured,
  toggleTrending,
  incrementView,
} from "../controllers/videoController.js";

const router = express.Router();

// Public routes (optional auth for favorites check)
router.get("/", optionalAuth, validatePagination, getAllVideos);
router.get("/featured", optionalAuth, getFeaturedVideos);
router.get("/trending", optionalAuth, getTrendingVideos);
router.get("/search", searchLimiter, validateSearch, searchVideos);
router.get(
  "/genre/:genreId",
  optionalAuth,
  validatePagination,
  getVideosByGenre
);
router.get("/:id", optionalAuth, getVideoById);

// Protected routes (require subscription)
router.get(
  "/:id/stream",
  protectUser,
  requireActiveSubscription,
  canWatchVideo,
  streamVideo
);
router.post("/:id/view", protectUser, incrementView);

// Admin routes
router.post(
  "/",
  protectAdmin,
  uploadLimiter,
  (req, res, next) => {
    uploadSingleVideo(req, res, (err) => {
      if (err) {
        return handleUploadError(err, req, res, next);
      }
      next();
    });
  },
  validateCreateVideo,
  uploadVideo
);
router.put("/:id", protectAdmin, validateUpdateVideo, updateVideo);
router.delete("/:id", protectAdmin, deleteVideo);
router.patch("/:id/featured", protectAdmin, toggleFeatured);
router.patch("/:id/trending", protectAdmin, toggleTrending);

export default router;
