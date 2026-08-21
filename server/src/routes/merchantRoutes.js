// import express from "express";

// import {

//     createMerchant,
//     getMerchants,
//     getAllMerchants,
//     updateMerchant,
//     deleteMerchant

// } from "../controllers/merchantController.js";


// import { protect } from "../middlewares/authMiddleware.js";

// import { adminOnly } from "../middlewares/adminMiddleware.js";



// const router = express.Router();




// // Citizen view directory

// router.get(

//     "/",

//     protect,

//     getMerchants

// );





// // Admin create

// router.post(

//     "/",

//     protect,

//     adminOnly,

//     createMerchant

// );





// // Admin view all

// router.get(

//     "/admin/all",

//     protect,

//     adminOnly,

//     getAllMerchants

// );





// // Admin update

// router.put(

//     "/:id",

//     protect,

//     adminOnly,

//     updateMerchant

// );





// // Admin delete

// router.delete(

//     "/:id",

//     protect,

//     adminOnly,

//     deleteMerchant

// );



// export default router;