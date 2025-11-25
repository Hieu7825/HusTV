// controllers/userController.js
import User from "../models/User.js";
import Video from "../models/Video.js";
import WatchHistory from "../models/WatchHistory.js";
import { clerkClient } from "@clerk/express";

// API to get user profile with subscription info
export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.auth;

    const user = await User.findById(userId).populate({
      path: "currentSubscription",
      populate: { path: "plan" },
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// API to toggle favorite video
export const toggleFavorite = async (req, res) => {
  try {
    const { userId } = req.auth;
    const { videoId } = req.body;

    // Check if video exists
    const video = await Video.findById(videoId);
    if (!video) {
      return res
        .status(404)
        .json({ success: false, message: "Video not found" });
    }

    const user = await User.findById(userId);

    // Check if already in favorites
    const isFavorite = user.favorites.includes(videoId);

    if (isFavorite) {
      // Remove from favorites
      user.favorites = user.favorites.filter((id) => id.toString() !== videoId);
      await user.save();

      res.json({
        success: true,
        message: "Removed from favorites",
        isFavorite: false,
      });
    } else {
      // Add to favorites
      user.favorites.push(videoId);
      await user.save();

      res.json({
        success: true,
        message: "Added to favorites",
        isFavorite: true,
      });
    }
  } catch (error) {
    console.error("Error toggling favorite:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// API to get user favorites
export const getFavorites = async (req, res) => {
  try {
    const { userId } = req.auth;

    const user = await User.findById(userId).populate("favorites");

    res.json({ success: true, favorites: user.favorites || [] });
  } catch (error) {
    console.error("Error fetching favorites:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// API to check if video is favorited
export const checkFavorite = async (req, res) => {
  try {
    const { userId } = req.auth;
    const { videoId } = req.params;

    const user = await User.findById(userId);
    const isFavorite = user.favorites.includes(videoId);

    res.json({ success: true, isFavorite });
  } catch (error) {
    console.error("Error checking favorite:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// API to get watch history
export const getWatchHistory = async (req, res) => {
  try {
    const { userId } = req.auth;
    const { page = 1, limit = 20 } = req.query;

    const history = await WatchHistory.find({ user: userId })
      .populate("video")
      .sort({ lastWatchedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await WatchHistory.countDocuments({ user: userId });

    res.json({
      success: true,
      history,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching watch history:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// API to update watch progress
export const updateWatchProgress = async (req, res) => {
  try {
    const { userId } = req.auth;
    const { videoId } = req.params;
    const { watchedDuration, totalDuration } = req.body;

    // Calculate progress percentage
    const progress = Math.floor((watchedDuration / totalDuration) * 100);
    const completed = progress >= 90; // Consider completed if watched 90%

    // Find or create watch history
    let watchHistory = await WatchHistory.findOne({
      user: userId,
      video: videoId,
    });

    if (watchHistory) {
      // Update existing
      watchHistory.watchedDuration = watchedDuration;
      watchHistory.totalDuration = totalDuration;
      watchHistory.progress = progress;
      watchHistory.completed = completed;
      watchHistory.lastWatchedAt = new Date();
      await watchHistory.save();
    } else {
      // Create new
      watchHistory = await WatchHistory.create({
        user: userId,
        video: videoId,
        watchedDuration,
        totalDuration,
        progress,
        completed,
        lastWatchedAt: new Date(),
      });
    }

    // Update user stats
    const user = await User.findById(userId);
    if (completed && !watchHistory.completed) {
      // Only increment if newly completed
      user.stats.totalVideosWatched += 1;
    }
    user.stats.totalWatchTime += Math.floor(watchedDuration / 60); // Convert to minutes
    user.stats.lastActive = new Date();
    await user.save();

    res.json({
      success: true,
      message: "Watch progress updated",
      watchHistory,
    });
  } catch (error) {
    console.error("Error updating watch progress:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// API to get watch progress for a video
export const getWatchProgress = async (req, res) => {
  try {
    const { userId } = req.auth;
    const { videoId } = req.params;

    const watchHistory = await WatchHistory.findOne({
      user: userId,
      video: videoId,
    });

    if (!watchHistory) {
      return res.json({
        success: true,
        progress: null,
        message: "No watch history found",
      });
    }

    res.json({
      success: true,
      progress: {
        watchedDuration: watchHistory.watchedDuration,
        totalDuration: watchHistory.totalDuration,
        progress: watchHistory.progress,
        completed: watchHistory.completed,
        lastWatchedAt: watchHistory.lastWatchedAt,
      },
    });
  } catch (error) {
    console.error("Error fetching watch progress:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// API to delete watch history item
export const deleteWatchHistory = async (req, res) => {
  try {
    const { userId } = req.auth;
    const { videoId } = req.params;

    await WatchHistory.findOneAndDelete({
      user: userId,
      video: videoId,
    });

    res.json({
      success: true,
      message: "Watch history deleted",
    });
  } catch (error) {
    console.error("Error deleting watch history:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// API to clear all watch history
export const clearWatchHistory = async (req, res) => {
  try {
    const { userId } = req.auth;

    await WatchHistory.deleteMany({ user: userId });

    res.json({
      success: true,
      message: "Watch history cleared",
    });
  } catch (error) {
    console.error("Error clearing watch history:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// API to update user preferences
export const updatePreferences = async (req, res) => {
  try {
    const { userId } = req.auth;
    const preferences = req.body;

    const user = await User.findById(userId);

    // Merge new preferences with existing
    user.preferences = {
      ...user.preferences,
      ...preferences,
    };

    await user.save();

    res.json({
      success: true,
      message: "Preferences updated",
      preferences: user.preferences,
    });
  } catch (error) {
    console.error("Error updating preferences:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// API to get user preferences
export const getPreferences = async (req, res) => {
  try {
    const { userId } = req.auth;

    const user = await User.findById(userId).select("preferences");

    res.json({
      success: true,
      preferences: user.preferences,
    });
  } catch (error) {
    console.error("Error fetching preferences:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// API to get connected devices
export const getDevices = async (req, res) => {
  try {
    const { userId } = req.auth;

    const user = await User.findById(userId).select("connectedDevices");

    res.json({
      success: true,
      devices: user.connectedDevices || [],
    });
  } catch (error) {
    console.error("Error fetching devices:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// API to add/update device
export const updateDevice = async (req, res) => {
  try {
    const { userId } = req.auth;
    const { deviceId, deviceName, deviceType } = req.body;

    if (!deviceId || !deviceName || !deviceType) {
      return res.status(400).json({
        success: false,
        message: "Missing required device information",
      });
    }

    const user = await User.findById(userId).populate("currentSubscription");

    // Check device limit
    const maxDevices = user.currentSubscription?.plan?.connectedDevices || 1;
    const existingDevice = user.connectedDevices.find(
      (d) => d.deviceId === deviceId
    );

    if (
      !existingDevice &&
      user.connectedDevices.length >= maxDevices &&
      maxDevices !== "Unlimited"
    ) {
      return res.status(403).json({
        success: false,
        message: `Device limit reached. Maximum ${maxDevices} devices allowed.`,
        maxDevices,
        currentDevices: user.connectedDevices.length,
      });
    }

    // Update or add device
    if (existingDevice) {
      existingDevice.deviceName = deviceName;
      existingDevice.deviceType = deviceType;
      existingDevice.lastUsed = new Date();
    } else {
      user.connectedDevices.push({
        deviceId,
        deviceName,
        deviceType,
        lastUsed: new Date(),
      });
    }

    await user.save();

    res.json({
      success: true,
      message: "Device updated successfully",
      devices: user.connectedDevices,
    });
  } catch (error) {
    console.error("Error updating device:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// API to remove device
export const removeDevice = async (req, res) => {
  try {
    const { userId } = req.auth;
    const { deviceId } = req.body;

    if (!deviceId) {
      return res.status(400).json({
        success: false,
        message: "Device ID is required",
      });
    }

    const user = await User.findById(userId);

    // Remove device
    user.connectedDevices = user.connectedDevices.filter(
      (d) => d.deviceId !== deviceId
    );

    await user.save();

    res.json({
      success: true,
      message: "Device removed successfully",
      devices: user.connectedDevices,
    });
  } catch (error) {
    console.error("Error removing device:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// API to get user stats
export const getUserStats = async (req, res) => {
  try {
    const { userId } = req.auth;

    const user = await User.findById(userId).select("stats favorites");

    // Get additional stats
    const totalFavorites = user.favorites?.length || 0;
    const completedVideos = await WatchHistory.countDocuments({
      user: userId,
      completed: true,
    });

    res.json({
      success: true,
      stats: {
        ...user.stats.toObject(),
        totalFavorites,
        completedVideos,
      },
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// API to get continue watching (videos in progress)
export const getContinueWatching = async (req, res) => {
  try {
    const { userId } = req.auth;

    const inProgress = await WatchHistory.find({
      user: userId,
      completed: false,
      progress: { $gt: 5, $lt: 90 }, // Between 5% and 90%
    })
      .populate("video")
      .sort({ lastWatchedAt: -1 })
      .limit(10);

    res.json({
      success: true,
      videos: inProgress,
    });
  } catch (error) {
    console.error("Error fetching continue watching:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// API to get recommended videos (basic - based on watch history)
export const getRecommendedVideos = async (req, res) => {
  try {
    const { userId } = req.auth;

    // Get user's watch history
    const watchHistory = await WatchHistory.find({ user: userId })
      .populate("video")
      .limit(20);

    if (watchHistory.length === 0) {
      // If no history, return trending videos
      const trending = await Video.find({
        status: "published",
        trending: true,
      })
        .sort({ view: -1 })
        .limit(10);

      return res.json({
        success: true,
        videos: trending,
        message: "Showing trending videos",
      });
    }

    // Extract genres from watched videos
    const genreCounts = {};
    watchHistory.forEach((item) => {
      if (item.video && item.video.genres) {
        item.video.genres.forEach((genre) => {
          genreCounts[genre.name] = (genreCounts[genre.name] || 0) + 1;
        });
      }
    });

    // Get top 3 genres
    const topGenres = Object.entries(genreCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map((entry) => entry[0]);

    // Get watched video IDs to exclude
    const watchedIds = watchHistory.map((item) => item.video._id);

    // Find videos with similar genres
    const recommended = await Video.find({
      status: "published",
      _id: { $nin: watchedIds },
      "genres.name": { $in: topGenres },
    })
      .sort({ view: -1, createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      videos: recommended,
      basedOn: topGenres,
    });
  } catch (error) {
    console.error("Error fetching recommended videos:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
