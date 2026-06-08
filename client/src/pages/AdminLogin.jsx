import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";

function AdminLogin() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const res = await API.post("/auth/login", formData);

      if (res.data.role !== "admin") {
        setError("Access denied. Admin credentials required.");
        setLoading(false);
        return;
      }

      localStorage.setItem(
        "adminInfo",
        JSON.stringify(res.data)
      );

      navigate("/admin/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="animated-bg"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1rem",
      }}
    >
      <span
        className="orb-extra"
        style={{
          top: "30%",
          left: "20%",
        }}
      />

      <div
        className="animate-in-delay-1"
        style={{
          maxWidth: 440,
          width: "100%",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          className="glass-card-static"
          style={{
            padding: "2.5rem 2rem",
            borderTop: "2px solid",
            borderImage:
              "linear-gradient(135deg, #8b5cf6, #06b6d4) 1",
          }}
        >
          <div
            style={{
              textAlign: "center",
              marginBottom: "2rem",
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                margin: "0 auto 1rem",
                background:
                  "linear-gradient(135deg, #8b5cf6, #06b6d4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.5rem",
              }}
            >
              🛡️
            </div>

            <h1
              style={{
                fontFamily: "var(--font-heading)",
                fontWeight: 800,
                fontSize: "1.8rem",
                marginBottom: "0.4rem",
              }}
            >
              Admin Portal
            </h1>

            <p
              style={{
                color: "var(--text-muted)",
                fontSize: "0.9rem",
              }}
            >
              Sign in to manage hospitals, doctors & queues
            </p>
          </div>

          {error && (
            <div
              className="toast-error"
              style={{
                marginBottom: "1.25rem",
                fontSize: "0.9rem",
              }}
            >
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1.25rem",
            }}
          >
            <div>
              <label className="input-label">
                Admin Email
              </label>

              <input
                type="email"
                name="email"
                placeholder="admin@qure.com"
                value={formData.email}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="input-label">
                Password
              </label>

              <input
                type="password"
                name="password"
                placeholder="Enter admin password"
                value={formData.password}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{
                width: "100%",
                padding: "0.85rem",
                fontSize: "1rem",
                marginTop: "0.5rem",
                background:
                  "linear-gradient(135deg, #8b5cf6, #06b6d4)",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? (
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  <span
                    className="spinner"
                    style={{
                      width: 18,
                      height: 18,
                      borderWidth: 2,
                    }}
                  />
                  Authenticating...
                </span>
              ) : (
                "Access Admin Panel →"
              )}
            </button>
          </form>

          <div
            style={{
              textAlign: "center",
              marginTop: "1.75rem",
              paddingTop: "1.25rem",
              borderTop:
                "1px solid var(--surface-border)",
              fontSize: "0.85rem",
              color: "var(--text-muted)",
            }}
          >
            Patient account?{" "}
            <Link
              to="/login"
              style={{
                color: "var(--accent-cyan)",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              Patient Login →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;