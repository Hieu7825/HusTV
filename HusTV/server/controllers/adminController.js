// controllers/adminController.js
import Subscription from "../models/Subscription.js";
import User from "../models/User.js";

// API to check if user is admin
export const isAdmin = async (req, res) => {
  res.json({ success: true, isAdmin: true });
};

// API to get dashboard data - Optimized for Dashboard.jsx
export const getDashboardData = async (req, res) => {
  try {
    // Get all subscriptions with plan details
    const activeSubscriptions = await Subscription.find({ status: "Active" })
      .populate("plan")
      .sort({ purchaseDate: -1 })
      .limit(6); // Only get 6 for display

    // Get total subscription count
    const totalSubscriptions = await Subscription.countDocuments();

    // Calculate total revenue from all subscriptions
    const revenueResult = await Subscription.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$amount" },
        },
      },
    ]);
    const totalRevenue =
      revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    // Get total users
    const totalUsers = await User.countDocuments();

    const dashboardData = {
      totalSubscriptions,
      totalRevenue,
      activeSubscriptions,
      totalUsers,
    };

    res.json({
      success: true,
      data: dashboardData,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// API to get all subscriptions with user info
export const getAllSubscriptions = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status) filter.status = status;

    const subscriptions = await Subscription.find(filter)
      .populate("plan")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // Format response with user data
    const formattedSubscriptions = subscriptions.map((sub) => ({
      ...sub.toObject(),
      user: {
        _id: sub.user,
        name: sub.userName,
        email: sub.userEmail,
      },
    }));

    const total = await Subscription.countDocuments(filter);

    res.json({
      success: true,
      subscriptions: formattedSubscriptions,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// API to get all users
export const getAllUsers = async (req, res) => {
  try {
    const { subscriptionStatus, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (subscriptionStatus) filter.subscriptionStatus = subscriptionStatus;

    const users = await User.find(filter)
      .populate("currentSubscription")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      users,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// API to ban/unban user
export const toggleUserBan = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.isBanned = !user.isBanned;
    await user.save();

    res.json({
      success: true,
      message: `User ${user.isBanned ? "banned" : "unbanned"} successfully`,
      isBanned: user.isBanned,
    });
  } catch (error) {
    console.error("Error toggling user ban:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
