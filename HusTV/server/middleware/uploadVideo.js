// middleware/uploadVideo.js
import multer from "multer";
import path from "path";

// Allowed video formats
const ALLOWED_VIDEO_FORMATS = [
  "video/mp4",
  "video/mpeg",
  "video/quicktime",
  "video/x-msvideo",
  "video/x-matroska",
  "video/webm",
];

// Max file size: 500MB
const MAX_FILE_SIZE = 500 * 1024 * 1024;

// Configure multer storage - temporary storage before Cloudinary upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Store in temp folder (will be deleted after Cloudinary upload)
    cb(null, "temp/uploads/");
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Check if file type is allowed
  if (ALLOWED_VIDEO_FORMATS.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type. Allowed formats: ${ALLOWED_VIDEO_FORMATS.join(
          ", "
        )}`
      ),
      false
    );
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});

/**
 * Middleware for single video upload
 * Field name: 'video'
 */
export const uploadSingleVideo = upload.single("video");

/**
 * Middleware for multiple file uploads (video + images)
 * Fields:
 * - video: 1 file (required)
 * - poster: 1 file (optional)
 * - backdrop: 1 file (optional)
 */
export const uploadVideoWithImages = upload.fields([
  { name: "video", maxCount: 1 },
  { name: "poster", maxCount: 1 },
  { name: "backdrop", maxCount: 1 },
]);

/**
 * Error handler middleware for multer errors
 */
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Multer-specific errors
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: `File too large. Maximum size is ${
          MAX_FILE_SIZE / (1024 * 1024)
        }MB`,
      });
    }

    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        success: false,
        message: "Unexpected field in upload",
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

/**
 * Middleware to validate required video file
 */
export const validateVideoFile = (req, res, next) => {
  if (!req.file && !req.files?.video) {
    return res.status(400).json({
      success: false,
      message: "Video file is required",
    });
  }
  next();
};

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
    path: file.path,
  };
};
