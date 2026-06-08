/**
 * ====================================================
 * USER MODEL — Updated for Google Login
 * ====================================================
 *
 * 📚 WHAT CHANGED?
 * Before: Every user MUST have a password (email + password login only)
 * After:  Users can sign up via Google (no password needed)
 *
 * 🔑 KEY CHANGES:
 *   1. password: Now optional (required: false)
 *      - Email/password users still have passwords
 *      - Google users don't need one (Google handles their auth)
 *
 *   2. googleId: Stores the unique Google account ID
 *      - This is how we identify "has this Google user signed up before?"
 *      - If someone logs in with Google and we find their googleId → existing user
 *      - If not found → create new user
 *
 *   3. avatar: Stores the Google profile photo URL
 *      - Google provides a profile picture, we save it for display
 *
 *   4. authProvider: Tracks HOW the user signed up ("local" or "google")
 *      - Helps us know if a user can reset their password
 *      - Google users can't reset passwords (they don't have one!)
 */

import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      // Changed from required: true → not required
      // Google users won't have a password
      required: false,
      minlength: 6,
    },

    role: {
      type: String,
      enum: ["patient", "admin"],
      default: "patient",
    },

    // NEW: Google OAuth fields
    googleId: {
      type: String,
      default: null,
    },

    avatar: {
      type: String,
      default: "",
    },

    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;