// ============================================
// FILE 2: server/models/Subscription.js
// ============================================
import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    // User info (from Clerk)
    user: {
      type: String,
      required: true,
      index: true,
    }, // Clerk User ID

    userName: {
      type: String,
      required: true,
      trim: true,
    },

    userEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    // Plan reference
    plan: {
      type: String,
      ref: "SubscriptionPlan",
      required: true,
    },

    // Purchase and expiry dates
    purchaseDate: {
      type: Date,
      required: true,
      default: Date.now,
    },

    expiryDate: {
      type: Date,
      required: true,
    },

    // Purchase details
    amount: {
      type: Number,
      required: true,
      min: 0,
    }, // Price paid at purchase time

    // Status
    status: {
      type: String,
      enum: ["Pending", "Active", "Expired", "Cancelled"],
      default: "Pending", // ✅ Changed default to Pending
      index: true,
    },

    // Payment info
    paymentMethod: {
      type: String,
      trim: true,
    }, // e.g., "card", "paypal"

    transactionId: {
      type: String,
      trim: true,
      index: true,
    }, // Stripe payment intent ID

    isPaid: {
      type: Boolean,
      default: false,
      index: true,
    },

    paymentLink: {
      type: String,
      trim: true,
    }, // Stripe checkout URL (cleared after payment)
  },
  {
    timestamps: true,
  }
);

// Compound indexes for common queries
subscriptionSchema.index({ user: 1, status: 1 });
subscriptionSchema.index({ user: 1, isPaid: 1 });
subscriptionSchema.index({ expiryDate: 1, status: 1 });

// Virtual for days remaining
subscriptionSchema.virtual("daysRemaining").get(function () {
  if (this.status !== "Active" || !this.isPaid) return 0;

  const now = new Date();
  const expiry = new Date(this.expiryDate);
  const diff = expiry - now;

  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
});

// Virtual for formatted amount
subscriptionSchema.virtual("formattedAmount").get(function () {
  return `$${this.amount.toFixed(2)}`;
});

// Method to check if subscription is currently valid
subscriptionSchema.methods.isValid = function () {
  return (
    this.isPaid &&
    this.status === "Active" &&
    new Date() < new Date(this.expiryDate)
  );
};

// Method to check if subscription is expired
subscriptionSchema.methods.isExpired = function () {
  return new Date() >= new Date(this.expiryDate);
};

// Static method to find active subscription for user
subscriptionSchema.statics.findActiveForUser = async function (userId) {
  return this.findOne({
    user: userId,
    isPaid: true,
    status: "Active",
    expiryDate: { $gt: new Date() },
  }).populate("plan");
};

// Pre-save hook to validate expiry date
subscriptionSchema.pre("save", function (next) {
  if (this.isNew && this.expiryDate <= this.purchaseDate) {
    next(new Error("Expiry date must be after purchase date"));
  }
  next();
});

const Subscription = mongoose.model("Subscription", subscriptionSchema);

export default Subscription;
