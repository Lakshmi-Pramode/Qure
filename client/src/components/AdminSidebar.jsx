import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

const navItems = [
  { path: "/admin/dashboard", label: "Dashboard", icon: "📊" },
  { path: "/admin/doctors", label: "Manage Doctors", icon: "👨‍⚕️" },
  { path: "/admin/appointments", label: "Appointments", icon: "📋" },
  { path: "/admin/queues", label: "Queue Management", icon: "📡" },
  { path: "/admin/analytics", label: "Analytics", icon: "📈" },
  { path: "/admin/settings", label: "Settings", icon: "⚙️" },
];

function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const admin = (() => {
    try {
      return JSON.parse(localStorage.getItem("adminInfo"));
    } catch {
      return null;
    }
  })();

  const handleLogout = () => {
    localStorage.removeItem("adminInfo");
    navigate("/admin-login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile Toggle */}
      <button
        className="admin-sidebar-toggle hide-desktop"
        onClick={() => setCollapsed(!collapsed)}
        aria-label="Toggle sidebar"
      >
        <span style={{
          display: "flex", flexDirection: "column", gap: 5,
          width: 22, height: 22, justifyContent: "center",
        }}>
          <span style={{
            width: "100%", height: 2, background: "var(--text-primary)",
            borderRadius: 2, transition: "all 0.3s ease",
            transform: collapsed ? "none" : "rotate(45deg) translateY(5px)",
          }} />
          <span style={{
            width: "100%", height: 2, background: "var(--text-primary)",
            borderRadius: 2, transition: "all 0.3s ease",
            opacity: collapsed ? 1 : 0,
          }} />
          <span style={{
            width: "100%", height: 2, background: "var(--text-primary)",
            borderRadius: 2, transition: "all 0.3s ease",
            transform: collapsed ? "none" : "rotate(-45deg) translateY(-5px)",
          }} />
        </span>
      </button>

      {/* Overlay for mobile */}
      {!collapsed && (
        <div
          className="admin-sidebar-overlay hide-desktop"
          onClick={() => setCollapsed(true)}
        />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${collapsed ? "admin-sidebar-collapsed" : ""}`}>
        {/* Brand */}
        <div className="admin-sidebar-brand">
          <Link to="/admin/dashboard" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "linear-gradient(135deg, #8b5cf6, #06b6d4)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1rem", color: "white",
              flexShrink: 0,
            }}>Q</div>
            <div>
              <span style={{
                fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.05rem",
                color: "var(--text-primary)",
              }}>
                Qure <span style={{ color: "var(--accent-violet)" }}>Admin</span>
              </span>
              <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.2 }}>
                Hospital Management
              </p>
            </div>
          </Link>
        </div>

        {/* Nav Links */}
        <nav className="admin-sidebar-nav">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`admin-sidebar-link ${isActive(item.path) ? "admin-sidebar-link-active" : ""}`}
              onClick={() => setCollapsed(true)}
            >
              <span className="admin-sidebar-link-icon">{item.icon}</span>
              <span className="admin-sidebar-link-label">{item.label}</span>
              {isActive(item.path) && <span className="admin-sidebar-link-indicator" />}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="admin-sidebar-footer">
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "0.75rem" }}>
            <div className="avatar" style={{ width: 34, height: 34, fontSize: "0.8rem", background: "linear-gradient(135deg, #8b5cf6, #06b6d4)" }}>
              {admin?.name?.charAt(0)?.toUpperCase() || "A"}
            </div>
            <div>
              <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>{admin?.name || "Admin"}</div>
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{admin?.email || "admin@qure.com"}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="admin-sidebar-logout"
          >
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>
    </>
  );
}

export default AdminSidebar;
