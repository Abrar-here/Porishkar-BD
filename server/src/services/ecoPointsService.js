import PointActivity from "../models/PointActivity.js";
import Badge from "../models/Badge.js";
import UserBadge from "../models/UserBadge.js";
import User from "../models/User.js";
import { notifyUser, ALERT_TYPES } from "./notificationService.js";

// ─── Points awarded per activity ───
export const POINTS_TABLE = {
  report_waste: { label: "Report waste issue", points: 20 },
  complete_pickup: { label: "Complete pickup", points: 15 },
  sell_recyclables: { label: "Sell recyclables", points: 50 },
};

// ─── Tiers ───
const TIERS = [
  { name: "Bronze", min: 0 },
  { name: "Silver", min: 1000 },
  { name: "Gold", min: 1500 },
  { name: "Platinum", min: 2500 },
];

export const getTierInfo = (points) => {
  let current = TIERS[0];
  let next = null;
  for (let i = 0; i < TIERS.length; i++) {
    if (points >= TIERS[i].min) {
      current = TIERS[i];
      next = TIERS[i + 1] || null;
    }
  }
  return {
    tier: current.name,
    nextTier: next ? next.name : null,
    pointsToNext: next ? next.min - points : 0,
  };
};

// ─── Badge catalog ───
const BADGE_DEFINITIONS = [
  { key: "first_report", name: "First Report", description: "Submit your first waste report", icon: "📷", criteria: "count", activityType: "report_waste", target: 1 },
  { key: "recycler", name: "Recycler", description: "Sell recyclable materials for the first time", icon: "♻️", criteria: "count", activityType: "sell_recyclables", target: 1 },
  { key: "streak_master", name: "Streak Master", description: "Report waste 7 days in a row", icon: "🔥", criteria: "streak", activityType: null, target: 7 },
  { key: "community_hero", name: "Community Hero", description: "Complete 5 scheduled pickups", icon: "🧑‍🤝‍🧑", criteria: "count", activityType: "complete_pickup", target: 5 },
  { key: "top_ranked", name: "Top ranked", description: "Reach #1 on the all-time leaderboard", icon: "🏆", criteria: "rank", activityType: null, target: 1 },
  { key: "gold_tier", name: "Gold Tier", description: "Reach Gold tier (1,500 eco points)", icon: "🥇", criteria: "tier", activityType: null, target: 1500 },
];

// Always syncs the catalog to match BADGE_DEFINITIONS above, every startup
export const seedBadges = async () => {
  for (const def of BADGE_DEFINITIONS) {
    await Badge.findOneAndUpdate({ key: def.key }, { $set: def }, { upsert: true });
  }
};

// Internal helper — call this directly from wherever a real action happens.
// NOT exposed as an HTTP route on purpose.
export const awardPoints = async (userId, activityType) => {
  const def = POINTS_TABLE[activityType];
  if (!def) return null;

  const user = await User.findById(userId);
  if (!user) return null;

  if (activityType === "report_waste") {
    const today = new Date();
    const last = user.lastReportDate ? new Date(user.lastReportDate) : null;
    const daysSinceLast = last ? Math.floor((today - last) / (1000 * 60 * 60 * 24)) : null;
    if (daysSinceLast === 1) {
      user.reportStreak += 1;
    } else if (daysSinceLast === 0) {
      // same day — unchanged
    } else {
      user.reportStreak = 1;
    }
    user.lastReportDate = today;
  }

  user.ecoPoints += def.points;
  await user.save();

  const activity = await PointActivity.create({
    user: user._id,
    activityType,
    label: def.label,
    points: def.points,
    balanceAfter: user.ecoPoints,
  });

  await evaluateBadges(user);

  // F15: notify the user their points balance just went up
  await notifyUser(user._id, ALERT_TYPES.ECO_POINTS_CREDIT, {
    title: "You earned eco points!",
    message: `+${def.points} points for "${def.label}". Your new balance is ${user.ecoPoints}.`,
    link: "/eco-points",
  });

  return { activity, newBalance: user.ecoPoints };
};

// Re-evaluates every badge's progress for a user, unlocking any newly-earned ones.
export const evaluateBadges = async (user, { topRankAchieved = false } = {}) => {
  const badges = await Badge.find();

  for (const badge of badges) {
    let progress = 0;

    if (badge.criteria === "count") {
      progress = await PointActivity.countDocuments({
        user: user._id,
        activityType: badge.activityType,
      });
    } else if (badge.criteria === "streak") {
      progress = user.reportStreak || 0;
    } else if (badge.criteria === "tier") {
      progress = user.ecoPoints || 0;
    } else if (badge.criteria === "rank") {
      progress = topRankAchieved ? badge.target : 0;
    }

    const unlocked = progress >= badge.target;
    const existing = await UserBadge.findOne({ user: user._id, badge: badge._id });

    if (existing) {
      const newProgress = Math.max(existing.progress, progress);
      const newUnlocked = existing.unlocked || unlocked;
      if (newProgress !== existing.progress || newUnlocked !== existing.unlocked) {
        existing.progress = newProgress;
        existing.unlocked = newUnlocked;
        if (newUnlocked && !existing.unlockedAt) existing.unlockedAt = new Date();
        await existing.save();
      }
    } else {
      await UserBadge.create({
        user: user._id,
        badge: badge._id,
        progress,
        unlocked,
        unlockedAt: unlocked ? new Date() : null,
      });
    }
  }
};