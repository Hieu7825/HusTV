// server/models/Video.js
import mongoose from "mongoose";

const videoSchema = new mongoose.Schema(
  {
    // ==================== IDENTIFIERS ====================

    _id: {
      type: String,
      required: true,
    }, // Custom ID: "video_1234567890"

    id: {
      type: Number,
      required: true,
      unique: true,
    }, // Numeric ID for frontend filtering

    // ==================== BASIC INFO ====================

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    overview: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },

    tagline: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    // ==================== MEDIA URLS ====================

    // Main video file (Cloudinary URL or HLS stream)
    video: {
      type: String,
      required: false, // ✅ KHÔNG bắt buộc - có thể upload sau
      trim: true,
      default: "",
    },

    // Trailer video (Cloudinary URL, YouTube URL, or HLS stream)
    trailer: {
      type: String,
      trim: true,
      default: "",
      required: false, // ✅ Trailer là optional
    },

    // Poster image (2:3 aspect ratio)
    poster_path: {
      type: String,
      required: true, // ✅ Poster VẪN bắt buộc
      trim: true,
    },

    // Backdrop image (16:9 aspect ratio)
    backdrop_path: {
      type: String,
      trim: true,
      default: "",
      required: false, // ✅ Backdrop là optional
    },

    // ==================== CLOUDINARY METADATA ====================

    // Cloudinary public ID for main video
    cloudinaryPublicId: {
      type: String,
      trim: true,
    },

    // ⭐ NEW: Cloudinary public ID for trailer
    trailerCloudinaryPublicId: {
      type: String,
      trim: true,
      default: "",
    },

    // ⭐ NEW: Cloudinary public ID for poster
    posterCloudinaryPublicId: {
      type: String,
      trim: true,
      default: "",
    },

    // ⭐ NEW: Cloudinary public ID for backdrop
    backdropCloudinaryPublicId: {
      type: String,
      trim: true,
      default: "",
    },

    cloudinaryFolder: {
      type: String,
      default: "hustv/videos",
    },

    // ==================== VIDEO INFO ====================

    // Duration in minutes
    runtime: {
      type: Number,
      required: true,
      min: 0,
    },

    // Release date (YYYY-MM-DD format)
    release_date: {
      type: String,
      trim: true,
    },

    // Language code (ISO 639-1: en, vi, etc.)
    original_language: {
      type: String,
      default: "en",
      trim: true,
      lowercase: true,
      maxlength: 10,
    },

    // Adult content flag (18+)
    adult: {
      type: Boolean,
      default: false,
    },

    // ==================== CATEGORIES & CAST ====================

    // Genres with ID and name
    genres: [
      {
        id: {
          type: Number,
          required: true,
        },
        name: {
          type: String,
          required: true,
          trim: true,
        },
      },
    ],

    // Cast members with full details
    casts: [
      {
        id: {
          type: Number,
        }, // Actor/Actress ID
        name: {
          type: String,
          required: true,
          trim: true,
        },
        character: {
          type: String,
          trim: true,
        }, // Character name
        profile_path: {
          type: String,
          trim: true,
        }, // Avatar URL
        order: {
          type: Number,
          default: 0,
        }, // Display order
      },
    ],

    // ==================== ENGAGEMENT METRICS ====================

    // Total view count
    view: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Average rating (0-10)
    vote_average: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },

    // Total number of votes
    vote_count: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ==================== STATUS & ADMIN ====================

    // Publishing status
    status: {
      type: String,
      enum: ["draft", "processing", "published", "private"],
      default: "draft",
    },

    // User ID from Clerk who uploaded
    uploadedBy: {
      type: String,
      required: true,
    },

    // Featured on homepage carousel
    featured: {
      type: Boolean,
      default: false,
    },

    // Trending section
    trending: {
      type: Boolean,
      default: false,
    },

    // ⭐ NEW: Additional admin fields

    // Quality available (720p, 1080p, 4K)
    availableQualities: {
      type: [String],
      default: ["auto"],
      enum: ["auto", "360p", "480p", "720p", "1080p", "4K"],
    },

    // Content rating (G, PG, PG-13, R, NC-17)
    contentRating: {
      type: String,
      enum: ["G", "PG", "PG-13", "R", "NC-17", "Unrated"],
      default: "Unrated",
    },

    // Subtitles available
    subtitles: [
      {
        language: {
          type: String,
          required: true,
        }, // Language code (en, vi)
        label: {
          type: String,
          required: true,
        }, // Display name (English, Tiếng Việt)
        url: {
          type: String,
          required: true,
        }, // Subtitle file URL
      },
    ],

    // SEO metadata
    seo: {
      metaTitle: String,
      metaDescription: String,
      keywords: [String],
      slug: String, // URL-friendly slug
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ==================== INDEXES ====================

// Text search index for title, overview, tagline
videoSchema.index({
  title: "text",
  overview: "text",
  tagline: "text",
});

// Compound index for status and date
videoSchema.index({
  status: 1,
  createdAt: -1,
});

// Index for sorting by views (trending)
videoSchema.index({
  view: -1,
});

// Index for numeric ID (frontend filtering)
videoSchema.index({
  id: 1,
});

// Index for featured/trending queries
videoSchema.index({
  featured: 1,
  createdAt: -1,
});

videoSchema.index({
  trending: 1,
  view: -1,
});

// Index for genre filtering
videoSchema.index({
  "genres.id": 1,
});

// Index for user uploads
videoSchema.index({
  uploadedBy: 1,
  createdAt: -1,
});

// ⭐ NEW: Index for slug (SEO)
videoSchema.index(
  {
    "seo.slug": 1,
  },
  {
    unique: true,
    sparse: true,
  }
);

// ==================== VIRTUAL FIELDS ====================

// Virtual field for duration in "2h 30m" format
videoSchema.virtual("formattedRuntime").get(function () {
  if (!this.runtime) return "N/A";
  const hours = Math.floor(this.runtime / 60);
  const minutes = this.runtime % 60;
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
});

// Virtual field for release year
videoSchema.virtual("releaseYear").get(function () {
  if (!this.release_date) return null;
  return new Date(this.release_date).getFullYear();
});

// Virtual field to check if trailer is available
videoSchema.virtual("hasTrailer").get(function () {
  return !!this.trailer;
});

// ==================== METHODS ====================

/**
 * Instance method to check if video is watchable
 */
videoSchema.methods.isWatchable = function () {
  return this.status === "published" && this.video;
};

/**
 * Instance method to check if trailer is available
 */
videoSchema.methods.hasAvailableTrailer = function () {
  return !!this.trailer && this.trailer.length > 0;
};

/**
 * Instance method to get appropriate content rating text
 */
videoSchema.methods.getRatingText = function () {
  if (this.adult) return "18+";

  const ratingMap = {
    G: "All Ages",
    PG: "Parental Guidance",
    "PG-13": "13+",
    R: "17+",
    "NC-17": "18+",
    Unrated: "Not Rated",
  };

  return ratingMap[this.contentRating] || "Not Rated";
};

// ==================== STATIC METHODS ====================

/**
 * Static method to get published videos
 */
videoSchema.statics.getPublished = function (limit = 20) {
  return this.find({ status: "published" })
    .sort({ createdAt: -1 })
    .limit(limit);
};

/**
 * Static method to get featured videos
 */
videoSchema.statics.getFeatured = function (limit = 6) {
  return this.find({
    status: "published",
    featured: true,
  })
    .sort({ createdAt: -1 })
    .limit(limit);
};

/**
 * Static method to get trending videos
 */
videoSchema.statics.getTrending = function (limit = 10) {
  return this.find({
    status: "published",
    trending: true,
  })
    .sort({ view: -1 })
    .limit(limit);
};

// ==================== MIDDLEWARE (HOOKS) ====================

/**
 * Pre-save hook: Auto-generate numeric ID if not exists
 */
videoSchema.pre("save", async function (next) {
  if (this.isNew && !this.id) {
    // Generate unique numeric ID from timestamp
    this.id = Date.now();
  }
  next();
});

/**
 * Pre-save hook: Generate SEO slug from title
 */
videoSchema.pre("save", function (next) {
  if (this.isModified("title") && !this.seo?.slug) {
    // Generate slug from title
    const slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    if (!this.seo) this.seo = {};
    this.seo.slug = `${slug}-${this.id}`;
  }
  next();
});

/**
 * Post-save hook: Log new video creation
 */
videoSchema.post("save", function (doc) {
  if (doc.isNew) {
    console.log(`📹 New video created: ${doc.title} (${doc._id})`);
  }
});

/**
 * Pre-remove hook: Cleanup related data
 */
videoSchema.pre("remove", async function (next) {
  try {
    // Remove watch history
    await mongoose.model("WatchHistory").deleteMany({ video: this._id });

    // Remove from user favorites
    await mongoose
      .model("User")
      .updateMany({ favorites: this._id }, { $pull: { favorites: this._id } });

    console.log(`🗑️ Cleaned up data for video: ${this._id}`);
    next();
  } catch (error) {
    next(error);
  }
});

// ==================== EXPORT ====================

const Video = mongoose.model("Video", videoSchema);

export default Video;
