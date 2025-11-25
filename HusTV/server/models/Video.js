// models/Video.js
import mongoose from "mongoose";

const videoSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true }, // TMDB ID hoặc custom ID

    // ⭐ THÊM MỚI: id số cho frontend filtering
    id: {
      type: Number,
      required: true,
      unique: true,
    },

    title: { type: String, required: true },
    overview: { type: String, required: true },

    // Media URLs
    video: { type: String, required: true }, // Cloudinary video URL
    trailer: { type: String }, // YouTube trailer URL
    poster_path: { type: String, required: true },
    backdrop_path: { type: String, required: true },

    // Cloudinary metadata
    cloudinaryPublicId: { type: String, required: true },
    cloudinaryFolder: { type: String, default: "hustv/videos" },

    // Video info
    runtime: { type: Number, required: true }, // minutes
    release_date: { type: String },
    original_language: { type: String, default: "en" },
    tagline: { type: String },

    // ⭐ THÊM MỚI: Adult content flag
    adult: {
      type: Boolean,
      default: false,
    },

    // Categories - ⚠️ ĐÃ ĐÚNG: genres có id và name
    genres: [
      {
        id: { type: Number, required: true },
        name: { type: String, required: true },
      },
    ],

    // Cast info - ⭐ CẬP NHẬT: Thêm id và character
    casts: [
      {
        id: { type: Number }, // ID của diễn viên
        name: { type: String, required: true },
        character: { type: String }, // Tên nhân vật: "John Wick"
        profile_path: { type: String }, // Avatar URL
      },
    ],

    // Engagement metrics
    view: { type: Number, default: 0 },
    vote_average: { type: Number, default: 0 },
    vote_count: { type: Number, default: 0 },

    // Status
    status: {
      type: String,
      enum: ["draft", "processing", "published", "private"],
      default: "draft",
    },

    // Admin
    uploadedBy: { type: String, required: true }, // User ID from Clerk
    featured: { type: Boolean, default: false },
    trending: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Indexes
videoSchema.index({ title: "text", overview: "text" });
videoSchema.index({ status: 1, createdAt: -1 });
videoSchema.index({ view: -1 }); // Sort by views
videoSchema.index({ id: 1 }); // ⭐ THÊM INDEX cho id số

// ⭐ THÊM PRE-SAVE HOOK: Auto-generate id nếu chưa có
videoSchema.pre("save", async function (next) {
  if (this.isNew && !this.id) {
    // Generate unique numeric ID from timestamp
    this.id = Date.now();
  }
  next();
});

export default mongoose.model("Video", videoSchema);
