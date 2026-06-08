import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

function AdminDashboard() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    const info = localStorage.getItem("adminInfo");
    if (!info) { navigate("/admin-login"); return; }
    try { setAdmin(JSON.parse(info)); } catch { navigate("/admin-login"); }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("adminInfo");
    navigate("/admin-login");
  };

  const todayStats = [
    { label: "Total Appointments", value: "47", icon: "📅", color: "rgba(6,182,212,0.15)", trend: "+12%", trendUp: true },
    { label: "Active Doctors", value: "12", icon: "👨‍⚕️", color: "rgba(16,185,129,0.15)", trend: "All Online", trendUp: true },
    { label: "Patients Waiting", value: "23", icon: "⏳", color: "rgba(245,158,11,0.15)", trend: "-8%", trendUp: false },
    { label: "Avg Wait Time", value: "18m", icon: "⏱️", color: "rgba(139,92,246,0.15)", trend: "-15%", trendUp: false },
  ];

  const recentAppointments = [
    { patient: "Rahul M.", doctor: "Dr. Sarah", time: "10:30 AM", status: "In Progress", statusType: "warning" },
    { patient: "Priya K.", doctor: "Dr. Ahmed", time: "10:45 AM", status: "Waiting", statusType: "info" },
    { patient: "Vijay R.", doctor: "Dr. Sarah", time: "11:00 AM", status: "Confirmed", statusType: "success" },
    { patient: "Anita S.", doctor: "Dr. Patel", time: "11:15 AM", status: "Confirmed", statusType: "success" },
    { patient: "Deepak L.", doctor: "Dr. Ahmed", time: "11:30 AM", status: "Pending", statusType: "muted" },
  ];

  const deptLoad = [
    { dept: "General Medicine", patients: 15, capacity: 25, color: "var(--accent-cyan)" },
    { dept: "Cardiology", patients: 8, capacity: 12, color: "var(--accent-emerald)" },
    { dept: "Orthopedics", patients: 12, capacity: 15, color: "var(--accent-amber)" },
    { dept: "Pediatrics", patients: 6, capacity: 10, color: "var(--accent-violet)" },
    { dept: "Dermatology", patients: 10, capacity: 10, color: "var(--accent-rose)" },
  ];

  const quickActions = [
    { icon: "🏥", label: "Manage Hospitals", desc: "Add, edit, delete hospitals", to: "/hospitals" },
    { icon: "👨‍⚕️", label: "Manage Doctors", desc: "Doctor schedules & availability", to: "/doctors" },
    { icon: "📋", label: "Appointments", desc: "View & manage all appointments", to: "/dashboard" },
    { icon: "📡", label: "Queue Control", desc: "Update tokens & manage queues", to: "/queue" },
  ];

  const statusBadge = (type) => {
    const map = {
      success: "badge-success",
      warning: "badge-warning",
      info: "badge",
      muted: "badge",
    };
    return map[type] || "badge";
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      {/* Admin Header Bar */}
      <div style={{
        background: "var(--surface)", borderBottom: "1px solid var(--surface-border)",
        padding: "1rem 0",
      }}>
        <div className="container-main" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "linear-gradient(135deg, #8b5cf6, #06b6d4)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "0.95rem", color: "white",
            }}>Q</div>
            <div>
              <span style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.1rem" }}>
                Qure <span style={{ color: "var(--accent-violet)" }}>Admin</span>
              </span>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: 0 }}>Hospital Management Portal</p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
              {admin?.user?.name || "Admin"}
            </span>
            <button onClick={handleLogout} className="btn-ghost" style={{ color: "var(--accent-rose)", fontSize: "0.85rem" }}>
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="container-main" style={{ padding: "2rem 1.5rem 4rem" }}>

        {/* Welcome */}
        <div className="animate-in" style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "clamp(1.5rem, 4vw, 2rem)" }}>
            Admin <span className="gradient-text-accent">Dashboard</span>
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
            Overview of today's operations and queue statistics.
          </p>
        </div>

        {/* Stats Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "1.25rem", marginBottom: "2rem" }}>
          {todayStats.map((s, i) => (
            <div key={i} className="glass-card animate-in" style={{ animationDelay: `${i * 0.08}s`, padding: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                <div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>{s.label}</div>
                  <div className="stat-number" style={{ fontSize: "1.8rem" }}>{s.value}</div>
                </div>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: s.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem",
                }}>{s.icon}</div>
              </div>
              <div style={{ marginTop: "0.75rem", fontSize: "0.8rem", color: s.trendUp ? "var(--accent-emerald)" : "var(--accent-cyan)", fontWeight: 500 }}>
                {s.trend}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.5rem" }}>
          {/* Department Load */}
          <div className="glass-card-static animate-in-delay-3" style={{ padding: "1.75rem" }}>
            <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.15rem", marginBottom: "1.25rem" }}>
              Department-wise Load
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {deptLoad.map((d, i) => (
                <div key={i}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: "0.9rem", fontWeight: 500 }}>{d.dept}</span>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                      {d.patients}/{d.capacity} patients
                    </span>
                  </div>
                  <div className="progress-bar" style={{ height: 8 }}>
                    <div className="progress-bar-fill" style={{
                      width: `${(d.patients / d.capacity) * 100}%`,
                      background: d.color,
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Appointments */}
          <div className="glass-card-static animate-in-delay-4" style={{ padding: "1.75rem" }}>
            <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.15rem", marginBottom: "1.25rem" }}>
              Recent Appointments
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {recentAppointments.map((a, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "0.85rem 1rem", borderRadius: "var(--radius-md)",
                  background: "var(--surface)", border: "1px solid var(--surface-border)",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div className="avatar" style={{ width: 36, height: 36, fontSize: "0.8rem" }}>
                      {a.patient.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{a.patient}</div>
                      <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{a.doctor} · {a.time}</div>
                    </div>
                  </div>
                  <span className={statusBadge(a.statusType)} style={{ fontSize: "0.75rem" }}>
                    {a.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="animate-in-delay-5" style={{ marginTop: "2rem" }}>
          <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.15rem", marginBottom: "1rem" }}>
            Quick Actions
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "1rem" }}>
            {quickActions.map((a, i) => (
              <Link key={i} to={a.to} className="glass-card" style={{ padding: "1.5rem", textDecoration: "none", color: "var(--text-primary)" }}>
                <div style={{ fontSize: "1.5rem", marginBottom: "0.75rem" }}>{a.icon}</div>
                <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1rem", marginBottom: "0.25rem" }}>{a.label}</h3>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{a.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
