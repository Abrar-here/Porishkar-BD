import express from "express";


import {
  createBid,
  getListingBids,
  getMyBids,
  acceptBid,
  rejectBid,
} from "../controllers/bidController.js";


import { protect } from "../middlewares/authMiddleware.js";


const router = express.Router();



// Buyer places a bid
router.post(
  "/",
  protect,
  createBid
);



// Buyer views own bids
router.get(
  "/my",
  protect,
  getMyBids
);



// Seller views bids for a listing
router.get(
  "/listing/:listingId",
  protect,
  getListingBids
);



// Seller accepts a bid
router.patch(
  "/:id/accept",
  protect,
  acceptBid
);



// Seller rejects a bid
router.patch(
  "/:id/reject",
  protect,
  rejectBid
);



export default router;