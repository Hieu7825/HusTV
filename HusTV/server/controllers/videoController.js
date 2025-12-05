// server/controllers/videoController.js
import Video from "../models/Video.js";
import User from "../models/User.js";
import WatchHistory from "../models/WatchHistory.js";
import {
  uploadVideo as uploadToCloudinary,
  uploadImage,
  deleteVideo as deleteFromCloudinary,
  deleteImage,
  getStreamingUrl,
} from "../utils/index.js";
import { inngest } from "../inngest/index.js";
import { clerkClient } from "@clerk/express";
import fs from "fs";

// ==================== UPLOAD & CREATE ====================

/**
 * 🆕 MODIFIED: Upload video - SUPPORTS BOTH:
 * 1. Client-side upload (only URLs in request body) ⭐ NEW
 * 2. Server-side upload (files in req.files) - LEGACY, limited to 4MB
 */
export const uploadVideo = async (req, res) => {
  try {
    const auth = req.auth();
    const { userId } = auth || {};

    const {
      title,
      overview,
      tagline,
      runtime,
      release_date,
      original_language,
      genres,
      casts,
      adult,
      vote_average,
      vote_count,
      // 🆕 NEW: URLs from client-side Cloudinary upload
      video_url,
      trailer_url,
      poster_path,
      backdrop_path,
      cloudinary_public_id,
    } = req.body;

    // Validate required fields
    if (!title || !overview) {
      return res.status(400).json({
        success: false,
        message: "Title and overview are required",
      });
    }

    console.log("📤 Processing video upload...");
    console.log("📋 Request body fields:", Object.keys(req.body));
    console.log(
      "📁 Request files:",
      req.files ? Object.keys(req.files) : "none"
    );

    let videoUrl = video_url || null;
    let trailerUrl = trailer_url || null;
    let posterUrl = poster_path || null;
    let backdropUrl = backdrop_path || null;
    let cloudinaryPublicId = cloudinary_public_id || null;

    // ==================== 🆕 CLIENT-SIDE UPLOAD PATH ====================
    // If URLs are provided in body, skip file upload (already uploaded by client)
    const hasClientUploadedUrls = video_url || poster_path;

    if (hasClientUploadedUrls) {
      console.log("✅ Using client-uploaded URLs (bypassed server upload)");
      console.log("📹 Video URL:", videoUrl);
      console.log("🎬 Trailer URL:", trailerUrl);
      console.log("🖼️ Poster URL:", posterUrl);
      console.log("🖼️ Backdrop URL:", backdropUrl);
    }
    // ==================== LEGACY: SERVER-SIDE UPLOAD PATH ====================
    else {
      console.log("⚠️ Using legacy server-side upload (4MB limit on Vercel)");

      // Keep existing poster/backdrop/trailer/video if provided
      if (req.body.poster_path && !req.files?.poster) {
        posterUrl = req.body.poster_path;
        console.log("ℹ️ Keeping existing poster URL:", posterUrl);
      }
      if (req.body.backdrop_path && !req.files?.backdrop) {
        backdropUrl = req.body.backdrop_path;
        console.log("ℹ️ Keeping existing backdrop URL:", backdropUrl);
      }
      if (req.body.trailer_url && !req.files?.trailer) {
        trailerUrl = req.body.trailer_url;
        console.log("ℹ️ Keeping existing trailer URL:", trailerUrl);
      }
      if (req.body.video_url && !req.files?.video) {
        videoUrl = req.body.video_url;
        console.log("ℹ️ Keeping existing video URL:", videoUrl);
      }

      // ===== UPLOAD POSTER TO CLOUDINARY =====
      if (req.files?.poster && req.files.poster.length > 0) {
        console.log("🖼️ Uploading poster to Cloudinary...");
        const posterFile = req.files.poster[0];

        console.log("📂 Poster file details:", {
          fieldname: posterFile.fieldname,
          originalname: posterFile.originalname,
          mimetype: posterFile.mimetype,
          size: posterFile.size,
          path: posterFile.path,
        });

        try {
          const posterResult = await uploadImage(
            posterFile.path,
            "hustv/posters"
          );
          posterUrl = posterResult.url;
          console.log("✅ Poster uploaded to Cloudinary:", posterUrl);

          if (fs.existsSync(posterFile.path)) {
            fs.unlinkSync(posterFile.path);
            console.log("🗑️ Cleaned up temp poster file");
          }
        } catch (error) {
          console.error("❌ Poster upload failed:", error);

          // Cleanup any uploaded files
          if (req.files) {
            Object.values(req.files).forEach((fileArray) => {
              fileArray.forEach((file) => {
                if (fs.existsSync(file.path)) {
                  fs.unlinkSync(file.path);
                }
              });
            });
          }

          return res.status(500).json({
            success: false,
            message: "Failed to upload poster to Cloudinary",
            error: error.message,
          });
        }
      } else {
        console.log("⚠️ No poster file in request");
      }

      // ===== UPLOAD BACKDROP TO CLOUDINARY =====
      if (req.files?.backdrop && req.files.backdrop.length > 0) {
        console.log("🖼️ Uploading backdrop to Cloudinary...");
        const backdropFile = req.files.backdrop[0];

        console.log("📂 Backdrop file details:", {
          fieldname: backdropFile.fieldname,
          originalname: backdropFile.originalname,
          mimetype: backdropFile.mimetype,
          size: backdropFile.size,
          path: backdropFile.path,
        });

        try {
          const backdropResult = await uploadImage(
            backdropFile.path,
            "hustv/backdrops"
          );
          backdropUrl = backdropResult.url;
          console.log("✅ Backdrop uploaded to Cloudinary:", backdropUrl);

          if (fs.existsSync(backdropFile.path)) {
            fs.unlinkSync(backdropFile.path);
            console.log("🗑️ Cleaned up temp backdrop file");
          }
        } catch (error) {
          console.error("❌ Backdrop upload failed:", error);
          if (fs.existsSync(backdropFile.path)) {
            fs.unlinkSync(backdropFile.path);
          }
        }
      } else {
        console.log("ℹ️ No backdrop file in request");
      }

      // ===== UPLOAD TRAILER TO CLOUDINARY =====
      if (req.files?.trailer && req.files.trailer.length > 0) {
        console.log("🎬 Uploading trailer to Cloudinary...");
        const trailerFile = req.files.trailer[0];

        console.log("📂 Trailer file details:", {
          fieldname: trailerFile.fieldname,
          originalname: trailerFile.originalname,
          mimetype: trailerFile.mimetype,
          size: trailerFile.size,
          path: trailerFile.path,
        });

        try {
          const trailerResult = await uploadToCloudinary(
            trailerFile.path,
            "hustv/trailers"
          );
          trailerUrl = trailerResult.playbackUrl || trailerResult.url;
          console.log("✅ Trailer uploaded to Cloudinary:", trailerUrl);

          if (fs.existsSync(trailerFile.path)) {
            fs.unlinkSync(trailerFile.path);
            console.log("🗑️ Cleaned up temp trailer file");
          }
        } catch (error) {
          console.error("❌ Trailer upload failed:", error);
          if (fs.existsSync(trailerFile.path)) {
            fs.unlinkSync(trailerFile.path);
          }
        }
      } else {
        console.log("ℹ️ No trailer file in request");
      }

      // ===== UPLOAD VIDEO TO CLOUDINARY =====
      if (req.files?.video && req.files.video.length > 0) {
        console.log("📹 Uploading video to Cloudinary...");
        const videoFile = req.files.video[0];

        console.log("📂 Video file details:", {
          fieldname: videoFile.fieldname,
          originalname: videoFile.originalname,
          mimetype: videoFile.mimetype,
          size: videoFile.size,
          path: videoFile.path,
        });

        try {
          const videoResult = await uploadToCloudinary(
            videoFile.path,
            "hustv/videos"
          );
          videoUrl = videoResult.playbackUrl || videoResult.url;
          cloudinaryPublicId = videoResult.publicId;
          console.log("✅ Video uploaded to Cloudinary:", videoUrl);

          if (fs.existsSync(videoFile.path)) {
            fs.unlinkSync(videoFile.path);
            console.log("🗑️ Cleaned up temp video file");
          }
        } catch (error) {
          console.error("❌ Video upload failed:", error);
          if (fs.existsSync(videoFile.path)) {
            fs.unlinkSync(videoFile.path);
          }
        }
      } else {
        console.log("ℹ️ No video file in request");
      }
    }

    // ===== VALIDATE REQUIRED FIELDS =====
    if (!posterUrl) {
      console.error("❌ VALIDATION: Poster URL is required");

      // Cleanup all uploaded files if validation fails
      if (req.files) {
        Object.values(req.files).forEach((fileArray) => {
          fileArray.forEach((file) => {
            if (fs.existsSync(file.path)) {
              fs.unlinkSync(file.path);
            }
          });
        });
      }

      return res.status(400).json({
        success: false,
        message: "Poster image is required",
      });
    }

    // Generate unique video ID
    const videoId = `video_${Date.now()}`;
    const numericId = Date.now();

    // Parse JSON fields
    const parsedGenres =
      typeof genres === "string" ? JSON.parse(genres) : genres || [];
    const parsedCasts =
      typeof casts === "string" ? JSON.parse(casts) : casts || [];

    // ===== CREATE VIDEO DOCUMENT IN DATABASE =====
    const video = await Video.create({
      _id: videoId,
      id: numericId,
      title,
      overview,
      tagline: tagline || "",
      video: videoUrl || "",
      trailer: trailerUrl || "",
      poster_path: posterUrl,
      backdrop_path: backdropUrl || posterUrl,
      cloudinaryPublicId: cloudinaryPublicId || "",
      cloudinaryFolder: "hustv/videos",
      runtime: parseInt(runtime) || 0,
      release_date: release_date || new Date().toISOString().split("T")[0],
      original_language: original_language || "en",
      adult: adult === "true" || adult === true,
      genres: parsedGenres,
      casts: parsedCasts,
      vote_average: parseFloat(vote_average) || 0,
      vote_count: parseInt(vote_count) || 0,
      status: "published",
      uploadedBy: userId,
      featured: false,
      trending: false,
    });

    console.log("✅ Video document created in database:", videoId);

    // Trigger Inngest video processing
    try {
      await inngest.send({
        name: "video/processing.started",
        data: { videoId: video._id },
      });
      console.log("✅ Inngest processing event triggered");
    } catch (inngestError) {
      console.error("⚠️ Inngest trigger failed:", inngestError);
    }

    res.status(201).json({
      success: true,
      message: "Video uploaded successfully and processing started",
      video,
    });
  } catch (error) {
    console.error("❌ Video upload error:", error);

    // Cleanup any uploaded temp files on error
    if (req.files) {
      Object.values(req.files).forEach((fileArray) => {
        fileArray.forEach((file) => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==================== READ OPERATIONS ====================

/**
 * Get all videos with filters and pagination
 */
export const getAllVideos = async (req, res) => {
  try {
    const {
      search,
      genre,
      featured,
      trending,
      status,
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      order = "desc",
    } = req.query;

    // Build filter
    const filter = {};

    // Only show published videos to non-admin users
    if (status) {
      filter.status = status;
    } else {
      filter.status = "published";
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { overview: { $regex: search, $options: "i" } },
        { tagline: { $regex: search, $options: "i" } },
      ];
    }

    if (genre) {
      filter["genres.name"] = genre;
    }

    if (featured === "true") {
      filter.featured = true;
    }

    if (trending === "true") {
      filter.trending = true;
    }

    // Build sort
    const sort = {};
    sort[sortBy] = order === "desc" ? -1 : 1;

    const videos = await Video.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Video.countDocuments(filter);

    res.json({
      success: true,
      videos,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error fetching videos:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get single video by ID
 */
export const getVideoById = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.auth || {};

    const video = await Video.findById(id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }

    // Check if video is published or user is admin
    if (video.status !== "published") {
      if (!userId) {
        return res.status(403).json({
          success: false,
          message: "Video not available",
        });
      }

      const clerkUser = await clerkClient.users.getUser(userId);
      const isAdmin = clerkUser.privateMetadata?.role === "admin";

      if (!isAdmin && video.uploadedBy !== userId) {
        return res.status(403).json({
          success: false,
          message: "Video not available",
        });
      }
    }

    res.json({ success: true, video });
  } catch (error) {
    console.error("Error fetching video:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get featured videos
 */
export const getFeaturedVideos = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const videos = await Video.find({
      status: "published",
      featured: true,
    })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({ success: true, videos });
  } catch (error) {
    console.error("Error fetching featured videos:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get trending videos
 */
export const getTrendingVideos = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const videos = await Video.find({
      status: "published",
      trending: true,
    })
      .sort({ view: -1 })
      .limit(parseInt(limit));

    res.json({ success: true, videos });
  } catch (error) {
    console.error("Error fetching trending videos:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get videos by genre
 */
export const getVideosByGenre = async (req, res) => {
  try {
    const { genreId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const videos = await Video.find({
      status: "published",
      "genres.id": parseInt(genreId),
    })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Video.countDocuments({
      status: "published",
      "genres.id": parseInt(genreId),
    });

    res.json({
      success: true,
      videos,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error fetching videos by genre:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Search videos
 */
export const searchVideos = async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const videos = await Video.find({
      status: "published",
      $or: [
        { title: { $regex: q, $options: "i" } },
        { overview: { $regex: q, $options: "i" } },
        { tagline: { $regex: q, $options: "i" } },
      ],
    })
      .sort({ view: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Video.countDocuments({
      status: "published",
      $or: [
        { title: { $regex: q, $options: "i" } },
        { overview: { $regex: q, $options: "i" } },
        { tagline: { $regex: q, $options: "i" } },
      ],
    });

    res.json({
      success: true,
      videos,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error searching videos:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==================== STREAMING ====================

/**
 * Get full movie streaming URL (requires subscription)
 */
export const streamVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.auth;

    const video = await Video.findById(id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }

    if (video.status !== "published") {
      return res.status(403).json({
        success: false,
        message: "Video not available for streaming",
      });
    }

    // Generate streaming URL if it's a Cloudinary public ID
    let streamUrl = video.video;
    if (video.cloudinaryPublicId && !video.video.startsWith("http")) {
      streamUrl = getStreamingUrl(video.cloudinaryPublicId);
    }

    // Return streaming URL
    res.json({
      success: true,
      streamUrl,
      video: {
        _id: video._id,
        title: video.title,
        runtime: video.runtime,
        poster_path: video.poster_path,
      },
    });
  } catch (error) {
    console.error("Error streaming video:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get trailer URL (public - no subscription required)
 */
export const getTrailerUrl = async (req, res) => {
  try {
    const { id } = req.params;

    const video = await Video.findById(id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }

    if (!video.trailer) {
      return res.status(404).json({
        success: false,
        message: "Trailer not available for this video",
      });
    }

    // If trailer is already a URL, return it directly
    let trailerUrl = video.trailer;

    // If it's a Cloudinary public ID, generate streaming URL
    if (!trailerUrl.startsWith("http")) {
      try {
        trailerUrl = getStreamingUrl(trailerUrl);
      } catch (error) {
        console.error("Error generating trailer URL:", error);
      }
    }

    res.json({
      success: true,
      trailerUrl,
      video: {
        _id: video._id,
        title: video.title,
        poster_path: video.poster_path,
      },
    });
  } catch (error) {
    console.error("Error fetching trailer URL:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get trailer URL",
      error: error.message,
    });
  }
};

// ==================== UPDATE & DELETE ====================

/**
 * 🆕 MODIFIED: Update video - SUPPORTS BOTH:
 * 1. Client-side uploaded URLs (video_url, poster_path, etc.) ⭐ NEW
 * 2. Server-side file upload (req.files) - LEGACY
 */
export const updateVideo = async (req, res) => {
  try {
    const { userId } = req.auth;
    const { id } = req.params;
    const updateData = { ...req.body };

    // Find video
    const video = await Video.findById(id);
    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }

    // Check permission (only uploader or admin can update)
    const clerkUser = await clerkClient.users.getUser(userId);
    const isAdmin = clerkUser.privateMetadata?.role === "admin";

    if (video.uploadedBy !== userId && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this video",
      });
    }

    // 🆕 CLIENT-SIDE UPLOAD: Use URLs from body
    if (updateData.video_url) {
      updateData.video = updateData.video_url;
      delete updateData.video_url;
      console.log("✅ Using client-uploaded video URL");
    }
    if (updateData.trailer_url) {
      updateData.trailer = updateData.trailer_url;
      delete updateData.trailer_url;
      console.log("✅ Using client-uploaded trailer URL");
    }
    if (updateData.cloudinary_public_id) {
      updateData.cloudinaryPublicId = updateData.cloudinary_public_id;
      delete updateData.cloudinary_public_id;
    }
    // poster_path and backdrop_path can be used directly

    // LEGACY: Upload new files if provided
    if (req.files?.video) {
      console.log("📹 Uploading new video...");
      const videoResult = await uploadToCloudinary(
        req.files.video[0].path,
        "hustv/videos"
      );
      updateData.video = videoResult.playbackUrl || videoResult.url;
      updateData.cloudinaryPublicId = videoResult.publicId;

      // Delete old video from Cloudinary
      if (video.cloudinaryPublicId) {
        await deleteFromCloudinary(video.cloudinaryPublicId);
      }
    }

    if (req.files?.trailer) {
      console.log("🎬 Uploading new trailer...");
      const trailerResult = await uploadToCloudinary(
        req.files.trailer[0].path,
        "hustv/trailers"
      );
      updateData.trailer = trailerResult.playbackUrl || trailerResult.url;
    }

    if (req.files?.poster) {
      console.log("🖼️ Uploading new poster...");
      const posterResult = await uploadImage(
        req.files.poster[0].path,
        "hustv/posters"
      );
      updateData.poster_path = posterResult.url;
    }

    if (req.files?.backdrop) {
      console.log("🖼️ Uploading new backdrop...");
      const backdropResult = await uploadImage(
        req.files.backdrop[0].path,
        "hustv/backdrops"
      );
      updateData.backdrop_path = backdropResult.url;
    }

    // Parse JSON fields if they exist
    if (updateData.genres && typeof updateData.genres === "string") {
      updateData.genres = JSON.parse(updateData.genres);
    }
    if (updateData.casts && typeof updateData.casts === "string") {
      updateData.casts = JSON.parse(updateData.casts);
    }

    // Parse boolean fields
    if (updateData.adult !== undefined) {
      updateData.adult =
        updateData.adult === "true" || updateData.adult === true;
    }

    // Update video
    const updatedVideo = await Video.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      message: "Video updated successfully",
      video: updatedVideo,
    });
  } catch (error) {
    console.error("Error updating video:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Delete video
 */
export const deleteVideo = async (req, res) => {
  try {
    const { userId } = req.auth;
    const { id } = req.params;

    // Find video
    const video = await Video.findById(id);
    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }

    // Check permission
    const clerkUser = await clerkClient.users.getUser(userId);
    const isAdmin = clerkUser.privateMetadata?.role === "admin";

    if (video.uploadedBy !== userId && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this video",
      });
    }

    // Delete from Cloudinary
    if (video.cloudinaryPublicId) {
      await deleteFromCloudinary(video.cloudinaryPublicId);
      console.log("✅ Video deleted from Cloudinary");
    }

    // Delete from database
    await Video.findByIdAndDelete(id);

    // Delete watch history
    await WatchHistory.deleteMany({ video: id });

    // Remove from user favorites
    await User.updateMany({ favorites: id }, { $pull: { favorites: id } });

    res.json({
      success: true,
      message: "Video deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting video:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==================== ADMIN ACTIONS ====================

/**
 * Increment view count
 */
export const incrementView = async (req, res) => {
  try {
    const { id } = req.params;

    const video = await Video.findByIdAndUpdate(
      id,
      { $inc: { view: 1 } },
      { new: true }
    );

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }

    res.json({
      success: true,
      message: "View count updated",
      views: video.view,
    });
  } catch (error) {
    console.error("Error incrementing view:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Toggle featured status (admin only)
 */
export const toggleFeatured = async (req, res) => {
  try {
    const { id } = req.params;

    const video = await Video.findById(id);
    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }

    video.featured = !video.featured;
    await video.save();

    res.json({
      success: true,
      message: `Video ${video.featured ? "featured" : "unfeatured"}`,
      featured: video.featured,
    });
  } catch (error) {
    console.error("Error toggling featured:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Toggle trending status (admin only)
 */
export const toggleTrending = async (req, res) => {
  try {
    const { id } = req.params;

    const video = await Video.findById(id);
    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }

    video.trending = !video.trending;
    await video.save();

    res.json({
      success: true,
      message: `Video ${
        video.trending ? "marked as trending" : "unmarked as trending"
      }`,
      trending: video.trending,
    });
  } catch (error) {
    console.error("Error toggling trending:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
