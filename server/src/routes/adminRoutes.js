import express from "express";
import { getCollectorPerformance } from "../controllers/adminController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/collector-performance", protect, getCollectorPerformance);

export default router;