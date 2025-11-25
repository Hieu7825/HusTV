// models/WatchHistory.js
import mongoose from "mongoose";

const watchHistorySchema = new mongoose.Schema(
  {
    user: { type: String, required: true }, // Clerk User ID
    video: { type: String, ref: "Video", required: true },

    // Progress tracking
    watchedDuration: { type: Number, default: 0 }, // seconds
    totalDuration: { type: Number, required: true },
    progress: { type: Number, default: 0 }, // percentage (0-100)

    lastWatchedAt: { type: Date, default: Date.now },
    completed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

watchHistorySchema.index({ user: 1, lastWatchedAt: -1 });
watchHistorySchema.index({ user: 1, video: 1 }, { unique: true });

export default mongoose.model("WatchHistory", watchHistorySchema);
