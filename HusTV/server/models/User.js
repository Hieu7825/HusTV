// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // Clerk User ID (primary key)
    _id: { type: String, required: true },

    // Basic Info (synced from Clerk)
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    image: { type: String, required: true },

    // Subscription Info
    currentSubscription: {
      type: String,
      ref: "Subscription",
      default: null,
    },
    subscriptionStatus: {
      type: String,
      enum: ["none", "active", "expired", "cancelled"],
      default: "none",
    },
    subscriptionTier: {
      type: String,
      default: null, // "Basic", "Standard", "Premium", etc.
    },

    // Account Status
    isActive: { type: Boolean, default: true },
    isBanned: { type: Boolean, default: false },

    // Profile Settings
    preferences: {
      language: { type: String, default: "en" },
      autoplay: { type: Boolean, default: true },
      quality: {
        type: String,
        enum: ["auto", "720p", "1080p", "4K"],
        default: "auto",
      },
      notifications: {
        email: { type: Boolean, default: true },
        newReleases: { type: Boolean, default: true },
        recommendations: { type: Boolean, default: true },
      },
    },

    // Favorites (array of video IDs)
    favorites: [{ type: String, ref: "Video" }],

    // Watch Stats
    stats: {
      totalWatchTime: { type: Number, default: 0 }, // in minutes
      totalVideosWatched: { type: Number, default: 0 },
      lastActive: { type: Date, default: Date.now },
    },

    // Devices
    connectedDevices: [
      {
        deviceId: { type: String },
        deviceName: { type: String },
        deviceType: { type: String }, // "mobile", "desktop", "tv", "tablet"
        lastUsed: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
    // Disable _id auto-generation since we use Clerk ID
    _id: false,
  }
);

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ subscriptionStatus: 1 });
userSchema.index({ "stats.lastActive": -1 });

// Virtual for active subscription check
userSchema.virtual("hasActiveSubscription").get(function () {
  return this.subscriptionStatus === "active";
});

// Method to check if user can watch (has active subscription)
userSchema.methods.canWatch = function () {
  return this.subscriptionStatus === "active" && !this.isBanned;
};

// Method to add favorite
userSchema.methods.addFavorite = async function (videoId) {
  if (!this.favorites.includes(videoId)) {
    this.favorites.push(videoId);
    await this.save();
  }
};

// Method to remove favorite
userSchema.methods.removeFavorite = async function (videoId) {
  this.favorites = this.favorites.filter((id) => id !== videoId);
  await this.save();
};

// Method to check device limit based on subscription
userSchema.methods.canAddDevice = async function () {
  if (this.subscriptionStatus !== "active") return false;

  // Get subscription plan to check device limit
  const Subscription = mongoose.model("Subscription");
  const subscription = await Subscription.findById(
    this.currentSubscription
  ).populate("plan");

  if (!subscription) return false;

  const deviceLimit = subscription.plan.connectedDevices;

  // If unlimited devices
  if (deviceLimit === "Unlimited") return true;

  // Check if under limit
  return this.connectedDevices.length < deviceLimit;
};

// Method to add/update device
userSchema.methods.updateDevice = async function (deviceInfo) {
  const { deviceId, deviceName, deviceType } = deviceInfo;

  // Find existing device
  const existingDevice = this.connectedDevices.find(
    (d) => d.deviceId === deviceId
  );

  if (existingDevice) {
    // Update last used time
    existingDevice.lastUsed = new Date();
  } else {
    // Check if can add new device
    const canAdd = await this.canAddDevice();
    if (!canAdd) {
      throw new Error("Device limit reached for your subscription plan");
    }

    // Add new device
    this.connectedDevices.push({
      deviceId,
      deviceName,
      deviceType,
      lastUsed: new Date(),
    });
  }

  await this.save();
};

// Method to remove device
userSchema.methods.removeDevice = async function (deviceId) {
  this.connectedDevices = this.connectedDevices.filter(
    (d) => d.deviceId !== deviceId
  );
  await this.save();
};

// Static method to update subscription status (called by cron job)
userSchema.statics.updateExpiredSubscriptions = async function () {
  const Subscription = mongoose.model("Subscription");

  // Find all expired subscriptions
  const expiredSubs = await Subscription.find({
    status: "Active",
    expiryDate: { $lt: new Date() },
  });

  // Update subscription status
  for (const sub of expiredSubs) {
    sub.status = "Expired";
    await sub.save();

    // Update user subscription status
    await this.findByIdAndUpdate(sub.user, {
      subscriptionStatus: "expired",
    });
  }

  console.log(`✅ Updated ${expiredSubs.length} expired subscriptions`);
};

// Pre-save middleware to update stats
userSchema.pre("save", function (next) {
  if (this.isModified("stats.lastActive")) {
    // Auto-update last active timestamp
  }
  next();
});

const User = mongoose.model("User", userSchema);

export default User;
