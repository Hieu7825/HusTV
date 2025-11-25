// controllers/genreController.js
import Genre from "../models/Genre.js";
import Video from "../models/Video.js";
import { asyncHandler } from "../middleware/index.js";

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

  // Optionally count videos with this genre
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
 * @desc    Create new genre
 * @route   POST /api/genres
 * @access  Admin only
 */
export const createGenre = asyncHandler(async (req, res) => {
  const { id, name } = req.body;

  // Validation
  if (!id || !name) {
    return res.status(400).json({
      success: false,
      message: "Please provide both id and name",
    });
  }

  // Check if genre already exists
  const existingGenre = await Genre.findOne({
    $or: [
      { id: parseInt(id) },
      { name: { $regex: new RegExp(`^${name}$`, "i") } },
    ],
  });

  if (existingGenre) {
    return res.status(400).json({
      success: false,
      message:
        existingGenre.id === parseInt(id)
          ? "Genre ID already exists"
          : "Genre name already exists",
    });
  }

  // Create genre
  const genre = await Genre.create({
    id: parseInt(id),
    name: name.trim(),
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

  if (!name) {
    return res.status(400).json({
      success: false,
      message: "Please provide genre name",
    });
  }

  // Find genre
  const genre = await Genre.findOne({ id: parseInt(req.params.id) });

  if (!genre) {
    return res.status(404).json({
      success: false,
      message: "Genre not found",
    });
  }

  // Check if new name already exists (for other genre)
  const existingGenre = await Genre.findOne({
    name: { $regex: new RegExp(`^${name}$`, "i") },
    id: { $ne: parseInt(req.params.id) },
  });

  if (existingGenre) {
    return res.status(400).json({
      success: false,
      message: "Genre name already exists",
    });
  }

  // Update genre
  genre.name = name.trim();
  await genre.save();

  // 🔄 BONUS: Update all videos with this genre (optional)
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

/**
 * @desc    Search genres
 * @route   GET /api/genres/search?q=action
 * @access  Public
 */
export const searchGenres = asyncHandler(async (req, res) => {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({
      success: false,
      message: "Please provide search query",
    });
  }

  const genres = await Genre.find({
    name: { $regex: q, $options: "i" },
  })
    .sort({ name: 1 })
    .limit(20);

  res.status(200).json({
    success: true,
    count: genres.length,
    data: genres,
  });
});

/**
 * @desc    Get genre statistics
 * @route   GET /api/genres/stats
 * @access  Admin only
 */
export const getGenreStats = asyncHandler(async (req, res) => {
  const genres = await Genre.find().sort({ name: 1 });

  // Count videos for each genre
  const genreStats = await Promise.all(
    genres.map(async (genre) => {
      const videoCount = await Video.countDocuments({
        "genres.id": genre.id,
        status: "published",
      });

      return {
        id: genre.id,
        name: genre.name,
        videoCount,
      };
    })
  );

  // Sort by video count
  genreStats.sort((a, b) => b.videoCount - a.videoCount);

  res.status(200).json({
    success: true,
    count: genreStats.length,
    data: genreStats,
  });
});
