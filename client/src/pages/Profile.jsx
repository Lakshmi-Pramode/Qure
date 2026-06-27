import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const info = localStorage.getItem("userInfo");
    if (info) {
      try { setUser(JSON.parse(info)); } catch { /* empty */ }
    }
  }, []);

  const userName = user?.user?.name || "Patient";
  const userEmail = user?.user?.email || "Not available";

  const stats = [
    { label: "Total Appointments", value: "12", icon: "📅", color: "rgba(6,182,212,0.15)" },
    { label: "Completed", value: "9", icon: "✅", color: "rgba(16,185,129,0.15)" },
    { label: "Upcoming", value: "2", icon: "⏰", color: "rgba(245,158,11,0.15)" },
    { label: "Cancelled", value: "1", icon: "❌", color: "rgba(244,63,94,0.15)" },
  ];

  return (
    <div className="animated-bg" style={{ minHeight: "100vh", padding: "2rem 0 4rem" }}>
      <span className="orb-extra" style={{ top: "25%", left: "5%" }} />
      <div className="container-main" style={{ maxWidth: 640, position: "relative", zIndex: 1 }}>

        {/* Profile Card */}
        <div className="glass-card-static gradient-border-top animate-in" style={{ padding: "2.5rem 2rem", textAlign: "center" }}>
          {/* Avatar */}
          <div className="avatar-ring" style={{ margin: "0 auto 1.25rem", width: "fit-content" }}>
            <div className="avatar-inner">
              {userName.charAt(0).toUpperCase()}
            </div>
          </div>

          <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.6rem", marginBottom: "0.25rem" }}>
            {userName}
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", marginBottom: "0.5rem" }}>
            {userEmail}
          </p>
          <span className="badge-success" style={{ fontSize: "0.8rem" }}>Active Patient</span>
        </div>

        {/* Stats */}
        <div className="animate-in-delay-1" style={{ marginTop: "1.5rem" }}>
          <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.15rem", marginBottom: "1rem" }}>
            Appointment Summary
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem" }}>
            {stats.map((s, i) => (
              <div key={i} className="glass-card" style={{ textAlign: "center", padding: "1.25rem" }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: s.color, display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1.2rem", margin: "0 auto 0.75rem",
                }}>{s.icon}</div>
                <div className="stat-number" style={{ fontSize: "1.4rem" }}>{s.value}</div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Profile Details */}
        <div className="glass-card-static animate-in-delay-2" style={{ marginTop: "1.5rem", padding: "1.75rem" }}>
          <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.15rem", marginBottom: "1.25rem" }}>
            Profile Details
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {[
              { label: "Full Name", value: userName, icon: "👤" },
              { label: "Email", value: userEmail, icon: "📧" },
              { label: "Role", value: "Patient", icon: "🏷️" },
              { label: "Member Since", value: "June 2026", icon: "📆" },
            ].map((item, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "0.85rem 1rem", borderRadius: "var(--radius-md)",
                background: "var(--surface)", border: "1px solid var(--surface-border)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <span style={{ fontSize: "1.1rem" }}>{item.icon}</span>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{item.label}</span>
                </div>
                <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="animate-in-delay-3" style={{ display: "flex", gap: "1rem", marginTop: "1.5rem", flexWrap: "wrap" }}>
          <Link to="/dashboard" className="btn-primary" style={{ flex: 1, textAlign: "center" }}>
            Dashboard
          </Link>
        </div>

      </div>
    </div>
  );
}

export default Profile;