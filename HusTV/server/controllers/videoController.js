// controllers/videoController.js
import Video from "../models/Video.js";
import User from "../models/User.js";
import WatchHistory from "../models/WatchHistory.js";
import {
  uploadVideo as uploadToCloudinary,
  deleteVideo as deleteFromCloudinary,
} from "../utils/index.js";
import { inngest } from "../inngest/index.js";
import { clerkClient } from "@clerk/express";

// API to upload video
export const uploadVideo = async (req, res) => {
  try {
    const { userId } = req.auth;
    const {
      title,
      overview,
      tagline,
      trailer,
      poster_path,
      backdrop_path,
      runtime,
      release_date,
      original_language,
      genres,
      casts,
    } = req.body;

    // Check if video file exists
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No video file provided",
      });
    }

    console.log("📤 Uploading video to Cloudinary...");

    // Upload to Cloudinary using utility function
    const uploadResult = await uploadToCloudinary(
      req.file.path,
      "hustv/videos"
    );

    console.log("✅ Video uploaded:", uploadResult.url);

    // Generate unique video ID
    const videoId = `video_${Date.now()}`;

    // Create video document
    const video = await Video.create({
      _id: videoId,
      title,
      overview,
      tagline,
      video: uploadResult.playbackUrl || uploadResult.url,
      trailer,
      poster_path,
      backdrop_path,
      cloudinaryPublicId: uploadResult.publicId,
      cloudinaryFolder: "hustv/videos",
      runtime: parseInt(runtime) || 0,
      release_date,
      original_language,
      genres: typeof genres === "string" ? JSON.parse(genres) : genres || [],
      casts: typeof casts === "string" ? JSON.parse(casts) : casts || [],
      status: "processing",
      uploadedBy: userId,
    });

    // Trigger Inngest video processing
    await inngest.send({
      name: "video/processing.started",
      data: { videoId: video._id },
    });

    res.json({
      success: true,
      message: "Video uploaded successfully and processing started",
      video,
    });
  } catch (error) {
    console.error("❌ Video upload error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// API to get all videos (public - with filters)
export const getAllVideos = async (req, res) => {
  try {
    const {
      search,
      genre,
      featured,
      trending,
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      order = "desc",
    } = req.query;

    // Build filter
    const filter = { status: "published" };

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

// API to get single video by ID
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

// API to stream video (protected)
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

    // Return streaming URL
    res.json({
      success: true,
      streamUrl: video.video,
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

// API to update video
export const updateVideo = async (req, res) => {
  try {
    const { userId } = req.auth;
    const { id } = req.params;
    const updateData = req.body;

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

    // Parse JSON fields if they exist
    if (updateData.genres && typeof updateData.genres === "string") {
      updateData.genres = JSON.parse(updateData.genres);
    }
    if (updateData.casts && typeof updateData.casts === "string") {
      updateData.casts = JSON.parse(updateData.casts);
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

// API to delete video
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

    // Delete from Cloudinary using utility function
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

// API to increment view count
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

// API to get featured videos
export const getFeaturedVideos = async (req, res) => {
  try {
    const videos = await Video.find({
      status: "published",
      featured: true,
    })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({ success: true, videos });
  } catch (error) {
    console.error("Error fetching featured videos:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// API to get trending videos
export const getTrendingVideos = async (req, res) => {
  try {
    const videos = await Video.find({
      status: "published",
      trending: true,
    })
      .sort({ view: -1 })
      .limit(10);

    res.json({ success: true, videos });
  } catch (error) {
    console.error("Error fetching trending videos:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// API to get videos by genre
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

// API to search videos
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

// API to toggle featured status (admin only)
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

// API to toggle trending status (admin only)
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
