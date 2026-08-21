import mongoose from "mongoose";

// One document per (user, alert type) pair. If no document exists for
// a given user+type, notificationService.js treats that as "both
// channels enabled" — so users don't need every row pre-created,
// only the ones they've actually changed from the default.
const notificationPreferenceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "report_status_update",
        "eco_points_credit",
        "pickup_confirmation",
        "new_assignment",
        "route_update",
      ],
      required: true,
    },
    inApp: { type: Boolean, default: true },
    email: { type: Boolean, default: true },
  },
  { timestamps: true },
);

notificationPreferenceSchema.index({ user: 1, type: 1 }, { unique: true });

const NotificationPreference = mongoose.model(
  "NotificationPreference",
  notificationPreferenceSchema,
);
export default NotificationPreference;