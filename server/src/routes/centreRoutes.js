import express from "express";
import {
  getAllCentres,
  getCentreById,
  addCentre,
  updateCentre,
  deleteCentre,
  rateCentre,
  getCentreReviews,
} from "../controllers/centreController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public — anyone (even logged out) can browse centres and view details.
// This matches the requirement: "publicly accessible" style browsing,
// same spirit as the heatmap being public.
router.get("/", getAllCentres);
router.get("/:id", getCentreById);
router.get("/:id/reviews", getCentreReviews);

// Citizen — submit a rating + optional written review after visiting a centre
router.post("/:id/rate", protect, authorize("citizen"), rateCentre);

// Admin only — manage the centre directory
router.post("/", protect, authorize("admin"), addCentre);
router.put(
  "/:id",
  protect,
  authorize("admin", "recycling_company"),
  updateCentre,
);
router.delete("/:id", protect, authorize("admin"), deleteCentre);

export default router;
