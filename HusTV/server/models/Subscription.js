// models/Subscription.js
import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    // User info (from Clerk)
    user: { type: String, required: true }, // Clerk User ID
    userName: { type: String, required: true },
    userEmail: { type: String, required: true },

    // Plan reference
    plan: {
      type: String,
      ref: "SubscriptionPlan",
      required: true,
    },

    // Purchase details
    purchaseDate: { type: Date, required: true },
    expiryDate: { type: Date, required: true },
    amount: { type: Number, required: true }, // Price paid

    // Status
    status: {
      type: String,
      enum: ["Active", "Expired", "Cancelled"],
      default: "Active",
    },

    // Payment info
    paymentMethod: { type: String }, // "Credit Card", "PayPal", etc.
    transactionId: { type: String },
    isPaid: { type: Boolean, default: false },
    paymentLink: { type: String }, // Stripe payment link
  },
  { timestamps: true }
);

subscriptionSchema.index({ user: 1, status: 1 });
subscriptionSchema.index({ expiryDate: 1 });

export default mongoose.model("Subscription", subscriptionSchema);
