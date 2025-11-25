// models/Genre.js
import mongoose from "mongoose";

const genreSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
  },
  { timestamps: true }
);

// Index cho search và sort
genreSchema.index({ name: 1 });
genreSchema.index({ id: 1 });

// Static method để tìm theo id hoặc name
genreSchema.statics.findByIdOrName = function (query) {
  const isNumeric = !isNaN(query);
  return this.findOne(
    isNumeric ? { id: parseInt(query) } : { name: new RegExp(query, "i") }
  );
};

export default mongoose.model("Genre", genreSchema);
