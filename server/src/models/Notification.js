import mongoose from "mongoose";

// One document per in-app notification actually delivered to a user
// (i.e. only created if that user has in-app notifications enabled
// for this alert type — see notificationService.js).
const notificationSchema = new mongoose.Schema(
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
    title: { type: String, required: true },
    message: { type: String, required: true },
    // optional — where clicking the notification should take the user,
    // e.g. "/my-reports" or a specific report id page
    link: { type: String, default: null },
    read: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;