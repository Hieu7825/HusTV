// middleware/auth.js
import { clerkClient } from "@clerk/express";
/**
 * Middleware to protect admin routes
 * Checks if user has admin role in Clerk privateMetadata
 */
export const protectAdmin = async (req, res, next) => {
  try {
    // Get userId from Clerk auth (set by Clerk middleware)
    const { userId } = req.auth;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - No user ID found",
      });
    }

    // Get user from Clerk
    const user = await clerkClient.users.getUser(userId);

    // Check if user has admin role in privateMetadata
    const isAdmin = user.privateMetadata?.role === "admin";

    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Forbidden - Admin access required",
      });
    }

    // Attach user info to request for use in controllers
    req.user = {
      id: userId,
      email: user.emailAddresses[0]?.emailAddress,
      name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
      role: "admin",
    };

    next();
  } catch (error) {
    console.error("Admin auth error:", error);
    return res.status(500).json({
      success: false,
      message: "Error verifying admin access",
      error: error.message,
    });
  }
};

/**
 * Middleware to protect user routes
 * Checks if user is authenticated
 */
export const protectUser = async (req, res, next) => {
  try {
    const { userId } = req.auth;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - Please sign in",
      });
    }

    // Get user from Clerk
    const user = await clerkClient.users.getUser(userId);

    // Attach user info to request
    req.user = {
      id: userId,
      email: user.emailAddresses[0]?.emailAddress,
      name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
      image: user.imageUrl,
      role: user.privateMetadata?.role || "user",
    };

    next();
  } catch (error) {
    console.error("User auth error:", error);
    return res.status(500).json({
      success: false,
      message: "Error verifying user",
      error: error.message,
    });
  }
};

/**
 * Optional auth - doesn't block if no user
 * Used for routes that work for both authenticated and guest users
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const { userId } = req.auth;

    if (userId) {
      const user = await clerkClient.users.getUser(userId);
      req.user = {
        id: userId,
        email: user.emailAddresses[0]?.emailAddress,
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
        image: user.imageUrl,
        role: user.privateMetadata?.role || "user",
      };
    }

    next();
  } catch (error) {
    // Don't block request on error, just continue without user
    console.error("Optional auth error:", error);
    next();
  }
};
