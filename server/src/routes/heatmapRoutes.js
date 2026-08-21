import express from "express";
import {
  getHeatmapPoints,
  getHotspots,
  escalateCluster,
} from "../controllers/heatmapController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/points", getHeatmapPoints);
router.get("/hotspots", protect, authorize("admin"), getHotspots);
router.put("/escalate", protect, authorize("admin"), escalateCluster);

export default router;
