import jwt from "jsonwebtoken";

/**
 * Admin-only auth middleware.
 * Verifies JWT and checks role === "admin".
 * Separate from the patient `protect` middleware because
 * the admin token uses _id: "admin" (not a real MongoDB ObjectId).
 */
export const adminProtect = (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        message: "Not authorized, no token",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    if (decoded.role !== "admin") {
      return res.status(403).json({
        message: "Admin access only",
      });
    }

    // Attach decoded admin info to request
    req.admin = {
      id: decoded.id,
      role: decoded.role,
    };

    next();
  } catch (error) {
    console.error("ADMIN AUTH ERROR:", error.message);
    res.status(401).json({
      message: "Not authorized, token failed",
    });
  }
};
