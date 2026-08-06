import express from "express";
import {
  createReport,
  getMyReports,
  getReportById,
  getAllReports,
} from "../controllers/reportController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";
import { upload } from "../config/cloudinary.js";

const router = express.Router();

// upload.array('images', 5) reads up to 5 files from the 'images' field
// then passes them to createReport via req.files
router.post(
  "/",
  protect,
  authorize("citizen"),
  upload.array("images", 5),
  createReport,
);
router.get("/my", protect, getMyReports);
router.get("/", protect, authorize("admin"), getAllReports);
router.get("/:id", protect, getReportById);

export default router;
