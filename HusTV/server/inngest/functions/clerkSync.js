// inngest/functions/clerkSync.js
import { inngest } from "../client.js"; // Thay đổi từ ../index.js sang ../client.js
import User from "../../models/User.js";
import Subscription from "../../models/Subscription.js";

/**
 * Sync user when created in Clerk
 */
export const clerkUserCreated = inngest.createFunction(
  { id: "clerk-user-created" },
  { event: "clerk/user.created" },
  async ({ event, step }) => {
    const { id, email_addresses, first_name, last_name, image_url } =
      event.data;

    await step.run("create-user-in-db", async () => {
      // Check if user already exists
      const existingUser = await User.findById(id);
      if (existingUser) {
        console.log("User already exists:", id);
        return { success: true, message: "User already exists" };
      }

      // Create user in MongoDB
      const user = await User.create({
        _id: id,
        email: email_addresses[0]?.email_address || "",
        name: `${first_name || ""} ${last_name || ""}`.trim() || "User",
        image: image_url || "",
        subscriptionStatus: "none",
        subscriptionTier: null,
        currentSubscription: null,
        favorites: [],
        connectedDevices: [],
        stats: {
          totalWatchTime: 0,
          totalVideosWatched: 0,
          lastActive: new Date(),
        },
        preferences: {
          language: "en",
          autoplay: true,
          quality: "auto",
          notifications: true,
        },
      });

      console.log("✅ User created in MongoDB:", user._id);
      return { success: true, user };
    });
  }
);

/**
 * Sync user when updated in Clerk
 */
export const clerkUserUpdated = inngest.createFunction(
  { id: "clerk-user-updated" },
  { event: "clerk/user.updated" },
  async ({ event, step }) => {
    const { id, email_addresses, first_name, last_name, image_url } =
      event.data;

    await step.run("update-user-in-db", async () => {
      const user = await User.findById(id);

      if (!user) {
        console.log("⚠️ User not found, creating new user:", id);
        // Create user if doesn't exist
        await User.create({
          _id: id,
          email: email_addresses[0]?.email_address || "",
          name: `${first_name || ""} ${last_name || ""}`.trim() || "User",
          image: image_url || "",
          subscriptionStatus: "none",
        });
        return { success: true, message: "User created" };
      }

      // Update user info
      user.email = email_addresses[0]?.email_address || user.email;
      user.name = `${first_name || ""} ${last_name || ""}`.trim() || user.name;
      user.image = image_url || user.image;

      await user.save();

      console.log("✅ User updated in MongoDB:", user._id);
      return { success: true, user };
    });
  }
);

/**
 * Delete user when deleted in Clerk
 */
export const clerkUserDeleted = inngest.createFunction(
  { id: "clerk-user-deleted" },
  { event: "clerk/user.deleted" },
  async ({ event, step }) => {
    const { id } = event.data;

    await step.run("delete-user-data", async () => {
      // Delete user
      const user = await User.findByIdAndDelete(id);

      if (!user) {
        console.log("⚠️ User not found:", id);
        return { success: false, message: "User not found" };
      }

      console.log("✅ User deleted from MongoDB:", id);
      return { success: true, message: "User deleted" };
    });

    await step.run("delete-user-subscriptions", async () => {
      // Delete all subscriptions
      const result = await Subscription.deleteMany({ user: id });
      console.log(
        `✅ Deleted ${result.deletedCount} subscriptions for user:`,
        id
      );
      return { success: true, deletedCount: result.deletedCount };
    });

    await step.run("delete-user-watch-history", async () => {
      // Delete watch history
      const WatchHistory = (await import("../../models/WatchHistory.js"))
        .default;
      const result = await WatchHistory.deleteMany({ user: id });
      console.log(
        `✅ Deleted ${result.deletedCount} watch history records for user:`,
        id
      );
      return { success: true, deletedCount: result.deletedCount };
    });
  }
);
