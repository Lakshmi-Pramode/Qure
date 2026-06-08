/**
 * ====================================================
 * FIREBASE ADMIN SDK — Server-side Setup
 * ====================================================
 *
 * 📚 WHAT IS THIS?
 * Firebase Admin SDK runs on YOUR SERVER (not the browser).
 * Its job is to VERIFY that the Google login token sent by
 * the frontend is real and not forged by a hacker.
 *
 * 🔒 WHY DO WE NEED IT?
 * When a user clicks "Sign in with Google" on your website:
 *   1. Firebase (client-side) opens Google's popup
 *   2. User signs in → Firebase gives a "token" (a long string)
 *   3. Frontend sends this token to YOUR backend
 *   4. Backend uses Firebase ADMIN to verify: "Is this token real?"
 *   5. If yes → create/find user in MongoDB → return JWT
 *
 * Without this verification, anyone could send fake tokens!
 *
 * 🔑 CREDENTIALS:
 * We need 3 values from your Firebase project's "Service Account":
 *   - FIREBASE_PROJECT_ID: Your project name (e.g., "qure-12345")
 *   - FIREBASE_CLIENT_EMAIL: A service email Firebase creates for you
 *   - FIREBASE_PRIVATE_KEY: A secret key for signing (keep this SECRET!)
 *
 * You get these from: Firebase Console → Project Settings → Service Accounts
 *   → Click "Generate New Private Key" → Download the JSON file
 *   → Copy the 3 values into your .env file
 * 
 * 📝 NOTE ON LAZY INITIALIZATION:
 * We use a "lazy init" pattern here — Firebase Admin is only initialized
 * when it's first used (not when the file is imported). This ensures
 * that dotenv has loaded the .env file before we try to read the variables.
 */

import admin from "firebase-admin";

let initialized = false;

/**
 * Ensures Firebase Admin is initialized before use.
 * Called automatically before any Firebase Admin operation.
 * Uses "lazy initialization" — only runs once, on first call.
 */
function ensureInitialized() {
  if (initialized) return;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    console.error(
      "⚠️  Firebase Admin: Missing FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, or FIREBASE_PRIVATE_KEY in .env"
    );
    return;
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });

  initialized = true;
  console.log("✅ Firebase Admin initialized successfully");
}

export { ensureInitialized };
export default admin;
