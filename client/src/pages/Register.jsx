/**
 * ====================================================
 * REGISTER PAGE — Updated with Google Sign-Up
 * ====================================================
 *
 * 📚 SAME FLOW AS LOGIN:
 * The Google sign-up button uses the EXACT same backend endpoint
 * (/api/auth/google) as the login page. The backend automatically
 * handles both cases:
 *   - If user exists → log them in
 *   - If new user → create account & log them in
 *
 * So "Sign up with Google" and "Sign in with Google" are technically
 * the same thing! This is a common pattern in modern apps.
 */

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";

// Import Firebase auth utilities
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../config/firebase";

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const getPasswordStrength = () => {
    const p = formData.password;
    if (!p) return { width: "0%", color: "transparent", label: "" };
    if (p.length < 4) return { width: "25%", color: "var(--accent-rose)", label: "Weak" };
    if (p.length < 6) return { width: "50%", color: "var(--accent-amber)", label: "Fair" };
    if (p.length < 8) return { width: "75%", color: "var(--accent-cyan)", label: "Good" };
    return { width: "100%", color: "var(--accent-emerald)", label: "Strong" };
  };

  const strength = getPasswordStrength();

  // Normal email/password registration (unchanged)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await API.post("/auth/register", formData);
      const stored = { user: { _id: res.data._id, name: res.data.name, email: res.data.email, role: res.data.role, avatar: res.data.avatar }, token: res.data.token };
      localStorage.setItem("userInfo", JSON.stringify(stored));
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Google Sign-Up (same flow as login — backend handles both)
  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    setError("");
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      const res = await API.post("/auth/google", { idToken });

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
      navigate("/dashboard");
    } catch (err) {
      console.error("Google sign-up error:", err);
      if (err.code === "auth/popup-closed-by-user") {
        setError("Google sign-in was cancelled.");
      } else {
        setError(err.response?.data?.message || "Google sign-up failed. Please try again.");
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="animated-bg" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem 1rem" }}>
      <span className="orb-extra" style={{ bottom: "20%", left: "10%" }} />

      <div className="animate-in-delay-1" style={{ maxWidth: 440, width: "100%", position: "relative", zIndex: 1 }}>
        <div className="glass-card-static gradient-border-top" style={{ padding: "2.5rem 2rem" }}>
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", marginBottom: "1rem" }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: "var(--gradient-primary)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1rem", color: "white",
              }}>Q</div>
            </div>
            <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.8rem", marginBottom: "0.4rem" }}>
              Create Account
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
              Join Qure and skip the hospital queues
            </p>
          </div>

          {error && (
            <div className="toast-error" style={{ marginBottom: "1.25rem", fontSize: "0.9rem" }}>
              {error}
            </div>
          )}

          {/* ====== GOOGLE SIGN-UP BUTTON ====== */}
          <button
            onClick={handleGoogleSignUp}
            disabled={googleLoading || loading}
            id="google-signup-btn"
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
                <svg width="20" height="20" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                Sign up with Google
              </>
            )}
          </button>

          {/* Divider */}
          <div style={{
            display: "flex", alignItems: "center", gap: "1rem",
            marginBottom: "1.5rem", color: "var(--text-muted)", fontSize: "0.8rem",
          }}>
            <div style={{ flex: 1, height: 1, background: "var(--surface-border)" }} />
            or register with email
            <div style={{ flex: 1, height: 1, background: "var(--surface-border)" }} />
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div>
              <label className="input-label">Full Name</label>
              <input
                type="text" name="name" placeholder="John Doe"
                value={formData.name} onChange={handleChange}
                className="input-field" required
              />
            </div>

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
                type="password" name="password" placeholder="Create a strong password"
                value={formData.password} onChange={handleChange}
                className="input-field" required
              />
              {formData.password && (
                <div style={{ marginTop: "0.5rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Password strength</span>
                    <span style={{ fontSize: "0.75rem", color: strength.color, fontWeight: 600 }}>{strength.label}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-bar-fill" style={{ width: strength.width, background: strength.color }} />
                  </div>
                </div>
              )}
            </div>

            <button type="submit" className="btn-primary" disabled={loading || googleLoading}
              style={{ width: "100%", padding: "0.85rem", fontSize: "1rem", marginTop: "0.5rem", opacity: loading ? 0.7 : 1 }}>
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Creating account...
                </span>
              ) : "Create Account"}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: "1.75rem", fontSize: "0.9rem", color: "var(--text-muted)" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "var(--accent-cyan)", textDecoration: "none", fontWeight: 600 }}>
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;