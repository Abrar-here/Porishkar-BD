import User from "../models/User.js";
import PointActivity from "../models/PointActivity.js";
import { evaluateBadges } from "../services/ecoPointsService.js";

const getDateRange = (period) => {
  const now = new Date();
  if (period === "weekly") {
    const start = new Date(now);
    start.setDate(now.getDate() - 7);
    return start;
  }
  if (period === "monthly") {
    const start = new Date(now);
    start.setMonth(now.getMonth() - 1);
    return start;
  }
  return null;
};

// @desc    Ranked leaderboard for a given period
// @route   GET /api/leaderboard?period=weekly|monthly|alltime
// @access  Private
export const getLeaderboard = async (req, res) => {
  try {
    const period = req.query.period || "alltime";
    if (!["weekly", "monthly", "alltime"].includes(period)) {
      return res.status(400).json({ message: "period must be weekly, monthly, or alltime" });
    }

    let ranked;

    if (period === "alltime") {
      const users = await User.find({ role: "citizen" })
        .select("name ecoPoints")
        .sort({ ecoPoints: -1 })
        .limit(50);
      ranked = users.map((u) => ({ userId: u._id, name: u.name, points: u.ecoPoints }));
    } else {
      const startDate = getDateRange(period);
      const results = await PointActivity.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: "$user", points: { $sum: "$points" } } },
        { $sort: { points: -1 } },
        { $limit: 50 },
      ]);
      const userIds = results.map((r) => r._id);
      const users = await User.find({ _id: { $in: userIds } }).select("name");
      const nameMap = Object.fromEntries(users.map((u) => [u._id.toString(), u.name]));
      ranked = results.map((r) => ({
        userId: r._id,
        name: nameMap[r._id.toString()] || "Unknown",
        points: r.points,
      }));
    }

    const leaderboard = ranked.map((entry, i) => ({ rank: i + 1, ...entry }));
    const myEntry = leaderboard.find((e) => e.userId.toString() === req.user._id.toString());

    // Unlock the "Top ranked" badge if this user is #1 on the all-time board
    if (period === "alltime" && myEntry && myEntry.rank === 1) {
      const me = await User.findById(req.user._id);
      await evaluateBadges(me, { topRankAchieved: true });
    }

    res.status(200).json({
      period,
      leaderboard,
      myRank: myEntry ? myEntry.rank : null,
      myPoints: myEntry ? myEntry.points : 0,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};