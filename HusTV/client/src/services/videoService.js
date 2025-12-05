// client/src/services/videoService.js
import api from "../lib/axios";

export const videoService = {
  // ==================== 🆕 CLOUDINARY UPLOAD ====================

  /**
   * Get Cloudinary upload signature from backend
   */
  getCloudinarySignature: async (folder = "hustv") => {
    return api.post("/videos/cloudinary/signature", { folder });
  },

  /**
   * Upload file directly to Cloudinary (bypasses server size limit)
   * @param {File} file - File to upload
   * @param {Object} options - Upload options
   * @param {Function} onProgress - Progress callback (0-100)
   * @returns {Object} - { url, publicId, duration, width, height }
   */
  uploadToCloudinary: async (file, options = {}, onProgress = null) => {
    const {
      folder = "hustv",
      resourceType = "auto", // 'video', 'image', 'auto'
    } = options;

    try {
      // 1. Get upload signature from backend
      console.log("📝 Getting Cloudinary signature...");
      const signatureResponse = await videoService.getCloudinarySignature(
        folder
      );
      const { signature, timestamp, cloudName, apiKey } =
        signatureResponse.data;

      if (!signature || !timestamp || !cloudName || !apiKey) {
        throw new Error("Invalid signature response from server");
      }

      // 2. Prepare FormData for Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append("signature", signature);
      formData.append("timestamp", timestamp);
      formData.append("api_key", apiKey);
      formData.append("folder", folder);

      // 3. Upload directly to Cloudinary with progress tracking
      console.log(`📤 Uploading ${file.name} to Cloudinary...`);

      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        // Track upload progress
        if (onProgress) {
          xhr.upload.addEventListener("progress", (e) => {
            if (e.lengthComputable) {
              const percentComplete = Math.round((e.loaded / e.total) * 100);
              onProgress(percentComplete);
            }
          });
        }

        // Handle completion
        xhr.addEventListener("load", () => {
          if (xhr.status === 200) {
            try {
              const response = JSON.parse(xhr.responseText);
              console.log("✅ Upload successful:", response.secure_url);

              resolve({
                url: response.secure_url,
                publicId: response.public_id,
                resourceType: response.resource_type,
                format: response.format,
                duration: response.duration, // For videos
                width: response.width,
                height: response.height,
              });
            } catch (parseError) {
              reject(new Error("Failed to parse Cloudinary response"));
            }
          } else {
            reject(new Error(`Upload failed: ${xhr.statusText}`));
          }
        });

        // Handle errors
        xhr.addEventListener("error", () => {
          reject(new Error("Network error during upload"));
        });

        xhr.addEventListener("abort", () => {
          reject(new Error("Upload aborted"));
        });

        // Send request to Cloudinary
        xhr.open(
          "POST",
          `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`
        );
        xhr.send(formData);
      });
    } catch (error) {
      console.error("❌ Cloudinary upload error:", error);
      throw error;
    }
  },

  /**
   * 🆕 Upload multiple files to Cloudinary
   * @param {Object} files - { video: File, trailer: File, poster: File, backdrop: File }
   * @param {Function} onProgress - Progress callback with file type
   * @returns {Object} - { video_url, trailer_url, poster_path, backdrop_path, ... }
   */
  uploadMultipleToCloudinary: async (files, onProgress = null) => {
    const results = {};

    try {
      // Upload video
      if (files.video) {
        console.log("📹 Uploading video...");
        const videoResult = await videoService.uploadToCloudinary(
          files.video,
          { folder: "hustv/videos", resourceType: "video" },
          (percent) => onProgress && onProgress("video", percent)
        );
        results.video_url = videoResult.url;
        results.cloudinary_public_id = videoResult.publicId;
        results.duration = videoResult.duration;
      }

      // Upload trailer
      if (files.trailer) {
        console.log("🎬 Uploading trailer...");
        const trailerResult = await videoService.uploadToCloudinary(
          files.trailer,
          { folder: "hustv/trailers", resourceType: "video" },
          (percent) => onProgress && onProgress("trailer", percent)
        );
        results.trailer_url = trailerResult.url;
      }

      // Upload poster
      if (files.poster) {
        console.log("🖼️ Uploading poster...");
        const posterResult = await videoService.uploadToCloudinary(
          files.poster,
          { folder: "hustv/posters", resourceType: "image" },
          (percent) => onProgress && onProgress("poster", percent)
        );
        results.poster_path = posterResult.url;
      }

      // Upload backdrop
      if (files.backdrop) {
        console.log("🖼️ Uploading backdrop...");
        const backdropResult = await videoService.uploadToCloudinary(
          files.backdrop,
          { folder: "hustv/backdrops", resourceType: "image" },
          (percent) => onProgress && onProgress("backdrop", percent)
        );
        results.backdrop_path = backdropResult.url;
      }

      console.log("✅ All files uploaded successfully");
      return results;
    } catch (error) {
      console.error("❌ Multi-upload failed:", error);
      throw error;
    }
  },

  // ==================== PUBLIC ENDPOINTS ====================

  // Get all videos with pagination and filters
  getAllVideos: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/videos${queryString ? `?${queryString}` : ""}`);
  },

  // Get single video by ID
  getVideoById: async (id) => {
    return api.get(`/videos/${id}`);
  },

  // Get featured videos (for homepage)
  getFeaturedVideos: async (limit = 6) => {
    return api.get(`/videos/featured?limit=${limit}`);
  },

  // Get trending videos
  getTrendingVideos: async (limit = 10) => {
    return api.get(`/videos/trending?limit=${limit}`);
  },

  // Search videos with filters
  searchVideos: async (query, filters = {}) => {
    return api.get("/videos/search", {
      params: { q: query, ...filters },
    });
  },

  // Get videos by genre
  getVideosByGenre: async (genreId, page = 1, limit = 20) => {
    return api.get(`/videos/genre/${genreId}`, {
      params: { page, limit },
    });
  },

  // Get streaming URL (protected - requires active subscription)
  getStreamingUrl: async (videoId) => {
    return api.get(`/videos/${videoId}/stream`);
  },

  // Get trailer URL (public - no subscription required)
  getTrailerUrl: async (videoId) => {
    return api.get(`/videos/${videoId}/trailer`);
  },

  // Increment view count
  incrementView: async (videoId) => {
    return api.post(`/videos/${videoId}/view`);
  },

  // ==================== ADMIN ENDPOINTS ====================

  /**
   * 🆕 MODIFIED: Create new video
   * Now supports BOTH:
   * 1. Client-side upload (URLs only) - Recommended for large files
   * 2. Server-side upload (FormData with files) - Legacy, 4MB limit
   */
  createVideo: async (videoData, onUploadProgress = null) => {
    try {
      // If videoData is plain object with URLs, send as JSON
      if (!(videoData instanceof FormData)) {
        return api.post("/videos", videoData);
      }

      // Legacy: FormData with files (server-side upload)
      return api.post("/videos", videoData, {
        onUploadProgress: (progressEvent) => {
          if (onUploadProgress) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onUploadProgress(percentCompleted);
          }
        },
        timeout: 300000, // 5 minutes
      });
    } catch (error) {
      console.error("Error creating video:", error);
      throw error;
    }
  },

  /**
   * 🆕 MODIFIED: Update existing video
   * Now supports BOTH:
   * 1. Client-side upload (URLs only) - Recommended
   * 2. Server-side upload (FormData with files) - Legacy
   */
  updateVideo: async (id, videoData, onUploadProgress = null) => {
    try {
      // If videoData is plain object with URLs, send as JSON
      if (!(videoData instanceof FormData)) {
        return api.put(`/videos/${id}`, videoData);
      }

      // Legacy: FormData with files (server-side upload)
      return api.put(`/videos/${id}`, videoData, {
        onUploadProgress: (progressEvent) => {
          if (onUploadProgress) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onUploadProgress(percentCompleted);
          }
        },
        timeout: 300000,
      });
    } catch (error) {
      console.error("Error updating video:", error);
      throw error;
    }
  },

  // Delete video (admin only)
  deleteVideo: async (id) => {
    return api.delete(`/videos/${id}`);
  },

  // Toggle featured status (admin only)
  toggleFeatured: async (id) => {
    return api.patch(`/videos/${id}/featured`);
  },

  // Toggle trending status (admin only)
  toggleTrending: async (id) => {
    return api.patch(`/videos/${id}/trending`);
  },

  // Batch operations (admin only)
  batchDelete: async (videoIds) => {
    return api.post("/videos/batch/delete", { videoIds });
  },

  batchUpdateStatus: async (videoIds, status) => {
    return api.post("/videos/batch/status", { videoIds, status });
  },

  // Get video statistics (admin only)
  getVideoStats: async (id) => {
    return api.get(`/videos/${id}/stats`);
  },
};

export default videoService;
