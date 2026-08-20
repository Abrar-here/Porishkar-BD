
import mongoose from "mongoose";

const userBadgeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    badge: { type: mongoose.Schema.Types.ObjectId, ref: "Badge", required: true },
    progress: { type: Number, default: 0 },
    unlocked: { type: Boolean, default: false },
    unlockedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

// One badge-progress record per user per badge
userBadgeSchema.index({ user: 1, badge: 1 }, { unique: true });

const UserBadge = mongoose.model("UserBadge", userBadgeSchema);
export default UserBadge;