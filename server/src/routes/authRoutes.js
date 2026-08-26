import express from "express";
import {
  registerUser,
  loginUser,
  getMe,
  sendOtp,
  verifyOtp,
  forgotPassword,
  resetPassword,
  getCollectors,
  updateMyLocation,
  getAllUsers,
  updateUserStatus,
} from "../controllers/authController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getMe);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.get("/collectors", protect, authorize("admin"), getCollectors);
router.put("/location", protect, authorize("collector"), updateMyLocation);
router.get("/users", protect, authorize("admin"), getAllUsers);
router.put("/users/:id/status", protect, authorize("admin"), updateUserStatus);

router.stack.forEach((r) => console.log(r.route?.path));

export default router;
