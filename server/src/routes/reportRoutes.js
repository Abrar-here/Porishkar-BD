import express from "express";
import {
  createReport,
  getMyReports,
  getReportById,
  getAllReports,
} from "../controllers/reportController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

// All routes require a valid token
router.post("/", protect, authorize("citizen"), createReport);
router.get("/my", protect, getMyReports);
router.get("/", protect, authorize("admin"), getAllReports);
router.get("/:id", protect, getReportById);

export default router;
