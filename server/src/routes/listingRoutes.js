import express from "express";

import {
  createListing,
  getAllListings,
  getListingById,
  getMyListings,
  updateListing,
  deleteListing,
} from "../controllers/listingController.js";

import { protect } from "../middlewares/authMiddleware.js";
import { marketplaceUpload } from "../config/cloudinary.js";

const router = express.Router();

// Get all active listings
router.get("/", getAllListings);

// Get logged-in user's listings
router.get("/my", protect, getMyListings);

// Get one listing
router.get("/:id", getListingById);

// Create a listing with maximum 4 images
router.post(
  "/",
  protect,
  marketplaceUpload.array("images", 4),
  createListing
);

// Update a listing with maximum 4 new images
router.patch(
  "/:id",
  protect,
  marketplaceUpload.array("images", 4),
  updateListing
);

// Delete a listing
router.delete("/:id", protect, deleteListing);

export default router;