import mongoose from "mongoose";

const pointActivitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    activityType: {
      type: String,
      enum: ["report_waste", "complete_pickup", "sell_recyclables"],
      required: true,
    },
    label: { type: String, required: true },
    points: { type: Number, required: true },
    balanceAfter: { type: Number, required: true },
  },
  { timestamps: true },
);

const PointActivity = mongoose.model("PointActivity", pointActivitySchema);
export default PointActivity;