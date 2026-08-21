import express from "express";

import {

    getMerchants,

    createMerchant,

    updateMerchant,

    deleteMerchant

} from "../controllers/merchantController.js";


import { protect } from "../middlewares/authMiddleware.js";


const router = express.Router();



// Public merchant directory

router.get(

    "/",

    getMerchants

);



// Admin merchant management

router.post(

    "/",

    protect,

    createMerchant

);



router.put(

    "/:id",

    protect,

    updateMerchant

);



router.delete(

    "/:id",

    protect,

    deleteMerchant

);



export default router;