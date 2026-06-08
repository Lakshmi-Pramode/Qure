import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem("qure-theme") || "dark");

  // Apply theme on mount & change
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("qure-theme", theme);
  }, [theme]);

  useEffect(() => {
    const info = localStorage.getItem("userInfo");
    if (info) {
      try { setUser(JSON.parse(info)); } catch { setUser(null); }
    } else {
      setUser(null);
    }
  }, [location]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    setUser(null);
    navigate("/login");
  };

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));
  const isDark = theme === "dark";

  const isActive = (path) => location.pathname === path;

  const navBg = scrolled
    ? isDark ? "rgba(15, 23, 42, 0.88)" : "rgba(248, 250, 252, 0.88)"
    : isDark ? "rgba(15, 23, 42, 0.5)" : "rgba(248, 250, 252, 0.5)";

  const navLink = (to, label) => (
    <Link
      to={to}
      style={{
        color: isActive(to) ? "var(--accent-cyan)" : "var(--text-secondary)",
        position: "relative",
        fontWeight: isActive(to) ? 600 : 400,
        transition: "color 0.2s ease",
        textDecoration: "none",
        fontSize: "0.95rem",
      }}
      onMouseEnter={(e) => (e.target.style.color = "var(--accent-cyan)")}
      onMouseLeave={(e) => {
        if (!isActive(to)) e.target.style.color = "var(--text-secondary)";
      }}
    >
      {label}
      {isActive(to) && (
        <span style={{
          position: "absolute", bottom: -6, left: 0, right: 0,
          height: 2, background: "var(--gradient-primary)", borderRadius: 2,
        }} />
      )}
    </Link>
  );

  const ThemeToggle = ({ size = 32 }) => (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      style={{
        width: size, height: size, borderRadius: 8,
        background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
        border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: size * 0.5, transition: "all 0.3s ease",
        color: "var(--text-primary)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)";
        e.currentTarget.style.transform = "scale(1.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
        e.currentTarget.style.transform = "scale(1)";
      }}
    >
      {isDark ? "☀️" : "🌙"}
    </button>
  );

  return (
    <>
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
        padding: scrolled ? "0.7rem 0" : "1rem 0",
        background: navBg,
        backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
        borderBottom: `1px solid ${scrolled ? "var(--surface-border)" : "transparent"}`,
        transition: "all 0.3s ease",
      }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>

          {/* Logo */}
          <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "var(--gradient-primary)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.1rem", color: "white",
            }}>Q</div>
            <span style={{
              fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.5rem",
              background: "var(--gradient-primary)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>Qure</span>
          </Link>

          {/* Desktop Links */}
          <div className="hide-mobile" style={{ display: "flex", alignItems: "center", gap: "1.75rem" }}>
            {navLink("/", "Home")}
            {navLink("/doctors", "Doctors")}
            {user && navLink("/dashboard", "Dashboard")}
            {user && navLink("/queue", "Queue")}
            {user && navLink("/ai-assistant", "AI Assistant")}

            <ThemeToggle />

            {!user ? (
              <div style={{ display: "flex", gap: "0.75rem", marginLeft: "0.25rem" }}>
                <Link to="/login" className="btn-secondary" style={{ padding: "0.5rem 1.25rem", fontSize: "0.9rem" }}>Login</Link>
                <Link to="/register" className="btn-primary" style={{ padding: "0.5rem 1.25rem", fontSize: "0.9rem" }}>Get Started</Link>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginLeft: "0.25rem" }}>
                <Link to="/profile" style={{ textDecoration: "none" }}>
                  <div className="avatar" style={{ width: 36, height: 36, fontSize: "0.85rem", cursor: "pointer" }}>
                    {user?.user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                </Link>
                <button onClick={handleLogout} className="btn-ghost" style={{ color: "var(--accent-rose)" }}>Logout</button>
              </div>
            )}
          </div>

          {/* Mobile: Theme + Hamburger */}
          <div className="hide-desktop" style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <ThemeToggle size={34} />
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              style={{
                background: "none", border: "none", cursor: "pointer", padding: 8,
                display: "flex", flexDirection: "column", gap: 5,
              }}
            >
              <span style={{ width: 24, height: 2, background: "var(--text-primary)", borderRadius: 2, transition: "all 0.3s ease", transform: mobileOpen ? "rotate(45deg) translateY(7px)" : "none" }} />
              <span style={{ width: 24, height: 2, background: "var(--text-primary)", borderRadius: 2, transition: "all 0.3s ease", opacity: mobileOpen ? 0 : 1 }} />
              <span style={{ width: 24, height: 2, background: "var(--text-primary)", borderRadius: 2, transition: "all 0.3s ease", transform: mobileOpen ? "rotate(-45deg) translateY(-7px)" : "none" }} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 999,
          background: isDark ? "rgba(15, 23, 42, 0.95)" : "rgba(248, 250, 252, 0.95)",
          backdropFilter: "blur(20px)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1.5rem",
          animation: "fade-in-up 0.3s ease-out",
        }}>
          {[
            ["/", "Home"], ["/doctors", "Doctors"],
            ...(user ? [["/dashboard", "Dashboard"], ["/queue", "Queue"], ["/ai-assistant", "AI Assistant"], ["/profile", "Profile"]] : []),
          ].map(([to, label]) => (
            <Link key={to} to={to} onClick={() => setMobileOpen(false)}
              style={{
                color: isActive(to) ? "var(--accent-cyan)" : "var(--text-primary)",
                fontSize: "1.3rem", fontWeight: 600, textDecoration: "none",
                fontFamily: "var(--font-heading)",
              }}>
              {label}
            </Link>
          ))}
          {!user ? (
            <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
              <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-secondary">Login</Link>
              <Link to="/register" onClick={() => setMobileOpen(false)} className="btn-primary">Get Started</Link>
            </div>
          ) : (
            <button onClick={() => { setMobileOpen(false); handleLogout(); }} className="btn-danger" style={{ marginTop: "1rem" }}>
              Logout
            </button>
          )}
        </div>
      )}

      {/* Spacer */}
      <div style={{ height: 72 }} />
    </>
  );
}

export default Navbar;
