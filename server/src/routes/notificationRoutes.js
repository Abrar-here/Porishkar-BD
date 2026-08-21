import express from "express";
import {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  getPreferences,
  updatePreference,
} from "../controllers/notificationController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Preferences routes come before "/:id/read" so Express doesn't try
// to match "preferences" as an :id
router.get("/preferences", protect, getPreferences);
router.put("/preferences/:type", protect, updatePreference);

router.get("/", protect, getMyNotifications);
router.put("/read-all", protect, markAllAsRead);
router.put("/:id/read", protect, markAsRead);

export default router;