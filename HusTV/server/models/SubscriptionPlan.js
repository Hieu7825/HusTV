// models/SubscriptionPlan.js
import mongoose from "mongoose";

const subscriptionPlanSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true }, // e.g., "plan_premium_v3"
    planName: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },

    features: [{ type: String }], // List of features

    connectedDevices: {
      type: mongoose.Schema.Types.Mixed, // Can be number or "Unlimited"
      required: true,
    },

    duration: {
      type: String,
      enum: ["Monthly", "Yearly"],
      default: "Monthly",
    },

    tierRank: { type: Number, required: true }, // 1-5 for sorting
    isPopular: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

subscriptionPlanSchema.index({ tierRank: 1 });

export default mongoose.model("SubscriptionPlan", subscriptionPlanSchema);
