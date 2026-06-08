import User from "../models/User.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";
import admin, { ensureInitialized } from "../config/firebaseAdmin.js";

// ==========================
// REGISTER USER
// ==========================
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Please provide name, email, and password",
      });
    }

    const emailRegex = /\S+@\S+\.\S+/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Invalid email format",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(
      password,
      salt
    );

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "patient",
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user),
    });

  } catch (error) {
    console.error("REGISTER ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// ==========================
// LOGIN USER / ADMIN
// ==========================
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("=================================");
    console.log("LOGIN ATTEMPT");
    console.log("Entered Email:", email);
    console.log("Entered Password:", password);
    console.log(
      "ENV Admin Email:",
      process.env.ADMIN_EMAIL
    );
    console.log(
      "ENV Admin Password:",
      process.env.ADMIN_PASSWORD
    );
    console.log("=================================");

    if (!email || !password) {
      return res.status(400).json({
        message: "Please provide email and password",
      });
    }

    // ==========================
    // ADMIN LOGIN
    // ==========================
    if (
      email.trim() ===
        process.env.ADMIN_EMAIL?.trim() &&
      password.trim() ===
        process.env.ADMIN_PASSWORD?.trim()
    ) {
      console.log("ADMIN LOGIN SUCCESS");

      return res.status(200).json({
        _id: "admin",
        name: "Qure Admin",
        email: process.env.ADMIN_EMAIL,
        role: "admin",
        token: generateToken({
          _id: "admin",
          role: "admin",
        }),
      });
    }

    // ==========================
    // PATIENT LOGIN
    // ==========================
    const user = await User.findOne({ email });

    if (
      user &&
      (await bcrypt.compare(
        password,
        user.password
      ))
    ) {
      console.log("PATIENT LOGIN SUCCESS");

      return res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user),
      });
    }

    console.log("LOGIN FAILED");

    return res.status(401).json({
      message: "Invalid email or password",
    });

  } catch (error) {
    console.error("LOGIN ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// ==========================
// GOOGLE LOGIN
// ==========================
/**
 * 📚 HOW GOOGLE LOGIN WORKS (Backend Side):
 *
 * 1. Frontend sends us a Firebase "ID Token" (a long encrypted string)
 *    This token was generated when the user signed in via Google popup
 *
 * 2. We use Firebase Admin SDK to VERIFY this token:
 *    - Is it real? (not forged)
 *    - Is it expired? (tokens have an expiry time)
 *    - Who does it belong to? (we get the user's email, name, photo)
 *
 * 3. We check our MongoDB:
 *    - Does a user with this Google ID already exist? → Log them in
 *    - Does a user with this email exist (registered via email/password)? → Link the Google account
 *    - No user found? → Create a new user
 *
 * 4. We return OUR OWN JWT token (same as normal login)
 *    The frontend stores this JWT and uses it for all future API calls
 */
export const googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        message: "Google ID token is required",
      });
    }

    // STEP 1: Initialize Firebase Admin (lazy — only runs once)
    ensureInitialized();

    // STEP 2: Verify the Firebase token
    // This calls Firebase servers to confirm the token is legitimate
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    // decodedToken now contains:
    // - uid: Firebase unique user ID
    // - email: User's Google email
    // - name: User's display name
    // - picture: URL to profile photo
    const { uid, email, name, picture } = decodedToken;

    // STEP 2: Check if this Google user already exists in our database
    let user = await User.findOne({ googleId: uid });

    if (!user) {
      // STEP 2b: Maybe they registered with email/password using the same email?
      user = await User.findOne({ email });

      if (user) {
        // Link their Google account to existing account
        user.googleId = uid;
        user.avatar = picture || user.avatar;
        user.authProvider = user.password ? user.authProvider : "google";
        await user.save();
      } else {
        // STEP 2c: Brand new user — create account
        user = await User.create({
          name: name || "Google User",
          email,
          googleId: uid,
          avatar: picture || "",
          role: "patient",
          authProvider: "google",
          // No password! Google handles authentication
        });
      }
    }

    // STEP 3: Return our own JWT token (same response format as normal login)
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      token: generateToken(user),
    });
  } catch (error) {
    console.error("GOOGLE LOGIN ERROR:", error);

    if (error.code === "auth/id-token-expired") {
      return res.status(401).json({
        message: "Google token expired. Please sign in again.",
      });
    }

    res.status(500).json({
      message: "Google login failed. Please try again.",
    });
  }
};