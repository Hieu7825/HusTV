// routes/genreRoutes.js
import express from "express";
import {
  getAllGenres,
  getGenreById,
  createGenre,
  updateGenre,
  deleteGenre,
} from "../controllers/genreController.js";
import { protectAdmin } from "../middleware/auth.js";
import { body, param } from "express-validator";
import { validate } from "../middleware/validation.js";

const router = express.Router();

// Validation middleware
const validateCreateGenre = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Genre name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Genre name must be between 2-50 characters"),
];

const validateUpdateGenre = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Genre name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Genre name must be between 2-50 characters"),
];

const validateGenreId = [
  param("id").isInt({ min: 1 }).withMessage("Invalid genre ID"),
];

// Public routes
router.get("/", getAllGenres); // Get all genres (sorted)
router.get("/:id", validateGenreId, validate, getGenreById); // Get single genre

// Admin only routes
router.post("/", protectAdmin, validateCreateGenre, validate, createGenre); // Create genre (auto ID)

router.put(
  "/:id",
  protectAdmin,
  validateGenreId,
  validateUpdateGenre,
  validate,
  updateGenre
); // Update genre

router.delete("/:id", protectAdmin, validateGenreId, validate, deleteGenre); // Delete genre

export default router;
