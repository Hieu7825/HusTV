// server/middleware/uploadVideo.js
import multer from "multer";
import path from "path";
import fs from "fs";

// ==================== FILE TYPE CONFIGURATIONS ====================

// Allowed video formats
const ALLOWED_VIDEO_FORMATS = [
  "video/mp4",
  "video/mpeg",
  "video/quicktime",
  "video/x-msvideo",
  "video/x-matroska",
  "video/webm",
  "video/x-ms-wmv",
];

// Allowed image formats
const ALLOWED_IMAGE_FORMATS = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
];

// Max file sizes
const MAX_VIDEO_SIZE = 500 * 1024 * 1024; // 500MB for videos
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB for images

// ==================== DIRECTORY SETUP ====================

// Ensure temp directory exists
const TEMP_DIR = "temp/uploads/";
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
  console.log("📁 Created temp uploads directory:", TEMP_DIR);
}

// ==================== STORAGE CONFIGURATION ====================

// Configure multer storage - temporary storage before Cloudinary upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Store in temp folder (will be deleted after Cloudinary upload)
    cb(null, TEMP_DIR);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with field name
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const fieldName = file.fieldname; // 'video', 'trailer', 'poster', 'backdrop'
    cb(null, `${fieldName}-${uniqueSuffix}${ext}`);
  },
});

// ==================== FILE FILTER ====================

// File filter function - validates file types
const fileFilter = (req, file, cb) => {
  const fieldName = file.fieldname;

  // Video files (video, trailer)
  if (fieldName === "video" || fieldName === "trailer") {
    if (ALLOWED_VIDEO_FORMATS.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `Invalid video format for ${fieldName}. Allowed: MP4, MOV, AVI, MKV, WebM, WMV`
        ),
        false
      );
    }
  }
  // Image files (poster, backdrop)
  else if (fieldName === "poster" || fieldName === "backdrop") {
    if (ALLOWED_IMAGE_FORMATS.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `Invalid image format for ${fieldName}. Allowed: JPEG, JPG, PNG, WebP, GIF`
        ),
        false
      );
    }
  }
  // Unknown field
  else {
    cb(new Error(`Unexpected field name: ${fieldName}`), false);
  }
};

// ==================== MULTER CONFIGURATION ====================

// Configure multer with dynamic limits
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: MAX_VIDEO_SIZE, // Default to max video size
    files: 4, // Maximum 4 files: video, trailer, poster, backdrop
  },
});

// ==================== EXPORT MIDDLEWARE ====================

/**
 * Middleware for single video upload only
 * Field name: 'video'
 * Use for: Simple video upload without trailer/images
 */
export const uploadSingleVideo = upload.single("video");

/**
 * Middleware for video with images (no trailer)
 * Fields: video (1), poster (1), backdrop (1)
 * Use for: Legacy uploads without trailer support
 */
export const uploadVideoWithImages = upload.fields([
  { name: "video", maxCount: 1 },
  { name: "poster", maxCount: 1 },
  { name: "backdrop", maxCount: 1 },
]);

/**
 * ⭐ NEW: Middleware for complete upload (video + trailer + images)
 * Fields: video (1), trailer (1), poster (1), backdrop (1)
 * Use for: Full movie upload with trailer
 */
export const uploadVideoComplete = upload.fields([
  { name: "video", maxCount: 1 }, // Main video file
  { name: "trailer", maxCount: 1 }, // Trailer file (optional)
  { name: "poster", maxCount: 1 }, // Poster image (optional)
  { name: "backdrop", maxCount: 1 }, // Backdrop image (optional)
]);

/**
 * Default export for routes (complete upload)
 */
export const uploadVideo = uploadVideoComplete;

// ==================== ERROR HANDLERS ====================

/**
 * Error handler middleware for multer errors
 */
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Multer-specific errors
    if (err.code === "LIMIT_FILE_SIZE") {
      // Check which file exceeded the limit
      const field = err.field || "file";
      const isVideo = field === "video" || field === "trailer";
      const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
      const maxSizeMB = maxSize / (1024 * 1024);

      return res.status(400).json({
        success: false,
        message: `${field} file too large. Maximum size is ${maxSizeMB}MB`,
        field: field,
      });
    }

    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        success: false,
        message: `Unexpected field in upload: ${err.field}`,
        field: err.field,
      });
    }

    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        message: "Too many files uploaded",
      });
    }

    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`,
    });
  }

  if (err) {
    // Other errors (like file type validation)
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  next();
};

// ==================== VALIDATION MIDDLEWARE ====================

/**
 * Middleware to validate required video file
 * Use after multer middleware
 * NOTE: Video is optional - allow image-only uploads
 */
export const validateVideoFile = (req, res, next) => {
  // DEBUG: log incoming files
  console.log(
    "DEBUG validateVideoFile - req.files:",
    req.files ? Object.keys(req.files) : "(no files)"
  );
  console.log(
    "DEBUG validateVideoFile - req.file:",
    req.file ? req.file.fieldname : "(no single file)"
  );

  // Video is optional - skip this check for now
  // Just pass through to next middleware
  next();
};

/**
 * Middleware to validate file sizes individually
 * Use after multer middleware for better error messages
 */
export const validateFileSizes = (req, res, next) => {
  if (req.files) {
    const files = req.files;

    // Validate video
    if (files.video && files.video[0].size > MAX_VIDEO_SIZE) {
      return res.status(400).json({
        success: false,
        message: `Video file too large. Maximum size is ${
          MAX_VIDEO_SIZE / (1024 * 1024)
        }MB`,
        field: "video",
      });
    }

    // Validate trailer
    if (files.trailer && files.trailer[0].size > MAX_VIDEO_SIZE) {
      return res.status(400).json({
        success: false,
        message: `Trailer file too large. Maximum size is ${
          MAX_VIDEO_SIZE / (1024 * 1024)
        }MB`,
        field: "trailer",
      });
    }

    // Validate poster
    if (files.poster && files.poster[0].size > MAX_IMAGE_SIZE) {
      return res.status(400).json({
        success: false,
        message: `Poster image too large. Maximum size is ${
          MAX_IMAGE_SIZE / (1024 * 1024)
        }MB`,
        field: "poster",
      });
    }

    // Validate backdrop
    if (files.backdrop && files.backdrop[0].size > MAX_IMAGE_SIZE) {
      return res.status(400).json({
        success: false,
        message: `Backdrop image too large. Maximum size is ${
          MAX_IMAGE_SIZE / (1024 * 1024)
        }MB`,
        field: "backdrop",
      });
    }
  }

  next();
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Helper function to get file info
 */
export const getFileInfo = (file) => {
  if (!file) return null;

  return {
    filename: file.filename,
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
    sizeMB: (file.size / (1024 * 1024)).toFixed(2),
    path: file.path,
  };
};

/**
 * Helper function to get all uploaded files info
 */
export const getAllFilesInfo = (req) => {
  const info = {};

  if (req.file) {
    info.video = getFileInfo(req.file);
  }

  if (req.files) {
    Object.keys(req.files).forEach((fieldName) => {
      info[fieldName] = getFileInfo(req.files[fieldName][0]);
    });
  }

  return info;
};

/**
 * Helper function to clean up uploaded files
 * Call this in catch blocks to remove files if upload fails
 */
export const cleanupUploadedFiles = (req) => {
  try {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
      console.log("🗑️ Cleaned up file:", req.file.filename);
    }

    if (req.files) {
      Object.keys(req.files).forEach((fieldName) => {
        const file = req.files[fieldName][0];
        if (file && fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
          console.log("🗑️ Cleaned up file:", file.filename);
        }
      });
    }
  } catch (error) {
    console.error("Error cleaning up files:", error);
  }
};

// ==================== EXPORTS ====================

export default {
  uploadSingleVideo,
  uploadVideoWithImages,
  uploadVideoComplete,
  uploadVideo,
  handleUploadError,
  validateVideoFile,
  validateFileSizes,
  getFileInfo,
  getAllFilesInfo,
  cleanupUploadedFiles,
};
