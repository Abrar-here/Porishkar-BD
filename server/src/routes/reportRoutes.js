import express from "express";
import {
  createReport,
  getMyReports,
  getAllReports,
  getReportById,
  getAvailableReports,
  acceptReport,
  rescheduleReport,
  cancelReport,
  getAssignedReports,
} from "../controllers/reportController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";
import { upload } from "../config/cloudinary.js";

const router = express.Router();

// 1. POST Routes
router.post(
  "/",
  protect,
  authorize("citizen"),
  upload.array("images", 5),
  createReport
);

// 2. SPECIFIC GET ROUTES (MUST BE BEFORE /:id !!!)
router.get("/my", protect, getMyReports);
router.get("/available", protect, authorize("collector"), getAvailableReports); // <--- MUST BE ABOVE /:id
router.get("/", protect, authorize("admin"), getAllReports);
router.get("/assigned", protect, authorize("collector"), getAssignedReports);

// 3. ACTION PUT ROUTES
router.put("/:id/cancel", protect, authorize("citizen"), cancelReport);
router.put("/:id/reschedule", protect, authorize("citizen"), rescheduleReport);
router.put("/:id/accept", protect, authorize("collector"), acceptReport);

// 4. GENERIC PARAMETER ROUTE (MUST BE AT THE VERY BOTTOM OF GET ROUTES)
router.get("/:id", protect, getReportById); // <--- MUST BE LAST

export default router;