import express from "express";

import {
    redeemReward,
    getMyRedemptions
} from "../controllers/redemptionController.js";

import { protect } from "../middlewares/authMiddleware.js";


const router = express.Router();



// ================================
// Redeem Reward
// User uses Eco Points to redeem a reward
// ================================

router.post(
    "/redeem",
    protect,
    redeemReward
);



// ================================
// Get My Redemption History
// ================================

router.get(
    "/my",
    protect,
    getMyRedemptions
);



export default router;