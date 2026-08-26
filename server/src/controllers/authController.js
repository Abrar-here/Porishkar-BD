import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { sendSms } from "../services/smsService.js";

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    // 1. Basic validation — make sure required fields are present
    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        message: "Please provide name, email, phone, and password",
      });
    }

    // 1b. Only these roles can be self-registered through the public
    // form. "admin" is deliberately excluded — per the requirements
    // doc, municipality/admin accounts are created directly by the
    // super-admin, never through open registration.
    const SELF_REGISTERABLE_ROLES = [
      "citizen",
      "collector",
      "recycling_company",
    ];
    const requestedRole = role || "citizen";

    if (!SELF_REGISTERABLE_ROLES.includes(requestedRole)) {
      return res.status(403).json({
        message: "This role cannot be self-registered",
      });
    }

    // 2. Check if a user with this email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        message: "An account with this email already exists",
      });
    }

    // 3. Decide the initial status based on role
    //    Collectors and recycling companies need admin approval first
    let status = "active";
    if (
      requestedRole === "collector" ||
      requestedRole === "recycling_company"
    ) {
      status = "pending";
    }

    // 4. Create the user (password gets hashed automatically by the model)
    const user = await User.create({
      name,
      email,
      phone,
      password,
      role: requestedRole,
      status,
    });

    // 5. Respond with the new user's safe details (never the password)
    res.status(201).json({
      message: "Registration successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Log in a user
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate input
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide email and password" });
    }

    // 2. Find the user — explicitly include the password (it's select:false by default)
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // 3. Compare the submitted password against the stored hash
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // 4. Block suspended, banned, or not-yet-approved accounts.
    // "pending" applies to collectors and recycling companies who
    // haven't been reviewed by an admin yet, per the requirements doc.
    if (user.status === "suspended" || user.status === "banned") {
      return res
        .status(403)
        .json({ message: `Your account is ${user.status}` });
    }

    if (user.status === "pending") {
      return res.status(403).json({
        message:
          "Your account is pending admin approval. You'll be able to log in once it's reviewed.",
      });
    }

    // 5. Create a signed JWT containing the user's id and role
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN },
    );

    // 6. Send the token and safe user details
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get the currently logged-in user's profile
// @route   GET /api/auth/me
// @access  Private (requires token)
export const getMe = async (req, res) => {
  // req.user was attached by the protect middleware
  res.status(200).json({ user: req.user });
};

// @desc    Send a 6-digit OTP to the user's phone (valid for 5 minutes)
// @route   POST /api/auth/send-otp
// @access  Public
export const sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone)
      return res.status(400).json({ message: "Please provide a phone number" });
    const user = await User.findOne({ phone });
    if (!user)
      return res
        .status(404)
        .json({ message: "No account found with this phone number" });
    const otp = generateOtp();
    user.otp = otp;
    user.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();
    await sendSms(
      phone,
      `Your Porishkar-BD verification code is ${otp}. It expires in 5 minutes.`,
    );
    res.status(200).json({ message: "OTP sent successfully", otp });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Verify the OTP a user submits
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp)
      return res.status(400).json({ message: "Please provide phone and OTP" });
    const user = await User.findOne({ phone }).select("+otp +otpExpiresAt");
    if (!user)
      return res
        .status(404)
        .json({ message: "No account found with this phone number" });
    if (!user.otp || user.otp !== otp)
      return res.status(400).json({ message: "Invalid OTP" });
    if (user.otpExpiresAt < new Date())
      return res
        .status(400)
        .json({ message: "OTP has expired, please request a new one" });
    user.phoneVerified = true;
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    await user.save();
    res.status(200).json({ message: "Phone number verified successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Send a 6-digit OTP to reset a forgotten password (valid for 5 minutes)
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone)
      return res.status(400).json({ message: "Please provide a phone number" });
    const user = await User.findOne({ phone });
    if (!user)
      return res
        .status(404)
        .json({ message: "No account found with this phone number" });
    const otp = generateOtp();
    user.otp = otp;
    user.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();
    await sendSms(
      phone,
      `Your Porishkar-BD password reset code is ${otp}. It expires in 5 minutes.`,
    );
    res
      .status(200)
      .json({ message: "Password reset OTP sent successfully", otp });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Reset a user's password after verifying their OTP
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    const { phone, otp, newPassword } = req.body;
    if (!phone || !otp || !newPassword)
      return res
        .status(400)
        .json({ message: "Please provide phone, OTP, and a new password" });
    if (newPassword.length < 6)
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    const user = await User.findOne({ phone }).select("+otp +otpExpiresAt");
    if (!user)
      return res
        .status(404)
        .json({ message: "No account found with this phone number" });
    if (!user.otp || user.otp !== otp)
      return res.status(400).json({ message: "Invalid OTP" });
    if (user.otpExpiresAt < new Date())
      return res
        .status(400)
        .json({ message: "OTP has expired, please request a new one" });
    user.password = newPassword;
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    await user.save();
    res
      .status(200)
      .json({ message: "Password reset successfully. You can now log in." });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    List all collectors (id + name), for admin dropdowns like
//          the F06 route-selection page.
// @route   GET /api/auth/collectors
// @access  Private (admin)
export const getCollectors = async (req, res) => {
  try {
    const collectors = await User.find({ role: "collector" }).select(
      "name email phone",
    );
    res.status(200).json({ collectors });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Collector reports their current GPS position. Used as the
//          starting point for their route's nearest-neighbor ordering.
// @route   PUT /api/auth/location
// @access  Private (collector)
export const updateMyLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body;

    if (typeof lat !== "number" || typeof lng !== "number") {
      return res.status(400).json({
        message: "lat and lng are required and must be numbers",
      });
    }

    await User.findByIdAndUpdate(req.user._id, {
      currentLocation: { lat, lng, updatedAt: new Date() },
    });

    res.status(200).json({ message: "Location updated" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    List all users, optionally filtered by status or role, for
//          the admin's central user-management page.
// @route   GET /api/auth/users
// @access  Private (admin)
export const getAllUsers = async (req, res) => {
  try {
    const { status, role } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (role) filter.role = role;

    const users = await User.find(filter)
      .select("name email phone role status createdAt")
      .sort({ createdAt: -1 });

    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update a user's status — approve/reject a pending account,
//          or suspend/ban/reactivate any existing account. One
//          endpoint covers every status transition an admin can make.
// @route   PUT /api/auth/:userId/status
// @access  Private (admin)
export const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = [
      "active",
      "pending",
      "suspended",
      "banned",
      "rejected",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: `status must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // An admin can't accidentally suspend/ban/demote themselves or
    // another admin through this same panel — a real, if simple,
    // safeguard against locking out the platform's own administration.
    if (user.role === "admin") {
      return res.status(403).json({
        message: "Admin accounts cannot be modified through this panel",
      });
    }

    user.status = status;
    await user.save();

    res.status(200).json({
      message: `Account status updated to ${status}`,
      user: {
        id: user._id,
        name: user.name,
        status: user.status,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
