// ─── F15: In-App & Email Notification Centre ──────────────
import Notification from "../models/Notification.js";
import NotificationPreference from "../models/NotificationPreference.js";
import User from "../models/User.js";
import { sendEmail } from "./emailService.js";

// The 5 alert types actually wired up in this version (bid alerts,
// reward redemption, saved-search matches, and the daily collector
// summary are out of scope — see project notes).
export const ALERT_TYPES = {
  REPORT_STATUS_UPDATE: "report_status_update",
  ECO_POINTS_CREDIT: "eco_points_credit",
  PICKUP_CONFIRMATION: "pickup_confirmation",
  NEW_ASSIGNMENT: "new_assignment",
  ROUTE_UPDATE: "route_update",
};

// Human-readable labels for the settings page toggles.
export const ALERT_LABELS = {
  report_status_update: "Report status updates",
  eco_points_credit: "Eco Point credit notices",
  pickup_confirmation: "Pickup confirmations",
  new_assignment: "New assignment pings",
  route_update: "Route update alerts",
};

// Central function — call this from anywhere a notification-worthy
// event happens. Checks the user's per-type in-app/email preferences
// (defaulting to "both on" if they've never touched that setting),
// creates the in-app notification if enabled, and sends the email if
// enabled. Never throws — a notification failure should never block
// the actual action (report accepted, points earned, etc.) that
// triggered it.
export const notifyUser = async (
  userId,
  type,
  { title, message, link = null, emailHtml = null },
) => {
  try {
    const pref = await NotificationPreference.findOne({ user: userId, type });
    const inAppEnabled = pref ? pref.inApp : true;
    const emailEnabled = pref ? pref.email : true;

    if (inAppEnabled) {
      await Notification.create({ user: userId, type, title, message, link });
    }

    if (emailEnabled) {
      const user = await User.findById(userId);
      if (user?.email) {
        await sendEmail({
          to: user.email,
          subject: title,
          html: emailHtml || `<p>${message}</p>`,
        });
      }
    }
  } catch (error) {
    console.error(`notifyUser failed (type: ${type}):`, error.message);
  }
};