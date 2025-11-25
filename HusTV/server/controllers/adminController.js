// controllers/adminController.js
import { clerkClient } from "@clerk/express";
import Subscription from "../models/Subscription.js";
import Video from "../models/Video.js";
import User from "../models/User.js";

// API to check if user is admin
export const isAdmin = async (req, res) => {
  res.json({ success: true, isAdmin: true });
};

// API to get dashboard data
export const getDashboardData = async (req, res) => {
  try {
    // Get all subscriptions
    const allSubscriptions = await Subscription.find({});
    const activeSubscriptions = await Subscription.find({ status: "Active" });

    // Calculate total revenue
    const totalRevenue = allSubscriptions.reduce(
      (acc, sub) => acc + sub.amount,
      0
    );

    // Get total users
    const totalUsers = await User.countDocuments();

    // Get active users (users with active subscriptions)
    const activeUsers = await User.countDocuments({
      subscriptionStatus: "active",
    });

    // Get total videos
    const totalVideos = await Video.countDocuments({ status: "published" });

    // Get most viewed videos
    const topVideos = await Video.find({ status: "published" })
      .sort({ view: -1 })
      .limit(10)
      .select("title view poster_path");

    // Get recent subscriptions
    const recentSubscriptions = await Subscription.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("plan");

    // Revenue by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const revenueByMonth = await Subscription.aggregate([
      {
        $match: {
          purchaseDate: { $gte: sixMonthsAgo },
          isPaid: true,
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$purchaseDate" },
            month: { $month: "$purchaseDate" },
          },
          totalRevenue: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
    ]);

    const dashboardData = {
      overview: {
        totalSubscriptions: allSubscriptions.length,
        activeSubscriptions: activeSubscriptions.length,
        totalRevenue: totalRevenue.toFixed(2),
        totalUsers,
        activeUsers,
        totalVideos,
      },
      topVideos,
      recentSubscriptions,
      revenueByMonth,
    };

    res.json({ success: true, dashboardData });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.json({ success: false, message: error.message });
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
    res.json({ success: false, message: error.message });
  }
};

// API to get all videos (admin view)
export const getAllVideos = async (req, res) => {
  try {
    const { status, page = 1, limit = 20, search } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { overview: { $regex: search, $options: "i" } },
      ];
    }

    const videos = await Video.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Video.countDocuments(filter);

    res.json({
      success: true,
      videos,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching videos:", error);
    res.json({ success: false, message: error.message });
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
    res.json({ success: false, message: error.message });
  }
};

// API to ban/unban user
export const toggleUserBan = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
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
    res.json({ success: false, message: error.message });
  }
};

// API to update video status (publish/unpublish)
export const updateVideoStatus = async (req, res) => {
  try {
    const { videoId } = req.params;
    const { status } = req.body;

    if (!["draft", "published", "private"].includes(status)) {
      return res.json({ success: false, message: "Invalid status" });
    }

    const video = await Video.findByIdAndUpdate(
      videoId,
      { status },
      { new: true }
    );

    if (!video) {
      return res.json({ success: false, message: "Video not found" });
    }

    res.json({
      success: true,
      message: `Video status updated to ${status}`,
      video,
    });
  } catch (error) {
    console.error("Error updating video status:", error);
    res.json({ success: false, message: error.message });
  }
};

// API to get revenue statistics
export const getRevenueStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const filter = { isPaid: true };
    if (startDate) filter.purchaseDate = { $gte: new Date(startDate) };
    if (endDate) {
      filter.purchaseDate = filter.purchaseDate || {};
      filter.purchaseDate.$lte = new Date(endDate);
    }

    const subscriptions = await Subscription.find(filter).populate("plan");

    const totalRevenue = subscriptions.reduce(
      (acc, sub) => acc + sub.amount,
      0
    );

    // Revenue by plan
    const revenueByPlan = {};
    subscriptions.forEach((sub) => {
      const planName = sub.plan.planName;
      if (!revenueByPlan[planName]) {
        revenueByPlan[planName] = {
          count: 0,
          revenue: 0,
        };
      }
      revenueByPlan[planName].count++;
      revenueByPlan[planName].revenue += sub.amount;
    });

    res.json({
      success: true,
      stats: {
        totalRevenue: totalRevenue.toFixed(2),
        totalSubscriptions: subscriptions.length,
        revenueByPlan,
      },
    });
  } catch (error) {
    console.error("Error fetching revenue stats:", error);
    res.json({ success: false, message: error.message });
  }
};
