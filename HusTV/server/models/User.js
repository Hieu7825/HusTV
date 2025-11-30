// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // Clerk User ID (as regular field, not as _id)
    clerkId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // Basic Info (synced from Clerk)
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    image: {
      type: String,
      default: "",
    },

    // Subscription Info
    currentSubscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
      default: null,
    },
    subscriptionStatus: {
      type: String,
      enum: ["none", "active", "expired", "cancelled"],
      default: "none",
      index: true,
    },
    subscriptionTier: {
      type: String,
      default: null, // "Basic", "Standard", "Premium", etc.
    },

    // Account Status
    isActive: {
      type: Boolean,
      default: true,
    },
    isBanned: {
      type: Boolean,
      default: false,
    },

    // Profile Settings
    preferences: {
      language: {
        type: String,
        default: "en",
      },
      autoplay: {
        type: Boolean,
        default: true,
      },
      quality: {
        type: String,
        enum: ["auto", "720p", "1080p", "4K"],
        default: "auto",
      },
      notifications: {
        email: {
          type: Boolean,
          default: true,
        },
        newReleases: {
          type: Boolean,
          default: true,
        },
        recommendations: {
          type: Boolean,
          default: true,
        },
      },
    },

    // Favorites (array of video IDs)
    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
      },
    ],

    // Watch Stats
    stats: {
      totalWatchTime: {
        type: Number,
        default: 0,
      }, // in minutes
      totalVideosWatched: {
        type: Number,
        default: 0,
      },
      lastActive: {
        type: Date,
        default: Date.now,
        index: true,
      },
    },

    // Devices
    connectedDevices: [
      {
        deviceId: {
          type: String,
          required: true,
        },
        deviceName: {
          type: String,
          required: true,
        },
        deviceType: {
          type: String,
          enum: ["mobile", "desktop", "tv", "tablet"],
          required: true,
        },
        lastUsed: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

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
  this.favorites = this.favorites.filter(
    (id) => id.toString() !== videoId.toString()
  );
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
    // Update existing device
    existingDevice.deviceName = deviceName;
    existingDevice.deviceType = deviceType;
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

// Method to get device by ID
userSchema.methods.getDevice = function (deviceId) {
  return this.connectedDevices.find((d) => d.deviceId === deviceId);
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
    await this.updateOne(
      { _id: sub.user },
      {
        subscriptionStatus: "expired",
        currentSubscription: null,
        subscriptionTier: null,
      }
    );
  }

  console.log(`✅ Updated ${expiredSubs.length} expired subscriptions`);
};

// Static method to find user by Clerk ID
userSchema.statics.findByClerkId = function (clerkId) {
  return this.findOne({ clerkId });
};

// Pre-save middleware
userSchema.pre("save", function (next) {
  // Update lastActive if stats are modified
  if (this.isModified("stats")) {
    this.stats.lastActive = new Date();
  }
  next();
});

// Enable virtuals in JSON output
userSchema.set("toJSON", { virtuals: true });

const User = mongoose.model("User", userSchema);

export default User;
