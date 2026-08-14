import Badge from "../models/Badge.js";
import UserBadge from "../models/UserBadge.js";

// @desc    Get all badges with this user's unlocked status and progress
// @route   GET /api/badges
// @access  Private
export const getBadges = async (req, res) => {
  try {
    const badges = await Badge.find();
    const userBadges = await UserBadge.find({ user: req.user._id });
    const userBadgeMap = Object.fromEntries(userBadges.map((ub) => [ub.badge.toString(), ub]));

    const result = badges.map((badge) => {
      const ub = userBadgeMap[badge._id.toString()];
      return {
        key: badge.key,
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
        target: badge.target,
        progress: ub ? ub.progress : 0,
        unlocked: ub ? ub.unlocked : false,
        unlockedAt: ub ? ub.unlockedAt : null,
      };
    });

    res.status(200).json({
      totalBadges: result.length,
      unlockedCount: result.filter((b) => b.unlocked).length,
      badges: result,
      inProgress: result.filter((b) => !b.unlocked && b.progress > 0),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};