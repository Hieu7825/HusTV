// server/routes/videoRoutes.js
import express from "express";
import { protectUser, protectAdmin, optionalAuth } from "../middleware/auth.js";
import {
  uploadVideoComplete,
  handleUploadError,
  validateVideoFile,
  validateFileSizes,
} from "../middleware/uploadVideo.js";
import {
  getAllVideos,
  getVideoById,
  searchVideos,
  getFeaturedVideos,
  getTrendingVideos,
  getVideosByGenre,
  streamVideo,
  getTrailerUrl,
  uploadVideo,
  updateVideo,
  deleteVideo,
  toggleFeatured,
  toggleTrending,
  incrementView,
} from "../controllers/videoController.js";
import { generateUploadSignature } from "../utils/cloudinary.js"; // 🆕 THÊM IMPORT

const router = express.Router();

// ==================== 🆕 NEW: CLOUDINARY SIGNATURE ====================
/**
 * Generate signed upload parameters for client-side uploads
 * POST /api/videos/cloudinary/signature
 * Allows frontend to upload directly to Cloudinary (bypass 4.5MB server limit)
 */
router.post("/cloudinary/signature", protectUser, async (req, res) => {
  try {
    const { folder, public_id } = req.body;

    console.log("📝 Generating Cloudinary signature for:", {
      folder: folder || "hustv",
      public_id: public_id || "(auto-generated)",
    });

    const signatureData = generateUploadSignature({
      folder: folder || "hustv",
      public_id: public_id,
    });

    console.log("✅ Signature generated successfully");

    res.json({
      success: true,
      ...signatureData,
    });
  } catch (error) {
    console.error("❌ Signature generation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate upload signature",
      error: error.message,
    });
  }
});

// ==================== PUBLIC ROUTES ====================
// No authentication required

// Get all videos with filters
router.get("/", optionalAuth, getAllVideos);

// Get featured videos (for homepage carousel)
router.get("/featured", optionalAuth, getFeaturedVideos);

// Get trending videos
router.get("/trending", optionalAuth, getTrendingVideos);

// Search videos
router.get("/search", searchVideos);

// Get videos by genre
router.get("/genre/:genreId", optionalAuth, getVideosByGenre);

// Get single video by ID
router.get("/:id", optionalAuth, getVideoById);

// Get trailer URL (public - no subscription required)
router.get("/:id/trailer", getTrailerUrl);

// ==================== PROTECTED ROUTES ====================
// Require authentication

// Get streaming URL (requires active subscription)
router.get("/:id/stream", protectUser, streamVideo);

// Increment view count
router.post("/:id/view", protectUser, incrementView);

// ==================== ADMIN ROUTES ====================
// Require admin role

// Debug middleware to log incoming request AFTER upload parsing
const debugUpload = (req, res, next) => {
  console.log("DEBUG ROUTE - req.body keys:", Object.keys(req.body || {}));
  console.log("DEBUG ROUTE - req.body:", req.body);
  console.log(
    "DEBUG ROUTE - req.files keys:",
    req.files ? Object.keys(req.files) : "(no files)"
  );
  console.log("DEBUG ROUTE - Full req.files:", req.files);
  next();
};

// Upload video with trailer, poster, backdrop
router.post(
  "/",
  protectAdmin,
  uploadVideoComplete,
  debugUpload,
  handleUploadError,
  validateVideoFile,
  validateFileSizes,
  uploadVideo
);

// Update video
router.put(
  "/:id",
  protectAdmin,
  uploadVideoComplete,
  handleUploadError,
  validateVideoFile,
  validateFileSizes,
  updateVideo
);

// Delete video
router.delete("/:id", protectAdmin, deleteVideo);

// Toggle featured status
router.patch("/:id/featured", protectAdmin, toggleFeatured);

// Toggle trending status
router.patch("/:id/trending", protectAdmin, toggleTrending);

export default router;
