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
  raiseDispute,
  getInvestigationDetails,
  getCollectorRoute,
  reorderRoute,
  resetRouteOrder,
  overridePriority,
  getPriorityQueue,
} from "../controllers/reportController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";
import { upload } from "../config/cloudinary.js";
import { proofUpload } from "../config/cloudinary.js";
import { completePickupWithProof } from "../controllers/reportController.js";

const router = express.Router();

// F01 — Abrar's waste issue reporting (no pickup date needed)
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

//Maisara: F08 Add route for collector to submit proof
router.patch(
  "/:reportId/complete",
  protect,
  authorize("collector"), // Ensure collector is authenticated
  proofUpload.single("proofImage"),
  completePickupWithProof,
);



router.put("/:id/cancel", protect, authorize("citizen"), cancelReport);
router.put("/:id/reschedule", protect, authorize("citizen"), rescheduleReport);
router.get("/available", protect, authorize("collector"), getAvailableReports);
router.put("/:id/accept", protect, authorize("collector"), acceptReport);
router.get("/assigned", protect, authorize("collector"), getAssignedReports);
// F06 — route view (collector sees own route, admin sees any collector's route)
router.get(
  "/route/:collectorId",
  protect,
  authorize("collector", "admin"),
  getCollectorRoute,
);

// F06 — supervisor reorders a collector's route
router.put(
  "/route/:collectorId/reorder",
  protect,
  authorize("admin"),
  reorderRoute,
);

// F06 — reset back to the algorithm's suggested (nearest-neighbor) order
router.put(
  "/route/:collectorId/reset",
  protect,
  authorize("admin"),
  resetRouteOrder,
);

router.post(
  "/:id/dispute",
  protect,
  authorize("citizen"),
  upload.array("image", 5),
  raiseDispute,
);
router.get(
  "/:id/investigate",
  protect,
  authorize("admin"), // <-- Allows Admin to review disputes
  getInvestigationDetails,
);

// Shared
router.get("/my", protect, getMyReports);
router.get("/", protect, authorize("admin"), getAllReports);

// F02: Issue Priority & Auto-Categorization Engine — must come before
// "/:id" below, otherwise Express would treat "priority-queue" as an :id
router.get(
  "/priority-queue",
  protect,
  authorize("admin"),
  getPriorityQueue,
);
router.put(
  "/:id/priority",
  protect,
  authorize("admin"),
  overridePriority,
);

router.get("/:id", protect, getReportById);

export default router;