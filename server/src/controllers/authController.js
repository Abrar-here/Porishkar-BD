import User from "../models/User.js";
import jwt from "jsonwebtoken";

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
    if (role === "collector" || role === "recycling_company") {
      status = "pending";
    }

    // 4. Create the user (password gets hashed automatically by the model)
    const user = await User.create({
      name,
      email,
      phone,
      password,
      role: role || "citizen",
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

    // 4. Block suspended or banned accounts
    if (user.status === "suspended" || user.status === "banned") {
      return res
        .status(403)
        .json({ message: `Your account is ${user.status}` });
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
