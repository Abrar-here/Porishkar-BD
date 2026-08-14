import PointActivity from "../models/PointActivity.js";
import { POINTS_TABLE, getTierInfo } from "../services/ecoPointsService.js";

// @desc    Get the current user's eco points wallet
// @route   GET /api/ecopoints/wallet
// @access  Private
export const getWallet = async (req, res) => {
  try {
    const user = req.user;
    const tierInfo = getTierInfo(user.ecoPoints);

    const recentActivity = await PointActivity.find({ user: user._id })
      .sort({ createdAt: -1 })
      .limit(5);

    const waysToEarn = Object.entries(POINTS_TABLE).map(([key, val]) => ({
      activityType: key,
      label: val.label,
      points: val.points,
    }));

    res.status(200).json({
      ecoPoints: user.ecoPoints,
      tier: tierInfo.tier,
      nextTier: tierInfo.nextTier,
      pointsToNextTier: tierInfo.pointsToNext,
      waysToEarn,
      recentActivity,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Paginated full activity history
// @route   GET /api/ecopoints/history
// @access  Private
export const getHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const activities = await PointActivity.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await PointActivity.countDocuments({ user: req.user._id });

    res.status(200).json({
      activities,
      page,
      totalPages: Math.ceil(total / limit),
      totalActivities: total,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};