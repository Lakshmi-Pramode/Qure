/**
 * ====================================================
 * LOGIN PAGE — Updated with Google Sign-In
 * ====================================================
 *
 * 📚 WHAT'S NEW?
 * Added a "Sign in with Google" button below the login form.
 * 
 * 🔄 HOW THE GOOGLE LOGIN FLOW WORKS:
 *
 *   [User clicks "Sign in with Google"]
 *          ↓
 *   [Firebase opens Google's login popup]
 *          ↓
 *   [User picks their Google account & signs in]
 *          ↓
 *   [Firebase returns: user info + ID token]
 *          ↓
 *   [We send the ID token to our backend: POST /api/auth/google]
 *          ↓
 *   [Backend verifies token → finds/creates user → returns JWT]
 *          ↓
 *   [We store the JWT in localStorage → redirect to Dashboard]
 *
 * This is the same end result as email/password login,
 * just with Google handling the authentication part!
 */

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";

// Import Firebase auth utilities
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../config/firebase";

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  // Normal email/password login (unchanged)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await API.post("/auth/login", formData);
      const stored = { user: { _id: res.data._id, name: res.data.name, email: res.data.email, role: res.data.role, avatar: res.data.avatar }, token: res.data.token };
      localStorage.setItem("userInfo", JSON.stringify(stored));
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * 🔥 GOOGLE LOGIN HANDLER
   *
   * Step by step:
   * 1. signInWithPopup() → Opens Google's login popup window
   * 2. User signs in with their Google account
   * 3. Firebase returns the result (user info + credentials)
   * 4. We get the ID token from the result using getIdToken()
   * 5. We send this token to OUR backend for verification
   * 6. Backend verifies → returns our JWT → we store it → redirect
   */
  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError("");
    try {
      // Step 1-3: Open Google popup & get the signed-in user
      const result = await signInWithPopup(auth, googleProvider);

      // Step 4: Get the Firebase ID token (this is what our backend verifies)
      const idToken = await result.user.getIdToken();

      // Step 5: Send token to our backend
      const res = await API.post("/auth/google", { idToken });

      // Step 6: Store user info & JWT (same format as normal login)
      const stored = {
        user: {
          _id: res.data._id,
          name: res.data.name,
          email: res.data.email,
          role: res.data.role,
          avatar: res.data.avatar,
        },
        token: res.data.token,
      };
      localStorage.setItem("userInfo", JSON.stringify(stored));

      // Redirect to dashboard
      navigate("/dashboard");
    } catch (err) {
      console.error("Google login error:", err);

      // Handle specific Google popup errors
      if (err.code === "auth/popup-closed-by-user") {
        setError("Google sign-in was cancelled.");
      } else if (err.code === "auth/network-request-failed") {
        setError("Network error. Please check your connection.");
      } else {
        setError(err.response?.data?.message || "Google login failed. Please try again.");
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="animated-bg" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem 1rem" }}>
      <span className="orb-extra" style={{ top: "20%", right: "10%" }} />

      <div style={{ display: "flex", flexWrap: "wrap", maxWidth: 960, width: "100%", gap: "4rem", alignItems: "center", justifyContent: "center", position: "relative", zIndex: 1, margin: "0 auto" }}>

        {/* Left Side — Branding (desktop only) */}
        <div className="hide-mobile" style={{ flex: "1 1 400px", maxWidth: 420 }}>
          <div className="animate-in">
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "2rem" }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: "var(--gradient-primary)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.3rem", color: "white",
              }}>Q</div>
              <span className="gradient-text" style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.8rem" }}>Qure</span>
            </div>
            <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "2rem", marginBottom: "1rem", lineHeight: 1.2 }}>
              Welcome back to smarter healthcare
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "1rem", lineHeight: 1.7 }}>
              Track queues, book appointments, and get AI predictions — all in one place.
            </p>

            <div style={{ marginTop: "2rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
              {["Real-time queue tracking", "AI wait-time predictions", "Smart appointment booking"].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 8,
                    background: "rgba(6, 182, 212, 0.15)", display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.85rem", color: "var(--accent-cyan)",
                  }}>✓</div>
                  <span style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Login Form */}
        <div className="animate-in-delay-1" style={{ flex: "1 1 400px", maxWidth: 440, width: "100%", margin: "0 auto" }}>
          <div className="glass-card-static gradient-border-top" style={{ padding: "2.5rem 2rem" }}>
            <div style={{ textAlign: "center", marginBottom: "2rem" }}>
              <div className="hide-desktop" style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", marginBottom: "1rem" }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: "var(--gradient-primary)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1rem", color: "white",
                }}>Q</div>
              </div>
              <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.8rem", marginBottom: "0.4rem" }}>
                Sign In
              </h1>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                Enter your credentials to access your account
              </p>
            </div>

            {error && (
              <div className="toast-error" style={{ marginBottom: "1.25rem", fontSize: "0.9rem" }}>
                {error}
              </div>
            )}

            {/* ====== GOOGLE SIGN-IN BUTTON (NEW!) ====== */}
            <button
              onClick={handleGoogleLogin}
              disabled={googleLoading || loading}
              id="google-login-btn"
              style={{
                width: "100%",
                padding: "0.8rem",
                borderRadius: "var(--radius-lg, 12px)",
                border: "1px solid var(--surface-border)",
                background: "var(--surface)",
                color: "var(--text-primary)",
                fontSize: "0.95rem",
                fontWeight: 600,
                cursor: googleLoading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.75rem",
                transition: "all 0.2s ease",
                opacity: googleLoading ? 0.7 : 1,
                marginBottom: "1.5rem",
              }}
              onMouseEnter={(e) => {
                if (!googleLoading) {
                  e.currentTarget.style.borderColor = "var(--accent-cyan)";
                  e.currentTarget.style.background = "rgba(6, 182, 212, 0.05)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--surface-border)";
                e.currentTarget.style.background = "var(--surface)";
              }}
            >
              {googleLoading ? (
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                  Connecting...
                </span>
              ) : (
                <>
                  {/* Google "G" Logo */}
                  <svg width="20" height="20" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  </svg>
                  Sign in with Google
                </>
              )}
            </button>

            {/* Divider between Google and email/password */}
            <div style={{
              display: "flex", alignItems: "center", gap: "1rem",
              marginBottom: "1.5rem", color: "var(--text-muted)", fontSize: "0.8rem",
            }}>
              <div style={{ flex: 1, height: 1, background: "var(--surface-border)" }} />
              or continue with email
              <div style={{ flex: 1, height: 1, background: "var(--surface-border)" }} />
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div>
                <label className="input-label">Email Address</label>
                <input
                  type="email" name="email" placeholder="you@example.com"
                  value={formData.email} onChange={handleChange}
                  className="input-field" required
                />
              </div>

              <div>
                <label className="input-label">Password</label>
                <input
                  type="password" name="password" placeholder="Enter your password"
                  value={formData.password} onChange={handleChange}
                  className="input-field" required
                />
              </div>

              <button type="submit" className="btn-primary" disabled={loading || googleLoading}
                style={{ width: "100%", padding: "0.85rem", fontSize: "1rem", marginTop: "0.5rem", opacity: loading ? 0.7 : 1 }}>
                {loading ? (
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Signing in...
                  </span>
                ) : "Sign In"}
              </button>
            </form>

            <div style={{ textAlign: "center", marginTop: "1.75rem", fontSize: "0.9rem", color: "var(--text-muted)" }}>
              Don't have an account?{" "}
              <Link to="/register" style={{ color: "var(--accent-cyan)", textDecoration: "none", fontWeight: 600 }}>
                Create Account
              </Link>
            </div>

            <div style={{
              textAlign: "center", marginTop: "1.25rem", paddingTop: "1.25rem",
              borderTop: "1px solid var(--surface-border)", fontSize: "0.85rem", color: "var(--text-muted)",
            }}>
              Hospital administrator?{" "}
              <Link to="/admin-login" style={{ color: "var(--accent-violet)", textDecoration: "none", fontWeight: 600 }}>
                Admin Login →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;