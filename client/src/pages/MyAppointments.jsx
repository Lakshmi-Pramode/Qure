/**
 * ====================================================
 * MY APPOINTMENTS PAGE
 * ====================================================
 *
 * 📚 WHAT IS THIS?
 * Shows all appointments booked by the logged-in user.
 * For "Video Call" appointments with "Paid" status,
 * a "Join Video Call" button appears.
 *
 * This page fetches from GET /api/appointments/my
 */

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";

function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const res = await API.get("/appointments/my", {
        headers: { Authorization: `Bearer ${userInfo?.token}` },
      });
      setAppointments(res.data);
    } catch (err) {
      setError("Failed to load appointments.");
    } finally {
      setLoading(false);
    }
  };

  const cancelAppointment = async (id) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      await API.put(`/appointments/cancel/${id}`, {}, {
        headers: { Authorization: `Bearer ${userInfo?.token}` },
      });
      fetchAppointments();
    } catch (err) {
      setError("Failed to cancel appointment.");
    }
  };

  const getStatusBadge = (status, paymentStatus) => {
    const config = {
      Approved: { class: "badge-success", label: `✅ Approved${paymentStatus === "Paid" ? " • Paid" : ""}` },
      Pending: { class: "badge-warning", label: "⏳ Pending" },
      Completed: { class: "badge-success", label: "✔ Completed" },
      Cancelled: { class: "badge-error", label: "✖ Cancelled" },
    };
    const c = config[status] || config.Pending;
    return <span className={c.class} style={{ fontSize: "0.75rem" }}>{c.label}</span>;
  };

  const formatDate = (d) => {
    try { return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }); }
    catch { return d; }
  };

  if (loading) {
    return (
      <div className="animated-bg" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }} />
      </div>
    );
  }

  return (
    <div className="animated-bg" style={{ minHeight: "100vh", padding: "2rem 0 4rem" }}>
      <div className="container-main" style={{ position: "relative", zIndex: 1, maxWidth: 720 }}>

        {/* Header */}
        <div className="animate-in" style={{ marginBottom: "2rem" }}>
          <Link to="/dashboard" className="btn-ghost" style={{ marginBottom: "1rem", display: "inline-flex", padding: "0.4rem 0" }}>
            ← Back to Dashboard
          </Link>
          <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.8rem" }}>
            My <span className="gradient-text">Appointments</span>
          </h1>
          <p style={{ color: "var(--text-muted)", marginTop: "0.3rem" }}>
            {appointments.length} appointment{appointments.length !== 1 ? "s" : ""} found
          </p>
        </div>

        {error && <div className="toast-error" style={{ marginBottom: "1rem" }}>{error}</div>}

        {appointments.length === 0 ? (
          <div className="glass-card-static animate-in-delay-1" style={{ textAlign: "center", padding: "3rem" }}>
            <p style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>📅</p>
            <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, marginBottom: "0.5rem" }}>No Appointments Yet</h3>
            <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>Book your first appointment to get started.</p>
            <Link to="/hospitals" className="btn-primary">Browse Hospitals →</Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {appointments.map((apt, i) => (
              <div key={apt._id} className={`glass-card-static animate-in-delay-${Math.min(i + 1, 5)}`}
                style={{ padding: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "1rem" }}>
                  <div>
                    <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.05rem", marginBottom: "0.25rem" }}>
                      {apt.doctorId?.name || "Doctor"}
                    </h3>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                      {apt.doctorId?.specialization} • {apt.hospitalId?.name || "Hospital"}
                    </span>
                  </div>
                  {getStatusBadge(apt.status, apt.paymentStatus)}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: "0.75rem", marginBottom: "1rem" }}>
                  <div>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Date</div>
                    <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{formatDate(apt.appointmentDate)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Token</div>
                    <div className="stat-number" style={{ fontSize: "1.1rem" }}>{apt.tokenNumber}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Type</div>
                    <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                      {apt.consultationType === "Video Call" ? "📹 Video" : "🏥 In-Person"}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Fee</div>
                    <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>₹{apt.consultationFee || "N/A"}</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  {/* Video Call Button — only for paid video appointments */}
                  {apt.consultationType === "Video Call" &&
                   apt.paymentStatus === "Paid" &&
                   apt.status !== "Cancelled" &&
                   apt.status !== "Completed" && (
                    <Link to={`/video-call/${apt._id}`} className="btn-primary"
                      style={{ padding: "0.5rem 1rem", fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: 6 }}>
                      📹 Join Video Call
                    </Link>
                  )}

                  {/* Cancel Button — only for non-cancelled/completed */}
                  {apt.status !== "Cancelled" && apt.status !== "Completed" && (
                    <button onClick={() => cancelAppointment(apt._id)}
                      style={{
                        padding: "0.5rem 1rem", borderRadius: 10, fontSize: "0.85rem",
                        background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.3)",
                        color: "var(--accent-rose)", cursor: "pointer", fontWeight: 500,
                      }}>
                      Cancel
                    </button>
                  )}

                  {/* Track Queue — for in-person approved */}
                  {apt.consultationType === "In-Person" &&
                   apt.status !== "Cancelled" &&
                   apt.status !== "Completed" && (
                    <Link to="/queue" className="btn-ghost" style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}>
                      📡 Track Queue
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyAppointments;
