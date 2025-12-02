// ============================================
// FILE 2: server/models/Booking.js (UPDATED)
// ============================================
import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    // User info
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

    // Show reference
    show: {
      type: String,
      required: true,
      ref: "Show",
    },

    // Booking details
    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    bookedSeats: {
      type: Array,
      required: true,
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: "At least one seat must be booked",
      },
    },

    // Payment status
    isPaid: {
      type: Boolean,
      default: false,
      index: true,
    },

    paymentLink: {
      type: String,
      trim: true,
    }, // Stripe checkout URL (cleared after payment)

    // Payment info - UPDATED FIELDS
    transactionId: {
      type: String,
      trim: true,
      index: true,
    }, // Stripe payment intent ID

    paymentMethod: {
      type: String,
      trim: true,
    }, // e.g., "card", "paypal"
  },
  {
    timestamps: true,
  }
);

// Compound indexes for common queries
bookingSchema.index({ user: 1, isPaid: 1 });
bookingSchema.index({ createdAt: -1 });
bookingSchema.index({ show: 1, isPaid: 1 });

// Virtual for formatted amount
bookingSchema.virtual("formattedAmount").get(function () {
  return `$${this.amount.toFixed(2)}`;
});

// Method to check if booking is paid
bookingSchema.methods.isPaymentComplete = function () {
  return this.isPaid && this.transactionId;
};

// Static method to find bookings by user
bookingSchema.statics.findByUser = function (userId) {
  return this.find({ user: userId }).populate("show").sort({ createdAt: -1 });
};

// Static method to find paid bookings
bookingSchema.statics.findPaidBookings = function (userId) {
  return this.find({ user: userId, isPaid: true })
    .populate("show")
    .sort({ createdAt: -1 });
};

// Enable virtuals in JSON output
bookingSchema.set("toJSON", { virtuals: true });

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
