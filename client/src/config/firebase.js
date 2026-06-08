/**
 * ====================================================
 * FIREBASE CLIENT CONFIG — Browser-side Setup
 * ====================================================
 *
 * 📚 WHAT IS THIS?
 * This file initializes Firebase in the BROWSER (client-side).
 * It connects your React app to your Firebase project so you can
 * use Firebase Authentication (Google sign-in popup).
 *
 * 🔑 HOW TO GET THESE VALUES:
 * 1. Go to https://console.firebase.google.com
 * 2. Create a new project (name it "Qure" or anything)
 * 3. Click the web icon (</>) to add a web app
 * 4. Firebase will show you a config object — copy the values below
 *
 * 🔒 ARE THESE SECRET?
 * NO! These values are safe to expose in client-side code.
 * They only IDENTIFY your Firebase project (like a mailing address).
 * The REAL security is on the server (Firebase Admin SDK verifies tokens).
 *
 * 📦 WHAT WE EXPORT:
 * - auth: The Firebase Auth instance (used to sign in/sign out)
 * - googleProvider: Pre-configured Google login provider
 */

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// ⚠️ REPLACE THESE with your actual Firebase project values!
// Get them from: Firebase Console → Project Settings → Your Apps → Config
const firebaseConfig = {
  apiKey: "AIzaSyAFj_9Nd2DVXFoTZIWuW8TuxzYfOmxxra8",
  authDomain: "qure-4ef7b.firebaseapp.com",
  projectId: "qure-4ef7b",
  storageBucket: "qure-4ef7b.firebasestorage.app",
  messagingSenderId: "272911361360",
  appId: "1:272911361360:web:104c015518b7d670aab855",
  measurementId: "G-2RDT4J3V03"
};

// Initialize Firebase — this connects your app to your Firebase project
const app = initializeApp(firebaseConfig);

// Get the Auth service — this lets us sign in/sign out users
export const auth = getAuth(app);

// Configure Google as a login provider
// When we call signInWithPopup(auth, googleProvider), it opens Google's login popup
export const googleProvider = new GoogleAuthProvider();
