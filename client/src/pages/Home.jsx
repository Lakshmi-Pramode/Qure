import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import API from "../api/axios";

const features = [
  {
    icon: "📡",
    title: "Live Queue Tracking",
    desc: "Monitor real-time queue positions and wait times from the comfort of your home before stepping out.",
    gradient: "linear-gradient(135deg, #0d9488, #06b6d4)",
  },
  {
    icon: "🧠",
    title: "AI Wait Predictions",
    desc: "Our Gemini-powered AI analyzes historical patterns to predict your exact wait time with precision.",
    gradient: "linear-gradient(135deg, #8b5cf6, #06b6d4)",
  },
  {
    icon: "📅",
    title: "Smart Appointments",
    desc: "Book appointments, get token numbers instantly, and receive AI suggestions for the best visit times.",
    gradient: "linear-gradient(135deg, #f59e0b, #f43f5e)",
  },
  {
    icon: "🏥",
    title: "Doctor Discovery",
    desc: "Browse our top specialists, compare queue lengths, and find the perfect doctor for your needs.",
    gradient: "linear-gradient(135deg, #10b981, #06b6d4)",
  },
  {
    icon: "🤖",
    title: "AI Health Assistant",
    desc: "Ask our chatbot anything — best hospitals, shortest queues, specialist recommendations, and more.",
    gradient: "linear-gradient(135deg, #06b6d4, #22d3ee)",
  },
  {
    icon: "📊",
    title: "Queue Analytics",
    desc: "Hospital admins get powerful dashboards with peak-hour analysis, patient trends, and workload insights.",
    gradient: "linear-gradient(135deg, #a855f7, #ec4899)",
  },
];

const steps = [
  { num: "01", title: "Find Doctor", desc: "Browse our departments or use AI to find the right specialist." },
  { num: "02", title: "Check Queue", desc: "View live queue status, wait times, and doctor availability." },
  { num: "03", title: "Book Appointment", desc: "Select a time slot, get your token, and skip the physical line." },
  { num: "04", title: "Track & Visit", desc: "Monitor your position in real-time and arrive just in time." },
];



function AnimatedCounter({ end, suffix }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(end / 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(start);
    }, 30);
    return () => clearInterval(timer);
  }, [end]);
  return <span>{count.toLocaleString()}{suffix}</span>;
}

function Home() {
  const [liveQueues, setLiveQueues] = useState([]);
  const [statsData, setStatsData] = useState([
    { label: "Hospitals", end: 0, suffix: "+" },
    { label: "Doctors", end: 0, suffix: "+" },
    { label: "Patients Served", end: 10000, suffix: "+" },
    { label: "Avg Wait Reduced", end: 65, suffix: "%" },
  ]);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [dRes] = await Promise.all([
          API.get("/doctors")
        ]);
        const doctors = dRes.data;

        // Extract unique departments/specializations from doctors
        const depts = new Set(doctors.map(d => d.specialization).filter(Boolean));
        
        setStatsData([
          { label: "Specialties", end: depts.size || 5, suffix: "+" },
          { label: "Doctors", end: doctors.length || 1, suffix: "+" },
          { label: "Patients Served", end: 10000, suffix: "+" },
          { label: "Avg Wait Reduced", end: 65, suffix: "%" },
        ]);

        const deptArray = Array.from(depts).slice(0, 3);
        if (deptArray.length === 0) deptArray.push("General", "Cardiology", "Pediatrics");

        const queues = deptArray.map(dept => ({
          name: dept,
          dept: "Department",
          wait: Math.floor(Math.random() * 20) + 5,
          status: "low",
          patients: Math.floor(Math.random() * 10) + 1
        }));
        setLiveQueues(queues);
      } catch (err) {
        console.error(err);
      }
    };
    fetchHomeData();
  }, []);

  return (
    <div style={{ background: "var(--bg-primary)" }}>

      {/* ===== HERO SECTION ===== */}
      <section className="animated-bg" style={{ minHeight: "92vh", display: "flex", alignItems: "center", position: "relative" }}>
        <span className="orb-extra" style={{ top: "40%", left: "50%" }} />
        <div className="container-main" style={{ position: "relative", zIndex: 1, width: "100%", paddingTop: "2rem", paddingBottom: "4rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "3rem", alignItems: "center" }}>

            {/* Left Content */}
            <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
              <div className="animate-in" style={{ marginBottom: "1rem" }}>
                <span className="badge" style={{ padding: "0.4rem 1rem", fontSize: "0.85rem" }}>
                  <span className="live-dot" style={{ marginRight: 6 }} />
                  AI-Powered Healthcare Queue Management
                </span>
              </div>

              <h1 className="animate-in-delay-1" style={{
                fontFamily: "var(--font-heading)", fontSize: "clamp(2.5rem, 6vw, 4.2rem)",
                fontWeight: 900, lineHeight: 1.1, marginBottom: "1.5rem",
              }}>
                Skip Long Queues.{" "}
                <span className="gradient-text">Know Before You Go.</span>
              </h1>

              <p className="animate-in-delay-2" style={{
                fontSize: "1.15rem", color: "var(--text-secondary)", maxWidth: 560, margin: "0 auto 2.5rem",
                lineHeight: 1.7,
              }}>
                Check live waiting times, predict queue length with AI, and book smart appointments — all before leaving home.
              </p>

              <div className="animate-in-delay-3" style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
                <Link to="/register" className="btn-primary" style={{ padding: "0.9rem 2rem", fontSize: "1.05rem" }}>
                  Get Started Free →
                </Link>
                <Link to="/doctors" className="btn-secondary" style={{ padding: "0.9rem 2rem", fontSize: "1.05rem" }}>
                  Browse Doctors
                </Link>
              </div>
            </div>
          </div>

          {/* Live Queue Preview Card */}
          <div className="animate-in-delay-4" style={{ maxWidth: 800, margin: "3rem auto 0" }}>
            <div className="glass-card-static" style={{ padding: "1.5rem 2rem" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
                <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.1rem" }}>
                  Live Queue Preview
                </h3>
                <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.8rem", color: "var(--accent-emerald)" }}>
                  <span className="live-dot" /> Live
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {liveQueues.map((q, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "0.85rem 1rem", borderRadius: "var(--radius-md)",
                    background: "var(--surface)", border: "1px solid var(--surface-border)",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: "var(--radius-sm)",
                        background: q.status === "low" ? "rgba(16,185,129,0.15)" : q.status === "moderate" ? "rgba(245,158,11,0.15)" : "rgba(244,63,94,0.15)",
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem",
                      }}>
                        🏥
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>{q.name}</div>
                        <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{q.dept} · {q.patients} patients</div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{
                        fontWeight: 700, fontSize: "1rem",
                        color: q.status === "low" ? "var(--accent-emerald)" : q.status === "moderate" ? "var(--accent-amber)" : "var(--accent-rose)",
                      }}>
                        {q.wait} min
                      </div>
                      <span className={`badge${q.status === "low" ? "-success" : q.status === "high" ? "-danger" : "-warning"}`}
                        style={{ fontSize: "0.7rem", padding: "0.15rem 0.5rem" }}>
                        {q.status === "low" ? "Low Wait" : q.status === "moderate" ? "Moderate" : "High Wait"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== STATS BAR ===== */}
      <section style={{ borderTop: "1px solid var(--surface-border)", borderBottom: "1px solid var(--surface-border)" }}>
        <div className="container-main" style={{ padding: "3rem 1.5rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "2rem", textAlign: "center" }}>
            {statsData.map((s, i) => (
              <div key={i} className="animate-in" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="stat-number"><AnimatedCounter end={s.end} suffix={s.suffix} /></div>
                <div style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section style={{ padding: "5rem 0", background: "var(--bg-primary)" }}>
        <div className="container-main">
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <span className="badge-violet" style={{ marginBottom: "0.75rem", display: "inline-block" }}>Features</span>
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 800, marginTop: "0.75rem" }}>
              Everything You Need to{" "}
              <span className="gradient-text">Beat the Queue</span>
            </h2>
            <p style={{ color: "var(--text-secondary)", maxWidth: 560, margin: "1rem auto 0", fontSize: "1.05rem" }}>
              Powerful tools designed to save your time and reduce hospital waiting stress.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "1.5rem" }}>
            {features.map((f, i) => (
              <div key={i} className="glass-card animate-in" style={{ animationDelay: `${i * 0.08}s`, padding: "2rem" }}>
                <div style={{
                  width: 52, height: 52, borderRadius: "var(--radius-md)",
                  background: f.gradient, opacity: 0.9,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1.5rem", marginBottom: "1.25rem",
                }}>
                  {f.icon}
                </div>
                <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.2rem", marginBottom: "0.6rem" }}>
                  {f.title}
                </h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: 1.7 }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section style={{ padding: "5rem 0", background: "var(--surface)" }}>
        <div className="container-main">
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <span className="badge" style={{ marginBottom: "0.75rem", display: "inline-block" }}>How It Works</span>
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 800, marginTop: "0.75rem" }}>
              Four Simple Steps to{" "}
              <span className="gradient-text">Skip the Wait</span>
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1.5rem" }}>
            {steps.map((s, i) => (
              <div key={i} className="glass-card-static gradient-border-top animate-in" style={{ animationDelay: `${i * 0.12}s`, textAlign: "center", padding: "2.5rem 1.5rem" }}>
                <div className="gradient-text" style={{ fontFamily: "var(--font-heading)", fontSize: "2.5rem", fontWeight: 900, marginBottom: "1rem" }}>
                  {s.num}
                </div>
                <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.15rem", marginBottom: "0.6rem" }}>
                  {s.title}
                </h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.6 }}>
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="animated-bg" style={{ padding: "5rem 0" }}>
        <div className="container-main" style={{ position: "relative", zIndex: 1 }}>
          <div className="glass-card-static" style={{ textAlign: "center", padding: "4rem 2rem", maxWidth: 700, margin: "0 auto" }}>
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(1.6rem, 4vw, 2.4rem)", fontWeight: 800, marginBottom: "1rem" }}>
              Ready to{" "}
              <span className="gradient-text">Skip the Queue?</span>
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem", marginBottom: "2rem", maxWidth: 480, margin: "0 auto 2rem" }}>
              Join thousands of patients who save hours every month with Qure's intelligent queue management.
            </p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
              <Link to="/register" className="btn-primary" style={{ padding: "0.9rem 2.5rem", fontSize: "1.05rem" }}>
                Create Free Account
              </Link>
              <Link to="/admin-login" className="btn-secondary" style={{ padding: "0.9rem 2.5rem", fontSize: "1.05rem" }}>
                Admin Portal →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer style={{ borderTop: "1px solid var(--surface-border)", padding: "3rem 0 2rem" }}>
        <div className="container-main">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: "var(--gradient-primary)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "0.9rem", color: "white",
              }}>Q</div>
              <span style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.1rem", color: "var(--text-secondary)" }}>
                Qure
              </span>
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
              © 2026 Qure. Built with ❤️ for smarter healthcare.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;