import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../../api/axios";
import AdminLayout from "../../components/AdminLayout";

function AdminDashboardNew() {
  const [stats, setStats] = useState(null);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const admin = (() => {
    try { return JSON.parse(localStorage.getItem("adminInfo")); } catch { return null; }
  })();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = admin?.token;
      const headers = { Authorization: `Bearer ${token}` };

      const [statsRes, appointmentsRes] = await Promise.all([
        API.get("/admin/stats", { headers }),
        API.get("/admin/appointments", { headers }),
      ]);

      setStats(statsRes.data);
      setRecentAppointments(appointmentsRes.data.slice(0, 8));
    } catch (error) {
      console.error("Failed to fetch admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = stats ? [
    { label: "Total Doctors", value: stats.totalDoctors, icon: "👨‍⚕️", color: "rgba(16,185,129,0.15)", accent: "var(--accent-emerald)" },
    { label: "Total Appointments", value: stats.totalAppointments, icon: "📅", color: "rgba(139,92,246,0.15)", accent: "var(--accent-violet)" },
    { label: "Patients Waiting", value: stats.totalWaiting, icon: "⏳", color: "rgba(245,158,11,0.15)", accent: "var(--accent-amber)" },
    { label: "Active Queues", value: stats.activeQueues, icon: "📡", color: "rgba(6,182,212,0.15)", accent: "var(--accent-cyan)" },
    { label: "Avg Wait Time", value: `${stats.avgWaitTime}m`, icon: "⏱️", color: "rgba(244,63,94,0.15)", accent: "var(--accent-rose)" },
  ] : [];

  const quickActions = [
    { icon: "👨‍⚕️", label: "Manage Doctors", desc: "Doctor schedules & availability", to: "/admin/doctors" },
    { icon: "📋", label: "Appointments", desc: "View & manage all appointments", to: "/admin/appointments" },
    { icon: "📡", label: "Queue Control", desc: "Update tokens & manage queues", to: "/admin/queues" },
    { icon: "📈", label: "Analytics", desc: "Charts & performance metrics", to: "/admin/analytics" },
  ];

  const statusBadge = (status) => {
    const map = {
      Pending: "badge-warning",
      Approved: "badge",
      Completed: "badge-success",
      Cancelled: "badge-danger",
    };
    return map[status] || "badge";
  };

  const formatDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const SkeletonCard = () => (
    <div className="glass-card-static" style={{ padding: "1.5rem" }}>
      <div className="skeleton" style={{ height: 16, width: "60%", marginBottom: 12 }} />
      <div className="skeleton" style={{ height: 32, width: "40%", marginBottom: 8 }} />
      <div className="skeleton" style={{ height: 12, width: "30%" }} />
    </div>
  );

  return (
    <AdminLayout>
      <div style={{ padding: "2rem 2rem 4rem" }}>
        {/* Welcome */}
        <div className="animate-in" style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "clamp(1.5rem, 3vw, 2rem)", marginBottom: "0.25rem" }}>
            Welcome back, <span className="gradient-text-accent">{admin?.name || "Admin"}</span>
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
            Here's an overview of today's operations and system health.
          </p>
        </div>

        {/* Stats Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          ) : (
            statCards.map((s, i) => (
              <div key={i} className="glass-card animate-in" style={{ animationDelay: `${i * 0.06}s`, padding: "1.25rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                  <div>
                    <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "0.4rem", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 500 }}>{s.label}</div>
                    <div className="stat-number" style={{ fontSize: "1.7rem" }}>{s.value}</div>
                  </div>
                  <div style={{
                    width: 42, height: 42, borderRadius: 12,
                    background: s.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem",
                  }}>{s.icon}</div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Recent Appointments */}
        <div className="glass-card-static animate-in-delay-3" style={{ padding: "1.5rem", marginBottom: "2rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
            <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.1rem", margin: 0 }}>
              Recent Appointments
            </h2>
            <Link to="/admin/appointments" style={{ fontSize: "0.85rem", color: "var(--accent-cyan)", textDecoration: "none", fontWeight: 500 }}>
              View All →
            </Link>
          </div>

          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 52, borderRadius: 12 }} />
              ))}
            </div>
          ) : recentAppointments.length === 0 ? (
            <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "2rem 0" }}>No appointments yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {recentAppointments.map((a, i) => (
                <div key={a._id || i} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "0.75rem 1rem", borderRadius: "var(--radius-md)",
                  background: "var(--surface)", border: "1px solid var(--surface-border)",
                  transition: "all 0.2s ease",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div className="avatar" style={{ width: 34, height: 34, fontSize: "0.75rem" }}>
                      {a.patientId?.name?.charAt(0) || "?"}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "0.88rem" }}>{a.patientId?.name || "Unknown"}</div>
                      <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                        {a.doctorId?.name || "—"} · Token #{a.tokenNumber} · {formatDate(a.appointmentDate)}
                      </div>
                    </div>
                  </div>
                  <span className={statusBadge(a.status)} style={{ fontSize: "0.73rem", padding: "0.2rem 0.6rem" }}>
                    {a.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="animate-in-delay-5">
          <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.1rem", marginBottom: "1rem" }}>
            Quick Actions
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1rem" }}>
            {quickActions.map((a, i) => (
              <Link key={i} to={a.to} className="glass-card" style={{ padding: "1.25rem", textDecoration: "none", color: "var(--text-primary)" }}>
                <div style={{ fontSize: "1.4rem", marginBottom: "0.6rem" }}>{a.icon}</div>
                <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "0.95rem", marginBottom: "0.2rem" }}>{a.label}</h3>
                <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", margin: 0 }}>{a.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminDashboardNew;
