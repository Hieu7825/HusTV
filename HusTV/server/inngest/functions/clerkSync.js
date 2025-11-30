// inngest/functions/clerkSync.js
import { inngest } from "../client.js";
import User from "../../models/User.js";
import Subscription from "../../models/Subscription.js";
import WatchHistory from "../../models/WatchHistory.js";

/**
 * Sync user when created in Clerk
 */
export const clerkUserCreated = inngest.createFunction(
  { id: "clerk-user-created" },
  { event: "user.created" },
  async ({ event, step }) => {
    const { id, email_addresses, first_name, last_name, image_url } =
      event.data;

    console.log("🔵 Clerk user.created event triggered for:", id);

    await step.run("create-user-in-db", async () => {
      try {
        // Check if user already exists by clerkId
        const existingUser = await User.findByClerkId(id);
        if (existingUser) {
          console.log("⚠️ User already exists:", id);
          return { success: true, message: "User already exists" };
        }

        console.log("🔨 Creating new user in MongoDB:", id);

        // Extract email safely - handle empty email_addresses
        let userEmail = "no-email@example.com";
        if (
          email_addresses &&
          Array.isArray(email_addresses) &&
          email_addresses.length > 0
        ) {
          userEmail =
            email_addresses[0]?.email_address || "no-email@example.com";
        }

        // Create user in MongoDB
        const user = await User.create({
          clerkId: id,
          email: userEmail,
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
            notifications: {
              email: true,
              newReleases: true,
              recommendations: true,
            },
          },
        });

        console.log("✅ User created in MongoDB:", user._id);
        console.log("📝 User data:", {
          clerkId: user.clerkId,
          email: user.email,
          name: user.name,
        });

        return { success: true, user };
      } catch (error) {
        console.error("❌ Error creating user:", error.message);
        console.error("📌 Error details:", error);
        throw error;
      }
    });
  }
);

/**
 * Sync user when updated in Clerk
 */
export const clerkUserUpdated = inngest.createFunction(
  { id: "clerk-user-updated" },
  { event: "user.updated" },
  async ({ event, step }) => {
    const { id, email_addresses, first_name, last_name, image_url } =
      event.data;

    console.log("🔵 Clerk user.updated event triggered for:", id);

    await step.run("update-user-in-db", async () => {
      try {
        // Find user by clerkId
        let user = await User.findByClerkId(id);

        if (!user) {
          console.log("⚠️ User not found, creating new user:", id);

          // Extract email safely - handle empty email_addresses
          let userEmail = "no-email@example.com";
          if (
            email_addresses &&
            Array.isArray(email_addresses) &&
            email_addresses.length > 0
          ) {
            userEmail =
              email_addresses[0]?.email_address || "no-email@example.com";
          }

          // Create user if doesn't exist
          user = await User.create({
            clerkId: id,
            email: userEmail,
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
              notifications: {
                email: true,
                newReleases: true,
                recommendations: true,
              },
            },
          });

          console.log("✅ User created in MongoDB:", user._id);
          return { success: true, message: "User created", user };
        }

        // Update user info
        const oldEmail = user.email;
        const oldName = user.name;

        // Extract email safely - handle empty email_addresses
        if (
          email_addresses &&
          Array.isArray(email_addresses) &&
          email_addresses.length > 0
        ) {
          user.email = email_addresses[0]?.email_address || user.email;
        }

        user.name =
          `${first_name || ""} ${last_name || ""}`.trim() || user.name;
        user.image = image_url || user.image;

        await user.save();

        console.log("✅ User updated in MongoDB:", user._id);
        console.log("📝 Updated fields:", {
          email: { old: oldEmail, new: user.email },
          name: { old: oldName, new: user.name },
        });

        return { success: true, message: "User updated", user };
      } catch (error) {
        console.error("❌ Error updating user:", error.message);
        console.error("📌 Error details:", error);
        throw error;
      }
    });
  }
);

/**
 * Delete user when deleted in Clerk
 */
export const clerkUserDeleted = inngest.createFunction(
  { id: "clerk-user-deleted" },
  { event: "user.deleted" },
  async ({ event, step }) => {
    const { id } = event.data;

    console.log("🔵 Clerk user.deleted event triggered for:", id);

    await step.run("delete-user-data", async () => {
      try {
        // Delete user by clerkId
        const user = await User.findOneAndDelete({ clerkId: id });

        if (!user) {
          console.log("⚠️ User not found in MongoDB:", id);
          return { success: false, message: "User not found" };
        }

        console.log("✅ User deleted from MongoDB:", id);
        console.log("📝 Deleted user:", {
          clerkId: user.clerkId,
          email: user.email,
          name: user.name,
        });

        return { success: true, message: "User deleted" };
      } catch (error) {
        console.error("❌ Error deleting user:", error.message);
        console.error("📌 Error details:", error);
        throw error;
      }
    });

    await step.run("delete-user-subscriptions", async () => {
      try {
        // Delete all subscriptions for this user
        const result = await Subscription.deleteMany({ user: id });

        console.log(
          `✅ Deleted ${result.deletedCount} subscriptions for user:`,
          id
        );

        return { success: true, deletedCount: result.deletedCount };
      } catch (error) {
        console.error(
          "❌ Error deleting subscriptions for user:",
          id,
          error.message
        );
        throw error;
      }
    });

    await step.run("delete-user-watch-history", async () => {
      try {
        // Delete watch history
        const result = await WatchHistory.deleteMany({ user: id });

        console.log(
          `✅ Deleted ${result.deletedCount} watch history records for user:`,
          id
        );

        return { success: true, deletedCount: result.deletedCount };
      } catch (error) {
        console.error(
          "❌ Error deleting watch history for user:",
          id,
          error.message
        );
        throw error;
      }
    });

    console.log("🎉 User deletion process completed for:", id);
  }
);
