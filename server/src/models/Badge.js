import mongoose from "mongoose";

const badgeSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, default: "🏅" },
    criteria: {
      type: String,
      enum: ["count", "streak", "tier", "rank"],
      required: true,
    },
    activityType: {
      type: String,
      enum: ["report_waste", "complete_pickup", "sell_recyclables", null],
      default: null,
    },
    target: { type: Number, required: true },
  },
  { timestamps: true },
);

const Badge = mongoose.model("Badge", badgeSchema);
export default Badge;