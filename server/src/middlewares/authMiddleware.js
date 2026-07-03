import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Verifies the JWT and attaches the user to the request
export const protect = async (req, res, next) => {
  try {
    let token;

    // 1. Look for the token in the Authorization header: "Bearer <token>"
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // 2. If there's no token, reject
    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    // 3. Verify the token's signature and decode its payload
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Fetch the user (minus password) and attach to the request
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res
        .status(401)
        .json({ message: "Not authorized, user not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};

// Restricts a route to specific roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. This route is restricted to: ${roles.join(", ")}`,
      });
    }
    next();
  };
};
