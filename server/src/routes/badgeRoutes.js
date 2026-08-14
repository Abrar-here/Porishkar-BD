import express from "express";
import { getBadges } from "../controllers/badgeController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();
router.get("/", protect, getBadges);
export default router;