import { useState, useEffect } from "react";

function QueueTracker() {
  const currentToken = 10;
  const yourToken = 15;
  const patientsAhead = yourToken - currentToken;
  const avgConsultTime = 4; // minutes
  const estWait = patientsAhead * avgConsultTime;
  const totalTokens = 20;
  const progressPercent = Math.round((currentToken / totalTokens) * 100);

  const [animatedProgress, setAnimatedProgress] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => setAnimatedProgress(progressPercent), 300);
    return () => clearTimeout(timer);
  }, [progressPercent]);

  const getStatusInfo = () => {
    if (patientsAhead <= 2) return { color: "var(--accent-emerald)", label: "Almost Your Turn!", bg: "rgba(16,185,129,0.12)" };
    if (patientsAhead <= 6) return { color: "var(--accent-amber)", label: "Moderate Wait", bg: "rgba(245,158,11,0.12)" };
    return { color: "var(--accent-rose)", label: "Long Wait", bg: "rgba(244,63,94,0.12)" };
  };
  const statusInfo = getStatusInfo();

  const circumference = 2 * Math.PI * 68;
  const dashOffset = circumference - (animatedProgress / 100) * circumference;

  return (
    <div className="animated-bg" style={{ minHeight: "100vh", padding: "2rem 0 4rem" }}>
      <span className="orb-extra" style={{ bottom: "20%", right: "10%" }} />
      <div className="container-main" style={{ maxWidth: 700, position: "relative", zIndex: 1 }}>

        {/* Header */}
        <div className="animate-in" style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: "0.75rem" }}>
            <span className="live-dot" />
            <span style={{ fontSize: "0.85rem", color: "var(--accent-emerald)", fontWeight: 600 }}>Live Queue Tracking</span>
          </div>
          <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "clamp(1.6rem, 4vw, 2rem)" }}>
            Queue <span className="gradient-text">Tracker</span>
          </h1>
        </div>

        {/* Circular Progress */}
        <div className="glass-card-static animate-in-delay-1" style={{ textAlign: "center", padding: "2.5rem 2rem", marginBottom: "1.5rem" }}>
          <div className="circular-progress" style={{ margin: "0 auto 1.5rem" }}>
            <svg viewBox="0 0 160 160">
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#0d9488" />
                  <stop offset="50%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#22d3ee" />
                </linearGradient>
              </defs>
              <circle className="track" cx="80" cy="80" r="68" />
              <circle className="fill" cx="80" cy="80" r="68"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                style={{ transition: "stroke-dashoffset 1.5s ease-out" }}
              />
            </svg>
            <div className="center-text">
              <div className="stat-number" style={{ fontSize: "2.2rem" }}>{patientsAhead}</div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>ahead</div>
            </div>
          </div>

          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "0.5rem 1.25rem", borderRadius: "var(--radius-full)",
            background: statusInfo.bg, border: `1px solid ${statusInfo.color}30`,
          }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: statusInfo.color, boxShadow: `0 0 6px ${statusInfo.color}` }} />
            <span style={{ fontWeight: 600, fontSize: "0.9rem", color: statusInfo.color }}>{statusInfo.label}</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
          <div className="glass-card animate-in-delay-2" style={{ textAlign: "center", padding: "1.5rem" }}>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>Your Token</div>
            <div className="stat-number" style={{ fontSize: "2rem" }}>A0{yourToken}</div>
          </div>
          <div className="glass-card animate-in-delay-3" style={{ textAlign: "center", padding: "1.5rem" }}>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>Current Token</div>
            <div style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "2rem", color: "var(--accent-emerald)" }}>
              A0{currentToken}
            </div>
          </div>
          <div className="glass-card animate-in-delay-4" style={{ textAlign: "center", padding: "1.5rem" }}>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>Patients Ahead</div>
            <div className="stat-number" style={{ fontSize: "2rem" }}>{patientsAhead}</div>
          </div>
          <div className="glass-card animate-in-delay-5" style={{ textAlign: "center", padding: "1.5rem" }}>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>Est. Wait Time</div>
            <div style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "2rem", color: "var(--accent-amber)" }}>
              {estWait}m
            </div>
          </div>
        </div>

        {/* Queue Progress Bar */}
        <div className="glass-card-static animate-in-delay-6" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>Queue Progress</span>
            <span style={{ fontSize: "0.85rem", color: "var(--accent-cyan)", fontWeight: 600 }}>{animatedProgress}%</span>
          </div>
          <div className="progress-bar" style={{ height: 10 }}>
            <div className="progress-bar-fill" style={{ width: `${animatedProgress}%` }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.5rem" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Token A001</span>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Token A0{totalTokens}</span>
          </div>
        </div>

      </div>
    </div>
  );
}

export default QueueTracker;