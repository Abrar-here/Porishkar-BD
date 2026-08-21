import express from "express";
import {
  getAnalyticsSummary,
  exportAnalyticsCsv,
} from "../controllers/analyticsController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/summary", protect, authorize("admin"), getAnalyticsSummary);
router.get("/export", protect, authorize("admin"), exportAnalyticsCsv);

export default router;
