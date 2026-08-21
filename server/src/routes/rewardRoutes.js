import express from "express";

import {

    createReward,
    getRewards,
    updateReward,
    deleteReward

} from "../controllers/rewardController.js";


import { protect } from "../middlewares/authMiddleware.js";


const router = express.Router();



// ======================================
// Create Reward (Admin)
// ======================================

router.post(

    "/",

    protect,

    createReward

);



// ======================================
// Get Available Rewards
// ======================================

router.get(

    "/",

    protect,

    getRewards

);



// ======================================
// Update Reward (Admin)
// ======================================

router.patch(

    "/:id",

    protect,

    updateReward

);



// ======================================
// Delete Reward (Admin)
// ======================================

router.delete(

    "/:id",

    protect,

    deleteReward

);



export default router;