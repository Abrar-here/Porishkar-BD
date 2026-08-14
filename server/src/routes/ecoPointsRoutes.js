import express from "express";
import { getWallet, getHistory } from "../controllers/ecoPointsController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();
router.get("/wallet", protect, getWallet);
router.get("/history", protect, getHistory);
export default router;
