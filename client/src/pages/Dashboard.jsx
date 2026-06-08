import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [greeting, setGreeting] = useState("Welcome");
  const [nextAppointment, setNextAppointment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const info = localStorage.getItem("userInfo");
    if (info) {
      try { setUser(JSON.parse(info)); } catch { /* empty */ }
    }
    const h = new Date().getHours();
    if (h < 12) setGreeting("Good Morning");
    else if (h < 17) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");

    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const info = JSON.parse(localStorage.getItem("userInfo"));
      if (!info) return;
      const res = await API.get("/appointments/my-appointments", {
        headers: { Authorization: `Bearer ${info.token}` }
      });
      // Find the first upcoming appointment (Pending or Approved)
      const upcoming = res.data.find(a => a.status === "Pending" || a.status === "Approved");
      setNextAppointment(upcoming || null);
    } catch (err) {
      console.error("Failed to fetch appointments", err);
    } finally {
      setLoading(false);
    }
  };

  const userName = user?.user?.name || "Patient";

  const quickActions = [
    { icon: "📅", label: "Book Appointment", to: "/doctors", color: "rgba(6,182,212,0.15)" },
    { icon: "📋", label: "My Appointments", to: "/my-appointments", color: "rgba(244,63,94,0.15)" },
    { icon: "📡", label: "Track Queue", to: "/queue", color: "rgba(16,185,129,0.15)" },
    { icon: "🤖", label: "AI Assistant", to: "/ai-assistant", color: "rgba(245,158,11,0.15)" },
  ];

  const recommended = [
    { name: "City Hospital", dept: "Multi-Specialty", wait: "12 min", status: "low" },
    { name: "Sunrise Medical", dept: "Cardiology", wait: "8 min", status: "low" },
    { name: "LifeCare Center", dept: "Pediatrics", wait: "25 min", status: "moderate" },
  ];

  return (
    <div className="animated-bg" style={{ minHeight: "100vh", padding: "2rem 0 4rem" }}>
      <div className="container-main" style={{ position: "relative", zIndex: 1 }}>

        {/* Greeting */}
        <div className="animate-in" style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "clamp(1.6rem, 4vw, 2.2rem)" }}>
            {greeting},{" "}
            <span className="gradient-text">{userName}</span> 👋
          </h1>
          <p style={{ color: "var(--text-secondary)", marginTop: "0.3rem", fontSize: "1rem" }}>
            Here's your health queue overview for today.
          </p>
        </div>

        {/* Stat Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.25rem", marginBottom: "2rem" }}>
          {/* Upcoming Appointment */}
          <div className="glass-card gradient-border-top animate-in-delay-1" style={{ padding: "1.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
              <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 500 }}>Upcoming Appointment</span>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: "rgba(6,182,212,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem",
              }}>📅</div>
            </div>
            
            {loading ? (
               <div className="skeleton" style={{ height: 60, borderRadius: 8 }} />
            ) : nextAppointment ? (
              <>
                <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.15rem", marginBottom: "0.3rem" }}>
                  {nextAppointment.doctorId?.name || "Doctor"}
                </h3>
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                  {new Date(nextAppointment.appointmentDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
                <div style={{ marginTop: "0.75rem" }}>
                  <span className={nextAppointment.status === "Approved" ? "badge-success" : "badge-warning"}>{nextAppointment.status}</span>
                </div>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "1rem 0" }}>
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "0.75rem" }}>No upcoming appointments.</p>
                <Link to="/doctors" className="btn-sm btn-primary">Book Now</Link>
              </div>
            )}
          </div>

          {/* Queue Status */}
          <div className="glass-card gradient-border-top animate-in-delay-2" style={{ padding: "1.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
              <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 500 }}>Current Queue</span>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: "rgba(16,185,129,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem",
              }}>📡</div>
            </div>
            
            {loading ? (
              <div className="skeleton" style={{ height: 60, borderRadius: 8 }} />
            ) : nextAppointment ? (
              <>
                <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
                  <span className="stat-number" style={{ fontSize: "2rem" }}>#{nextAppointment.tokenNumber}</span>
                </div>
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "0.2rem" }}>
                  Est. Wait: {nextAppointment.estimatedWaitTime} mins
                </p>
                <div className="progress-bar" style={{ marginTop: "0.75rem" }}>
                  <div className="progress-bar-fill" style={{ width: `${Math.max(10, 100 - nextAppointment.estimatedWaitTime)}%` }} />
                </div>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "1rem 0" }}>
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Queue tracking will activate once you book an appointment.</p>
              </div>
            )}
          </div>

          {/* AI Suggestion */}
          <div className="glass-card gradient-border-top animate-in-delay-3" style={{ padding: "1.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
              <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 500 }}>AI Suggestion</span>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: "rgba(139,92,246,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem",
              }}>🧠</div>
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: 1.6 }}>
              Best time to visit today:
            </p>
            <p className="gradient-text" style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.3rem", marginTop: "0.3rem" }}>
              2:00 PM — 4:00 PM
            </p>
            <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginTop: "0.3rem" }}>
              ~10 min estimated wait
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="animate-in-delay-4" style={{ marginBottom: "2.5rem" }}>
          <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.2rem", marginBottom: "1rem" }}>
            Quick Actions
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "1rem" }}>
            {quickActions.map((a, i) => (
              <Link key={i} to={a.to} className="glass-card" style={{
                padding: "1.25rem", textAlign: "center", textDecoration: "none", color: "var(--text-primary)",
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: a.color, display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1.4rem", margin: "0 auto 0.75rem",
                }}>{a.icon}</div>
                <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>{a.label}</span>
              </Link>
            ))}
          </div>
        </div>



      </div>
    </div>
  );
}

export default Dashboard;