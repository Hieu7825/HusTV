// ============================================
// FILE: server/models/SubscriptionPlan.js (FIXED)
// ============================================
import mongoose from "mongoose";

const subscriptionPlanSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
    },

    planName: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    features: [
      {
        type: String,
        trim: true,
      },
    ],

    connectedDevices: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },

    duration: {
      type: String,
      enum: ["Monthly", "Yearly"],
      default: "Monthly",
    },

    tierRank: {
      type: Number,
      min: 1,
      max: 10,
      default: 1,
    },

    isPopular: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    _id: false,
  }
);

// Indexes for performance
subscriptionPlanSchema.index({ tierRank: 1 });
subscriptionPlanSchema.index({ isActive: 1 });
subscriptionPlanSchema.index({ isPopular: -1, tierRank: 1 });
subscriptionPlanSchema.index({ price: 1, duration: 1 });

// Virtual for formatted price
subscriptionPlanSchema.virtual("formattedPrice").get(function () {
  return `$${this.price.toFixed(2)}`;
});

// Method to check if upgrade is allowed
subscriptionPlanSchema.methods.canUpgradeFrom = function (currentTierRank) {
  return this.tierRank > currentTierRank;
};

// ✅ FIXED: Static method to recalculate all tier ranks (no save loop)
subscriptionPlanSchema.statics.recalculateAllRanks = async function () {
  try {
    // Get all active plans grouped by duration
    const monthlyPlans = await this.find({
      isActive: true,
      duration: "Monthly",
    }).sort({ price: 1 });

    const yearlyPlans = await this.find({
      isActive: true,
      duration: "Yearly",
    }).sort({ price: 1 });

    const bulkOps = [];

    // Update ranks for monthly plans
    for (let i = 0; i < monthlyPlans.length; i++) {
      bulkOps.push({
        updateOne: {
          filter: { _id: monthlyPlans[i]._id },
          update: { $set: { tierRank: i + 1 } },
        },
      });
    }

    // Update ranks for yearly plans
    for (let i = 0; i < yearlyPlans.length; i++) {
      bulkOps.push({
        updateOne: {
          filter: { _id: yearlyPlans[i]._id },
          update: { $set: { tierRank: i + 1 } },
        },
      });
    }

    // ✅ Use bulkWrite to avoid triggering save hooks
    if (bulkOps.length > 0) {
      await this.bulkWrite(bulkOps);
    }

    console.log(
      `✅ Recalculated ranks: ${monthlyPlans.length} monthly, ${yearlyPlans.length} yearly plans`
    );

    return {
      monthly: monthlyPlans.length,
      yearly: yearlyPlans.length,
    };
  } catch (error) {
    console.error("❌ Error recalculating ranks:", error);
    throw error;
  }
};

// ✅ FIXED: Pre-save hook to auto-calculate tierRank (only for current plan)
subscriptionPlanSchema.pre("save", async function (next) {
  try {
    // Only recalculate if price or duration changed
    if (this.isModified("price") || this.isModified("duration") || this.isNew) {
      // Get all plans with same duration, sorted by price
      const sameDurationPlans = await this.constructor
        .find({
          isActive: true,
          duration: this.duration,
          _id: { $ne: this._id },
        })
        .sort({ price: 1 });

      // Find where this plan fits
      let rank = 1;
      for (let i = 0; i < sameDurationPlans.length; i++) {
        if (this.price > sameDurationPlans[i].price) {
          rank = i + 2;
        }
      }

      this.tierRank = rank;
      console.log(
        `📊 Auto-calculated tierRank: ${rank} for ${this.planName} ($${this.price}/${this.duration})`
      );
    }

    next();
  } catch (error) {
    console.error("❌ Error in pre-save hook:", error);
    next(error);
  }
});

// ✅ REMOVED: Post-save hook (was causing infinite loop)
// Instead, we'll manually call recalculateAllRanks in the routes when needed

// ✅ FIXED: Post-remove hook using bulkWrite
subscriptionPlanSchema.post("deleteOne", async function (doc) {
  try {
    // Recalculate all ranks after deletion
    await this.model.recalculateAllRanks();
  } catch (error) {
    console.error("❌ Error in post-remove hook:", error);
  }
});

const SubscriptionPlan = mongoose.model(
  "SubscriptionPlan",
  subscriptionPlanSchema
);

export default SubscriptionPlan;
