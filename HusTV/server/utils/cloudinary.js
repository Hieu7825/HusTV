// server/utils/cloudinary.js
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configure Cloudinary từ environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log("☁️ Cloudinary configured:", {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? "✅" : "❌",
  api_key: process.env.CLOUDINARY_API_KEY ? "✅" : "❌",
  api_secret: process.env.CLOUDINARY_API_SECRET ? "✅" : "❌",
});

// ==================== 🆕 NEW: SIGNATURE GENERATION FOR CLIENT UPLOAD ====================
/**
 * ⭐ Generate signature for client-side uploads
 * This allows frontend to upload directly to Cloudinary (bypass server size limit)
 */
export const generateUploadSignature = (params = {}) => {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);

    // Parameters to sign
    const paramsToSign = {
      timestamp,
      folder: params.folder || "hustv",
      ...params, // Allow custom params (public_id, etc.)
    };

    // Remove undefined values
    Object.keys(paramsToSign).forEach((key) => {
      if (paramsToSign[key] === undefined) {
        delete paramsToSign[key];
      }
    });

    // Generate signature
    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET
    );

    console.log(
      "✅ Upload signature generated for folder:",
      paramsToSign.folder
    );

    return {
      signature,
      timestamp,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      folder: paramsToSign.folder,
    };
  } catch (error) {
    console.error("❌ Signature generation error:", error);
    throw error;
  }
};

// ==================== LEGACY: SERVER-SIDE UPLOAD ====================
/**
 * Upload video to Cloudinary from file path
 */
export const uploadVideo = async (filePath, folder = "hustv/videos") => {
  try {
    console.log("📹 Uploading video to Cloudinary:", filePath);

    // ✅ Check file size
    const stats = fs.statSync(filePath);
    const fileSizeMB = stats.size / (1024 * 1024);
    console.log(`📦 Video size: ${fileSizeMB.toFixed(2)}MB`);

    // ✅ Cloudinary Free Plan limit: 100MB
    const MAX_SIZE_MB = 100;
    if (fileSizeMB > MAX_SIZE_MB) {
      console.error(
        `❌ File too large: ${fileSizeMB.toFixed(2)}MB (max: ${MAX_SIZE_MB}MB)`
      );

      // Cleanup temp file
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      throw new Error(
        `Video file too large (${fileSizeMB.toFixed(
          2
        )}MB). Maximum size is ${MAX_SIZE_MB}MB. Please compress your video or upgrade Cloudinary plan.`
      );
    }

    // ✅ Upload with optimized settings
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: "video",
      folder: folder,
      chunk_size: 6000000, // 6MB chunks for large files
      timeout: 600000, // 10 minutes timeout (was 60 seconds - too short!)

      // ✅ Optimize video quality
      eager: [
        {
          quality: "auto:good", // Balanced quality
          format: "mp4",
        },
      ],
      eager_async: true, // Process transformations in background

      // ✅ Generate HLS streaming URL
      eager_notification_url: undefined, // Add webhook if needed
    });

    console.log("✅ Video uploaded:", result.secure_url);
    console.log(
      `📊 Video info: ${result.duration}s, ${result.format}, ${result.width}x${result.height}`
    );

    // Delete temp file after successful upload
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log("🗑️ Temp file deleted");
    }

    return {
      success: true,
      url: result.secure_url,
      playbackUrl: result.playback_url || result.secure_url, // HLS URL if available
      publicId: result.public_id,
      duration: result.duration,
      format: result.format,
      width: result.width,
      height: result.height,
    };
  } catch (error) {
    console.error("❌ Cloudinary video upload error:", {
      message: error.message,
      http_code: error.http_code,
      name: error.name,
    });

    // Cleanup temp file on error
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log("🗑️ Temp file deleted after error");
    }

    throw error;
  }
};

/**
 * Upload image to Cloudinary
 */
export const uploadImage = async (filePath, folder = "hustv/images") => {
  try {
    console.log("🖼️ Uploading image to Cloudinary:", filePath);

    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: "image",
      folder,
    });

    console.log("✅ Image uploaded:", result.secure_url);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error("❌ Cloudinary image upload error:", error);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    throw error;
  }
};

/**
 * Delete file from Cloudinary
 */
export const deleteVideo = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "video",
    });
    return { success: result.result === "ok" };
  } catch (error) {
    console.error("❌ Cloudinary delete error:", error);
    throw error;
  }
};

export const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return { success: result.result === "ok" };
  } catch (error) {
    console.error("❌ Cloudinary delete error:", error);
    throw error;
  }
};

/**
 * Get streaming URL
 */
export const getStreamingUrl = (publicId, quality = "auto") => {
  return cloudinary.url(publicId, {
    resource_type: "video",
    streaming_profile: "hd",
    format: "m3u8",
  });
};

/**
 * Generate video thumbnail from Cloudinary
 */
export const generateThumbnail = (publicId) => {
  return cloudinary.url(publicId, {
    resource_type: "video",
    transformation: [
      { width: 640, height: 360, crop: "fill" },
      { quality: "auto" },
      { fetch_format: "jpg" },
    ],
    start_offset: "5",
  });
};

// ==================== 🆕 EXPORT ====================
export default {
  generateUploadSignature, // 🆕 THÊM DÒNG NÀY
  uploadVideo,
  uploadImage,
  deleteVideo,
  deleteImage,
  getStreamingUrl,
  generateThumbnail,
};
