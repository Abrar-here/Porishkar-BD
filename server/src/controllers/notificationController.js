import Notification from "../models/Notification.js";
import NotificationPreference from "../models/NotificationPreference.js";
import { ALERT_TYPES, ALERT_LABELS } from "../services/notificationService.js";

// @desc    Get the current user's notifications, newest first
// @route   GET /api/notifications
// @access  Private
export const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      user: req.user._id,
      read: false,
    });

    res.status(200).json({ notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Mark a single notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    notification.read = true;
    await notification.save();

    res.status(200).json({ message: "Marked as read", notification });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Mark all of the current user's notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, read: false },
      { read: true },
    );

    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get the current user's notification preferences for every
//          alert type — includes types they've never touched, showing
//          the default (both channels on) for those.
// @route   GET /api/notifications/preferences
// @access  Private
export const getPreferences = async (req, res) => {
  try {
    const saved = await NotificationPreference.find({ user: req.user._id });
    const savedMap = Object.fromEntries(saved.map((p) => [p.type, p]));

    const preferences = Object.values(ALERT_TYPES).map((type) => ({
      type,
      label: ALERT_LABELS[type],
      inApp: savedMap[type] ? savedMap[type].inApp : true,
      email: savedMap[type] ? savedMap[type].email : true,
    }));

    res.status(200).json({ preferences });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update the in-app/email toggle for one alert type
// @route   PUT /api/notifications/preferences/:type
// @access  Private
export const updatePreference = async (req, res) => {
  try {
    const { type } = req.params;
    const { inApp, email } = req.body;

    if (!Object.values(ALERT_TYPES).includes(type)) {
      return res.status(400).json({ message: "Unknown alert type" });
    }

    const preference = await NotificationPreference.findOneAndUpdate(
      { user: req.user._id, type },
      {
        $set: {
          ...(typeof inApp === "boolean" ? { inApp } : {}),
          ...(typeof email === "boolean" ? { email } : {}),
        },
      },
      { new: true, upsert: true },
    );

    res.status(200).json({ message: "Preference updated", preference });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};