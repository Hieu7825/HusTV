// inngest/functions/videoProcessing.js
import { inngest } from "../index.js";
import Video from "../../models/Video.js";
import { generateThumbnail } from "../../utils/index.js";

/**
 * Process video after upload
 */
export const processVideoAfterUpload = inngest.createFunction(
  { id: "process-video-after-upload" },
  { event: "video/processing.started" },
  async ({ event, step }) => {
    const { videoId } = event.data;

    await step.sleep("wait-for-cloudinary", "30s"); // Wait for Cloudinary processing

    await step.run("generate-thumbnail", async () => {
      try {
        const video = await Video.findById(videoId);

        if (!video) {
          console.log("⚠️ Video not found:", videoId);
          return { success: false, message: "Video not found" };
        }

        // Generate thumbnail from Cloudinary
        if (video.cloudinaryPublicId && !video.poster_path) {
          const thumbnailUrl = generateThumbnail(video.cloudinaryPublicId);
          video.poster_path = thumbnailUrl;
          console.log("✅ Generated thumbnail:", thumbnailUrl);
        }

        // Mark video as published
        video.status = "published";
        await video.save();

        console.log("✅ Video processing completed:", videoId);
        return { success: true, video };
      } catch (error) {
        console.error("❌ Error processing video:", error);

        // Mark video as failed
        await Video.findByIdAndUpdate(videoId, { status: "draft" });
        throw error;
      }
    });

    await step.run("notify-admin", async () => {
      try {
        const video = await Video.findById(videoId);
        console.log(`📧 Video "${video.title}" is now published`);

        // Optional: Send notification to admin
        // await sendEmail({...})

        return { success: true };
      } catch (error) {
        console.error("⚠️ Error notifying admin:", error);
        return { success: false, error: error.message };
      }
    });
  }
);

/**
 * Process video uploaded event (notify subscribers)
 */
export const notifyVideoUploaded = inngest.createFunction(
  { id: "notify-video-uploaded" },
  { event: "video/uploaded" },
  async ({ event, step }) => {
    const { videoId, videoTitle, featured } = event.data;

    await step.run("send-notifications", async () => {
      try {
        // Only notify for featured videos
        if (!featured) {
          console.log("Video not featured, skipping notifications");
          return { success: true, message: "Not featured" };
        }

        // Trigger new content notification
        await inngest.send({
          name: "content/new-release",
          data: { videoId, videoTitle },
        });

        console.log("✅ Triggered new content notification");
        return { success: true };
      } catch (error) {
        console.error("❌ Error triggering notification:", error);
        throw error;
      }
    });
  }
);

/**
 * Update video statistics (daily aggregation)
 */
export const updateVideoStatistics = inngest.createFunction(
  { id: "update-video-statistics" },
  { cron: "0 3 * * *" }, // Run daily at 3 AM
  async ({ step }) => {
    await step.run("calculate-trending-videos", async () => {
      try {
        const WatchHistory = (await import("../../models/WatchHistory.js"))
          .default;

        // Get videos watched in last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const trendingVideos = await WatchHistory.aggregate([
          {
            $match: {
              lastWatchedAt: { $gte: sevenDaysAgo },
            },
          },
          {
            $group: {
              _id: "$video",
              watchCount: { $sum: 1 },
              uniqueUsers: { $addToSet: "$user" },
            },
          },
          {
            $project: {
              _id: 1,
              watchCount: 1,
              uniqueUserCount: { $size: "$uniqueUsers" },
              trendingScore: {
                $add: [
                  "$watchCount",
                  { $multiply: [{ $size: "$uniqueUsers" }, 2] },
                ],
              },
            },
          },
          {
            $sort: { trendingScore: -1 },
          },
          {
            $limit: 20,
          },
        ]);

        console.log(`📊 Found ${trendingVideos.length} trending videos`);

        // Reset all trending flags
        await Video.updateMany({}, { trending: false });

        // Set trending flag for top videos
        const trendingVideoIds = trendingVideos.map((v) => v._id);
        await Video.updateMany(
          { _id: { $in: trendingVideoIds } },
          { trending: true }
        );

        console.log("✅ Updated trending videos");
        return { success: true, trendingCount: trendingVideoIds.length };
      } catch (error) {
        console.error("❌ Error updating video statistics:", error);
        throw error;
      }
    });

    await step.run("update-view-counts", async () => {
      try {
        // Update view counts from watch history
        const videos = await Video.find({ status: "published" });
        const WatchHistory = (await import("../../models/WatchHistory.js"))
          .default;

        for (const video of videos) {
          const viewCount = await WatchHistory.countDocuments({
            video: video._id,
          });

          if (video.view !== viewCount) {
            video.view = viewCount;
            await video.save();
          }
        }

        console.log("✅ Updated view counts for all videos");
        return { success: true };
      } catch (error) {
        console.error("⚠️ Error updating view counts:", error);
        return { success: false, error: error.message };
      }
    });
  }
);

/**
 * Clean up draft videos older than 7 days
 */
export const cleanupDraftVideos = inngest.createFunction(
  { id: "cleanup-draft-videos" },
  { cron: "0 4 * * 0" }, // Run every Sunday at 4 AM
  async ({ step }) => {
    await step.run("delete-old-drafts", async () => {
      try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // Find old draft videos
        const oldDrafts = await Video.find({
          status: "draft",
          createdAt: { $lt: sevenDaysAgo },
        });

        console.log(`🗑️ Found ${oldDrafts.length} old draft videos`);

        // Delete from Cloudinary and database
        const { deleteVideo } = await import("../../utils/index.js");

        for (const video of oldDrafts) {
          try {
            if (video.cloudinaryPublicId) {
              await deleteVideo(video.cloudinaryPublicId);
            }
            await Video.findByIdAndDelete(video._id);
            console.log(`✅ Deleted draft video: ${video.title}`);
          } catch (error) {
            console.error(`⚠️ Error deleting video ${video._id}:`, error);
          }
        }

        return { success: true, deletedCount: oldDrafts.length };
      } catch (error) {
        console.error("❌ Error cleaning up draft videos:", error);
        throw error;
      }
    });
  }
);
