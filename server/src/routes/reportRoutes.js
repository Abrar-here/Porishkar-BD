import express from "express";
import {
  createReport,
  createPickupRequest,
  getMyReports,
  getReportById,
  getAllReports,
  cancelReport,
  rescheduleReport,
  getAvailableReports,
  acceptReport,
  getAssignedReports,
} from "../controllers/reportController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";
import { upload } from "../config/cloudinary.js";

const router = express.Router();

// F01 — Sakir's waste issue reporting (no pickup date needed)
router.post(
  "/",
  protect,
  authorize("citizen"),
  upload.array("images", 5),
  createReport,
);

// F05 — Friend's pickup scheduling (requires pickup date/time)
router.post(
  "/pickup",
  protect,
  authorize("citizen"),
  upload.array("images", 5),
  createPickupRequest,
);
router.put("/:id/cancel", protect, authorize("citizen"), cancelReport);
router.put("/:id/reschedule", protect, authorize("citizen"), rescheduleReport);
router.get("/available", protect, authorize("collector"), getAvailableReports);
router.put("/:id/accept", protect, authorize("collector"), acceptReport);
router.get("/assigned", protect, authorize("collector"), getAssignedReports);

// Shared
router.get("/my", protect, getMyReports);
router.get("/", protect, authorize("admin"), getAllReports);
router.get("/:id", protect, getReportById);

export default router;
