import AdminLayout from "../../components/AdminLayout";

function AdminSettings() {
  const admin = (() => {
    try { return JSON.parse(localStorage.getItem("adminInfo")); } catch { return null; }
  })();

  const settingSections = [
    {
      title: "Profile Information",
      icon: "👤",
      items: [
        { label: "Name", value: admin?.name || "Qure Admin" },
        { label: "Email", value: admin?.email || "admin@qure.com" },
        { label: "Role", value: "System Administrator" },
      ],
    },
    {
      title: "System Information",
      icon: "💻",
      items: [
        { label: "Version", value: "1.0.0" },
        { label: "Environment", value: "Development" },
        { label: "Database", value: "MongoDB Atlas" },
        { label: "API Server", value: "http://localhost:5000" },
      ],
    },
  ];

  const futureFeatures = [
    { icon: "🔔", title: "Notification Preferences", desc: "Configure email and push notification settings" },
    { icon: "🛡️", title: "Security Settings", desc: "Change password, 2FA, and session management" },
    { icon: "🔧", title: "Maintenance Mode", desc: "Toggle system maintenance and downtime alerts" },
    { icon: "📡", title: "Real-Time Settings", desc: "Socket.io connection settings and live updates configuration" },
    { icon: "📊", title: "Report Scheduling", desc: "Configure automated report generation and delivery" },
    { icon: "🎨", title: "Theme Customization", desc: "Customize portal colors, branding, and layout" },
  ];

  return (
    <AdminLayout>
      <div style={{ padding: "2rem 2rem 4rem" }}>
        {/* Header */}
        <div className="animate-in" style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "clamp(1.4rem, 3vw, 1.8rem)", marginBottom: "0.2rem" }}>
            <span className="gradient-text-accent">Settings</span>
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            System configuration and preferences.
          </p>
        </div>

        {/* Settings Sections */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", maxWidth: 700 }}>
          {settingSections.map((section, i) => (
            <div key={i} className="glass-card-static animate-in" style={{ animationDelay: `${i * 0.08}s`, padding: "1.5rem" }}>
              <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.05rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: 8 }}>
                <span>{section.icon}</span> {section.title}
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {section.items.map((item, j) => (
                  <div key={j} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "0.65rem 0", borderBottom: j < section.items.length - 1 ? "1px solid var(--surface-border)" : "none",
                  }}>
                    <span style={{ fontSize: "0.88rem", color: "var(--text-muted)" }}>{item.label}</span>
                    <span style={{ fontSize: "0.88rem", fontWeight: 500 }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Coming Soon */}
        <div className="animate-in-delay-3" style={{ marginTop: "2rem" }}>
          <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.05rem", marginBottom: "1rem", color: "var(--text-muted)" }}>
            Coming Soon
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
            {futureFeatures.map((f, i) => (
              <div key={i} className="glass-card-static" style={{ padding: "1.25rem", opacity: 0.6 }}>
                <div style={{ fontSize: "1.3rem", marginBottom: "0.5rem" }}>{f.icon}</div>
                <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "0.92rem", marginBottom: "0.25rem" }}>{f.title}</h3>
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminSettings;
