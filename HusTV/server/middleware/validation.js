// ============================================
// FILE 2: server/middleware/validation.js (UPDATED)
// ============================================
import { body, param, query, validationResult } from "express-validator";

export const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
        value: err.value,
      })),
    });
  }

  next();
};

// ✅ UPDATED: Removed tierRank validation - it's now auto-calculated
export const validateCreatePlan = [
  body("planName")
    .trim()
    .notEmpty()
    .withMessage("Plan name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Plan name must be 2-50 characters"),

  body("price")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description must not exceed 500 characters"),

  body("features")
    .isArray({ min: 1 })
    .withMessage("At least one feature is required"),

  body("connectedDevices").custom((value) => {
    if (value === "Unlimited") return true;
    if (typeof value === "number" && value > 0) return true;
    throw new Error(
      'Connected devices must be a positive number or "Unlimited"'
    );
  }),

  body("duration")
    .isIn(["Monthly", "Yearly"])
    .withMessage("Duration must be Monthly or Yearly"),

  // ✅ REMOVED: tierRank validation - auto-calculated now

  validate,
];

// Video validation rules
export const validateCreateVideo = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 1, max: 200 })
    .withMessage("Title must be 1-200 characters"),

  body("overview")
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage("Overview must not exceed 2000 characters"),

  body("tagline")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Tagline must not exceed 500 characters"),

  body("runtime")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Runtime must be a positive number"),

  body("trailer")
    .optional()
    .trim()
    .isURL()
    .withMessage("Trailer must be a valid URL"),

  body("genres").optional().isArray().withMessage("Genres must be an array"),

  body("casts").optional().isArray().withMessage("Casts must be an array"),

  validate,
];

export const validateUpdateVideo = [
  param("id").trim().notEmpty().withMessage("Video ID is required"),

  body("title")
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage("Title must be 1-200 characters"),

  body("overview")
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage("Overview must not exceed 2000 characters"),

  body("runtime")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Runtime must be a positive number"),

  validate,
];

export const validateCreateSubscription = [
  body("planId").trim().notEmpty().withMessage("Plan ID is required"),

  body("paymentMethod")
    .optional()
    .trim()
    .isIn(["card", "paypal"])
    .withMessage("Invalid payment method"),

  validate,
];

export const validateUpgradeSubscription = [
  body("newPlanId").trim().notEmpty().withMessage("New plan ID is required"),

  validate,
];

export const validateUpdatePreferences = [
  body("language")
    .optional()
    .isIn(["en", "vi", "ja", "ko"])
    .withMessage("Invalid language"),

  body("autoplay")
    .optional()
    .isBoolean()
    .withMessage("Autoplay must be boolean"),

  body("quality")
    .optional()
    .isIn(["auto", "720p", "1080p", "4k"])
    .withMessage("Invalid quality setting"),

  body("notifications")
    .optional()
    .isBoolean()
    .withMessage("Notifications must be boolean"),

  validate,
];

export const validateUpdateDevice = [
  body("deviceId").trim().notEmpty().withMessage("Device ID is required"),

  body("deviceName")
    .trim()
    .notEmpty()
    .withMessage("Device name is required")
    .isLength({ min: 1, max: 100 })
    .withMessage("Device name must be 1-100 characters"),

  body("deviceType")
    .isIn(["mobile", "tablet", "desktop", "tv"])
    .withMessage("Invalid device type"),

  validate,
];

export const validateWatchProgress = [
  param("videoId").trim().notEmpty().withMessage("Video ID is required"),

  body("watchedDuration")
    .isInt({ min: 0 })
    .withMessage("Watched duration must be a positive number"),

  body("totalDuration")
    .isInt({ min: 1 })
    .withMessage("Total duration must be greater than 0"),

  validate,
];

export const validatePagination = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),

  validate,
];

export const validateSearch = [
  query("q")
    .trim()
    .notEmpty()
    .withMessage("Search query is required")
    .isLength({ min: 1, max: 200 })
    .withMessage("Search query must be 1-200 characters"),

  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("Limit must be between 1 and 50"),

  validate,
];
