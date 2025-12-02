// ============================================
// FILE 1: server/models/SubscriptionPlan.js
// ============================================
import mongoose from "mongoose";

const subscriptionPlanSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
    }, // Custom ID: e.g., "plan_basic_v1", "plan_premium_v3"

    planName: {
      type: String,
      required: true,
      trim: true,
    }, // e.g., "Basic Plan", "Premium Plan"

    price: {
      type: Number,
      required: true,
      min: 0,
    }, // Price in USD

    description: {
      type: String,
      required: true,
      trim: true,
    }, // Short description of the plan

    features: [
      {
        type: String,
        trim: true,
      },
    ], // List of features: ["HD Streaming", "Download Movies", etc.]

    connectedDevices: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    }, // Can be Number (e.g., 2) or String (e.g., "Unlimited")

    duration: {
      type: String,
      enum: ["Monthly", "Yearly"],
      default: "Monthly",
    }, // Subscription duration

    tierRank: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    }, // 1-10 for sorting (1 = lowest tier, 10 = highest)

    isPopular: {
      type: Boolean,
      default: false,
    }, // Flag to highlight popular plans

    isActive: {
      type: Boolean,
      default: true,
    }, // Only active plans are shown to users
  },
  {
    timestamps: true,
    _id: false, // Disable auto _id since we're using custom _id
  }
);

// Indexes for performance
subscriptionPlanSchema.index({ tierRank: 1 });
subscriptionPlanSchema.index({ isActive: 1 });
subscriptionPlanSchema.index({ isPopular: -1, tierRank: 1 });

// Virtual for formatted price
subscriptionPlanSchema.virtual("formattedPrice").get(function () {
  return `$${this.price.toFixed(2)}`;
});

// Method to check if upgrade is allowed
subscriptionPlanSchema.methods.canUpgradeFrom = function (currentTierRank) {
  return this.tierRank > currentTierRank;
};

const SubscriptionPlan = mongoose.model(
  "SubscriptionPlan",
  subscriptionPlanSchema
);

export default SubscriptionPlan;
