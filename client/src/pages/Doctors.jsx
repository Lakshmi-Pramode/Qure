import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";

function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => { fetchDoctors(); }, []);

  const fetchDoctors = async () => {
    try {
      const res = await API.get("/doctors");
      setDoctors(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = doctors.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.specialization?.toLowerCase().includes(search.toLowerCase())
  );

  const statusColor = (s) =>
    s === "Available" ? "var(--accent-emerald)" : s === "Busy" ? "var(--accent-amber)" : "var(--accent-rose)";

  const SkeletonCard = () => (
    <div className="glass-card-static" style={{ padding: "1.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
        <div className="skeleton" style={{ width: 48, height: 48, borderRadius: "50%" }} />
        <div>
          <div className="skeleton" style={{ height: 18, width: 140, marginBottom: 6 }} />
          <div className="skeleton" style={{ height: 22, width: 80, borderRadius: 999 }} />
        </div>
      </div>
      <div className="skeleton" style={{ height: 16, width: "60%", marginBottom: 8 }} />
      <div className="skeleton" style={{ height: 16, width: "50%", marginBottom: 16 }} />
      <div className="skeleton" style={{ height: 38, width: "100%", borderRadius: 10 }} />
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", padding: "2rem 0 4rem", background: "var(--bg-primary)" }}>
      <div className="container-main">
        {/* Header */}
        <div className="animate-in" style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "clamp(1.6rem, 4vw, 2.4rem)" }}>
            Find{" "}
            <span className="gradient-text">Doctors</span>
          </h1>
          <p style={{ color: "var(--text-secondary)", marginTop: "0.3rem" }}>
            Browse all available doctors across hospitals.
          </p>
        </div>

        {/* Search */}
        <div className="animate-in-delay-1" style={{ marginBottom: "2rem" }}>
          <div style={{ position: "relative", maxWidth: 500 }}>
            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: "1.1rem" }}>
              🔍
            </span>
            <input
              type="text" placeholder="Search by name or specialization..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="input-field" style={{ paddingLeft: "2.75rem" }}
            />
          </div>
        </div>

        {/* Cards */}
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.25rem" }}>
            {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass-card-static animate-in" style={{ textAlign: "center", padding: "3rem" }}>
            <p style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>👨‍⚕️</p>
            <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, marginBottom: "0.3rem" }}>No doctors found</h3>
            <p style={{ color: "var(--text-muted)" }}>Try adjusting your search query.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.25rem" }}>
            {filtered.map((doctor, i) => (
              <div key={doctor._id} className="glass-card animate-in" style={{ animationDelay: `${i * 0.06}s`, padding: "1.75rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.25rem" }}>
                  <div className="avatar" style={{ width: 52, height: 52, fontSize: "1.1rem" }}>
                    {doctor.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.1rem" }}>
                      {doctor.name}
                    </h2>
                    <span className="badge" style={{ fontSize: "0.7rem", padding: "0.15rem 0.5rem", marginTop: 4, display: "inline-block" }}>
                      {doctor.specialization}
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginBottom: "1.25rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Experience</span>
                    <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>{doctor.experience} Years</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Consultation Fee</span>
                    <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>₹{doctor.consultationFee}</span>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Status</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{
                        width: 8, height: 8, borderRadius: "50%", display: "inline-block",
                        background: statusColor(doctor.availabilityStatus),
                        animation: doctor.availabilityStatus === "Available" ? "dot-pulse 2s infinite" : "none",
                        boxShadow: `0 0 6px ${statusColor(doctor.availabilityStatus)}`,
                      }} />
                      <span style={{ fontWeight: 600, fontSize: "0.9rem", color: statusColor(doctor.availabilityStatus) }}>
                        {doctor.availabilityStatus || "Unknown"}
                      </span>
                    </span>
                  </div>
                </div>

                <Link to="/appointment" state={{ doctor, hospital: doctor.hospitalId }} className="btn-primary" style={{ width: "100%", fontSize: "0.9rem", padding: "0.65rem" }}>
                  Book Appointment →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Doctors;