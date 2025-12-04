// controllers/genreController.js
import Genre from "../models/Genre.js";
import Video from "../models/Video.js";
import { asyncHandler } from "../middleware/index.js";

/**
 * Helper function: Convert to Title Case
 * "action" -> "Action"
 * "science fiction" -> "Science Fiction"
 * "sci-fi" -> "Sci-Fi"
 */
const toTitleCase = (str) => {
  return str
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((word) => {
      // Handle hyphenated words
      return word
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join("-");
    })
    .join(" ");
};

/**
 * @desc    Get all genres (sorted alphabetically)
 * @route   GET /api/genres
 * @access  Public
 */
export const getAllGenres = asyncHandler(async (req, res) => {
  const genres = await Genre.find().sort({ name: 1 });

  res.status(200).json({
    success: true,
    count: genres.length,
    data: genres,
  });
});

/**
 * @desc    Get single genre by ID
 * @route   GET /api/genres/:id
 * @access  Public
 */
export const getGenreById = asyncHandler(async (req, res) => {
  const genre = await Genre.findOne({ id: parseInt(req.params.id) });

  if (!genre) {
    return res.status(404).json({
      success: false,
      message: "Genre not found",
    });
  }

  // Count videos with this genre
  const videoCount = await Video.countDocuments({
    "genres.id": genre.id,
    status: "published",
  });

  res.status(200).json({
    success: true,
    data: {
      ...genre.toObject(),
      videoCount,
    },
  });
});

/**
 * @desc    Create new genre (auto-increment ID)
 * @route   POST /api/genres
 * @access  Admin only
 */
export const createGenre = asyncHandler(async (req, res) => {
  const { name } = req.body;

  // Validation
  if (!name || !name.trim()) {
    return res.status(400).json({
      success: false,
      message: "Please provide genre name",
    });
  }

  // Format name to Title Case
  const formattedName = toTitleCase(name);

  // Check if genre name already exists (case-insensitive)
  const existingGenre = await Genre.findOne({
    name: { $regex: new RegExp(`^${formattedName}$`, "i") },
  });

  if (existingGenre) {
    return res.status(400).json({
      success: false,
      message: `Genre "${formattedName}" already exists`,
    });
  }

  // Get the highest ID and increment
  const lastGenre = await Genre.findOne().sort({ id: -1 });
  const newId = lastGenre ? lastGenre.id + 1 : 1;

  // Create genre
  const genre = await Genre.create({
    id: newId,
    name: formattedName,
  });

  res.status(201).json({
    success: true,
    message: "Genre created successfully",
    data: genre,
  });
});

/**
 * @desc    Update genre
 * @route   PUT /api/genres/:id
 * @access  Admin only
 */
export const updateGenre = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({
      success: false,
      message: "Please provide genre name",
    });
  }

  // Format name to Title Case
  const formattedName = toTitleCase(name);

  // Find genre
  const genre = await Genre.findOne({ id: parseInt(req.params.id) });

  if (!genre) {
    return res.status(404).json({
      success: false,
      message: "Genre not found",
    });
  }

  // Check if new name already exists (for other genre, case-insensitive)
  const existingGenre = await Genre.findOne({
    name: { $regex: new RegExp(`^${formattedName}$`, "i") },
    id: { $ne: parseInt(req.params.id) },
  });

  if (existingGenre) {
    return res.status(400).json({
      success: false,
      message: `Genre "${formattedName}" already exists`,
    });
  }

  // Update genre
  genre.name = formattedName;
  await genre.save();

  // Update all videos with this genre
  await Video.updateMany(
    { "genres.id": genre.id },
    { $set: { "genres.$[elem].name": genre.name } },
    { arrayFilters: [{ "elem.id": genre.id }] }
  );

  res.status(200).json({
    success: true,
    message: "Genre updated successfully",
    data: genre,
  });
});

/**
 * @desc    Delete genre
 * @route   DELETE /api/genres/:id
 * @access  Admin only
 */
export const deleteGenre = asyncHandler(async (req, res) => {
  const genre = await Genre.findOne({ id: parseInt(req.params.id) });

  if (!genre) {
    return res.status(404).json({
      success: false,
      message: "Genre not found",
    });
  }

  // Check if genre is used in any videos
  const videosWithGenre = await Video.countDocuments({
    "genres.id": genre.id,
  });

  if (videosWithGenre > 0) {
    return res.status(400).json({
      success: false,
      message: `Cannot delete genre. It is used in ${videosWithGenre} video(s)`,
    });
  }

  await genre.deleteOne();

  res.status(200).json({
    success: true,
    message: "Genre deleted successfully",
  });
});
