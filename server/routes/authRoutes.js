import express from "express";
import {
  registerUser,
  loginUser,
  googleLogin,
} from "../controllers/authController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();


// ======================
// AUTH ROUTES
// ======================
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/google", googleLogin); // NEW: Google OAuth login


// ======================
// TEST / PROTECTED ROUTE
// ======================
// (You can remove later, just for testing JWT)
router.get("/profile", protect, (req, res) => {
  res.status(200).json({
    message: "Profile accessed successfully",
    user: req.user,
  });
});

export default router;