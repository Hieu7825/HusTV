// utils/cloudinary.js
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload video to Cloudinary
 * @param {string} filePath - Local file path
 * @param {string} folder - Cloudinary folder name
 * @returns {Promise<Object>} Upload result
 */
export const uploadVideo = async (filePath, folder = "hustv/videos") => {
  try {
    console.log("Starting video upload to Cloudinary...");

    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: "video",
      folder: folder,
      type: "upload",
      // Video optimization settings
      eager: [
        {
          streaming_profile: "hd",
          format: "m3u8", // HLS streaming format
        },
      ],
      eager_async: true, // Process in background
      // Notification URL for processing completion (optional)
      // notification_url: `${process.env.WEBSITE_URL}/api/webhooks/cloudinary`
    });

    console.log("Video uploaded successfully:", result.secure_url);

    // Delete temporary file after upload
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log("Temporary file deleted:", filePath);
    }

    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      duration: result.duration, // in seconds
      format: result.format,
      resourceType: result.resource_type,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
      playbackUrl: result.playback_url || result.secure_url,
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);

    // Clean up temp file on error
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    throw new Error(`Video upload failed: ${error.message}`);
  }
};

/**
 * Upload image (poster/backdrop) to Cloudinary
 * @param {string} filePath - Local file path
 * @param {string} folder - Cloudinary folder name
 * @returns {Promise<Object>} Upload result
 */
export const uploadImage = async (filePath, folder = "hustv/images") => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: "image",
      folder: folder,
      transformation: [
        { width: 1920, height: 1080, crop: "limit" }, // Max size
        { quality: "auto" },
        { fetch_format: "auto" },
      ],
    });

    // Delete temporary file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
    };
  } catch (error) {
    console.error("Image upload error:", error);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    throw new Error(`Image upload failed: ${error.message}`);
  }
};

/**
 * Delete video from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<Object>} Deletion result
 */
export const deleteVideo = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "video",
    });

    return {
      success: result.result === "ok",
      result: result.result,
    };
  } catch (error) {
    console.error("Video deletion error:", error);
    throw new Error(`Video deletion failed: ${error.message}`);
  }
};

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<Object>} Deletion result
 */
export const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
    });

    return {
      success: result.result === "ok",
      result: result.result,
    };
  } catch (error) {
    console.error("Image deletion error:", error);
    throw new Error(`Image deletion failed: ${error.message}`);
  }
};

/**
 * Generate video thumbnail from Cloudinary
 * @param {string} publicId - Video public ID
 * @returns {string} Thumbnail URL
 */
export const generateThumbnail = (publicId) => {
  return cloudinary.url(publicId, {
    resource_type: "video",
    transformation: [
      { width: 640, height: 360, crop: "fill" },
      { quality: "auto" },
      { fetch_format: "jpg" },
    ],
    // Get frame at 5 seconds
    start_offset: "5",
  });
};

/**
 * Get video streaming URL with quality options
 * @param {string} publicId - Video public ID
 * @param {string} quality - '720p' | '1080p' | '4k' | 'auto'
 * @returns {string} Streaming URL
 */
export const getStreamingUrl = (publicId, quality = "auto") => {
  const qualityMap = {
    "720p": { width: 1280, height: 720 },
    "1080p": { width: 1920, height: 1080 },
    "4k": { width: 3840, height: 2160 },
    auto: { quality: "auto" },
  };

  const transformation = qualityMap[quality] || qualityMap["auto"];

  return cloudinary.url(publicId, {
    resource_type: "video",
    streaming_profile: "hd",
    format: "m3u8", // HLS streaming
    transformation: [transformation],
  });
};

/**
 * Get video info from Cloudinary
 * @param {string} publicId - Video public ID
 * @returns {Promise<Object>} Video information
 */
export const getVideoInfo = async (publicId) => {
  try {
    const result = await cloudinary.api.resource(publicId, {
      resource_type: "video",
    });

    return {
      publicId: result.public_id,
      format: result.format,
      duration: result.duration,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
      url: result.secure_url,
      createdAt: result.created_at,
    };
  } catch (error) {
    console.error("Get video info error:", error);
    throw new Error(`Failed to get video info: ${error.message}`);
  }
};

/**
 * Delete entire folder from Cloudinary
 * @param {string} folderPath - Folder path
 * @returns {Promise<Object>} Deletion result
 */
export const deleteFolder = async (folderPath) => {
  try {
    const result = await cloudinary.api.delete_folder(folderPath);
    return {
      success: true,
      result,
    };
  } catch (error) {
    console.error("Folder deletion error:", error);
    throw new Error(`Folder deletion failed: ${error.message}`);
  }
};

export default {
  uploadVideo,
  uploadImage,
  deleteVideo,
  deleteImage,
  generateThumbnail,
  getStreamingUrl,
  getVideoInfo,
  deleteFolder,
};
