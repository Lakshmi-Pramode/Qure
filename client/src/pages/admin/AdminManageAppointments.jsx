import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../../api/axios";
import AdminLayout from "../../components/AdminLayout";

function AdminManageAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDoctor, setFilterDoctor] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [rescheduleModal, setRescheduleModal] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const admin = (() => {
    try { return JSON.parse(localStorage.getItem("adminInfo")); } catch { return null; }
  })();
  const headers = { Authorization: `Bearer ${admin?.token}` };

  useEffect(() => { fetchAppointments(); }, []);

  const fetchAppointments = async () => {
    try {
      const res = await API.get("/admin/appointments", { headers });
      setAppointments(res.data);
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const updateStatus = async (id, status) => {
    try {
      await API.put(`/admin/appointments/${id}/status`, { status }, { headers });
      showToast(`Appointment ${status.toLowerCase()}`);
      fetchAppointments();
    } catch (error) {
      showToast("Failed to update status", "error");
    }
  };

  const handleReschedule = async (e) => {
    e.preventDefault();
    if (!rescheduleModal || !rescheduleDate) return;
    setSaving(true);
    try {
      await API.put(`/admin/appointments/${rescheduleModal._id}/reschedule`, { appointmentDate: rescheduleDate }, { headers });
      showToast("Appointment rescheduled");
      setRescheduleModal(null);
      setRescheduleDate("");
      fetchAppointments();
    } catch (error) {
      showToast("Failed to reschedule", "error");
    } finally {
      setSaving(false);
    }
  };

  const statusBadge = (status) => {
    const map = { Pending: "badge-warning", Approved: "badge", Completed: "badge-success", Cancelled: "badge-danger" };
    return map[status] || "badge";
  };

  const formatDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  // Get unique doctors for filter
  const uniqueDoctors = [...new Map(
    appointments
      .filter((a) => a.doctorId)
      .map((a) => [a.doctorId._id, a.doctorId])
  ).values()];

  const filteredAppointments = appointments.filter((a) => {
    const matchesStatus = !filterStatus || a.status === filterStatus;
    const matchesDoctor = !filterDoctor || a.doctorId?._id === filterDoctor;
    const matchesSearch = !searchQuery ||
      a.patientId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.doctorId?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesDoctor && matchesSearch;
  });

  const statusCounts = {
    all: appointments.length,
    Pending: appointments.filter((a) => a.status === "Pending").length,
    Approved: appointments.filter((a) => a.status === "Approved").length,
    Completed: appointments.filter((a) => a.status === "Completed").length,
    Cancelled: appointments.filter((a) => a.status === "Cancelled").length,
  };

  return (
    <AdminLayout>
      <div style={{ padding: "2rem 2rem 4rem" }}>
        {/* Header */}
        <div className="animate-in" style={{ marginBottom: "1.5rem" }}>
          <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "clamp(1.4rem, 3vw, 1.8rem)", marginBottom: "0.2rem" }}>
            Manage <span className="gradient-text-accent">Appointments</span>
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            {appointments.length} total appointment{appointments.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Status Tabs */}
        <div className="animate-in-delay-1" style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
          {[
            { key: "", label: "All", count: statusCounts.all },
            { key: "Pending", label: "Pending", count: statusCounts.Pending },
            { key: "Approved", label: "Approved", count: statusCounts.Approved },
            { key: "Completed", label: "Completed", count: statusCounts.Completed },
            { key: "Cancelled", label: "Cancelled", count: statusCounts.Cancelled },
          ].map((tab) => (
            <button key={tab.key} onClick={() => setFilterStatus(tab.key)}
              style={{
                padding: "0.5rem 1rem", borderRadius: "var(--radius-full)", border: "1px solid",
                borderColor: filterStatus === tab.key ? "var(--accent-cyan)" : "var(--surface-border)",
                background: filterStatus === tab.key ? "rgba(6,182,212,0.12)" : "transparent",
                color: filterStatus === tab.key ? "var(--accent-cyan)" : "var(--text-secondary)",
                cursor: "pointer", fontSize: "0.82rem", fontWeight: 500, transition: "all 0.2s ease",
                display: "flex", alignItems: "center", gap: 6,
              }}>
              {tab.label} <span style={{ opacity: 0.7 }}>({tab.count})</span>
            </button>
          ))}
        </div>

        {/* Search + Filter */}
        <div className="animate-in-delay-2" style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
          <input type="text" placeholder="Search patient or doctor..." value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)} className="input-field" style={{ maxWidth: 280 }} />
          <select value={filterDoctor} onChange={(e) => setFilterDoctor(e.target.value)} className="input-field" style={{ maxWidth: 220 }}>
            <option value="">All Doctors</option>
            {uniqueDoctors.map((d) => (<option key={d._id} value={d._id}>{d.name}</option>))}
          </select>
        </div>

        {/* Appointments Table */}
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 60, borderRadius: 12 }} />
            ))}
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="glass-card-static" style={{ padding: "3rem", textAlign: "center" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>📋</div>
            <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, marginBottom: "0.5rem" }}>No appointments found</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
              {filterStatus || filterDoctor || searchQuery ? "Try different filter criteria." : "No appointments have been booked yet."}
            </p>
          </div>
        ) : (
          <div className="glass-card-static" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Doctor</th>
                    <th>Hospital</th>
                    <th>Date</th>
                    <th>Token</th>
                    <th>Type</th>
                    <th>Wait</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.map((a) => (
                    <tr key={a._id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div className="avatar" style={{ width: 30, height: 30, fontSize: "0.7rem" }}>
                            {a.patientId?.name?.charAt(0) || "?"}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: "0.85rem" }}>{a.patientId?.name || "Unknown"}</div>
                            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{a.patientId?.email || ""}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontSize: "0.85rem" }}>{a.doctorId?.name || "—"}</td>
                      <td style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{a.hospitalId?.name || "—"}</td>
                      <td style={{ fontSize: "0.85rem" }}>{formatDate(a.appointmentDate)}</td>
                      <td>
                        <span className="badge-violet" style={{ fontSize: "0.75rem", padding: "0.15rem 0.55rem", display: "inline-flex", alignItems: "center", gap: 4, borderRadius: "var(--radius-full)", background: "rgba(139,92,246,0.12)", color: "var(--accent-violet)", border: "1px solid rgba(139,92,246,0.2)" }}>
                          #{a.tokenNumber}
                        </span>
                      </td>
                      <td style={{ fontSize: "0.85rem" }}>
                        {a.consultationType === "Video Call" ? "📹 Video" : "🏥 In-Person"}
                        <div style={{ fontSize: "0.7rem", color: a.paymentStatus === "Paid" ? "var(--accent-emerald)" : "var(--text-muted)" }}>
                          {a.paymentStatus === "Paid" ? "Paid" : "Unpaid"}
                        </div>
                      </td>
                      <td style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>{a.estimatedWaitTime}m</td>
                      <td>
                        <span className={statusBadge(a.status)} style={{ fontSize: "0.73rem", padding: "0.2rem 0.6rem" }}>
                          {a.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
                          {a.consultationType === "Video Call" && a.paymentStatus === "Paid" && a.status !== "Cancelled" && a.status !== "Completed" && (
                            <Link to={`/video-call/${a._id}`} className="btn-sm" style={{ background: "rgba(139,92,246,0.12)", color: "var(--accent-violet)", border: "1px solid rgba(139,92,246,0.2)", textDecoration: "none" }}>
                              📹 Join Video
                            </Link>
                          )}
                          {a.status === "Pending" && (
                            <button onClick={() => updateStatus(a._id, "Approved")}
                              className="btn-sm" style={{ background: "rgba(6,182,212,0.12)", color: "var(--accent-cyan)", border: "1px solid rgba(6,182,212,0.2)" }}>
                              ✓ Approve
                            </button>
                          )}
                          {(a.status === "Approved") && (
                            <button onClick={() => updateStatus(a._id, "Completed")}
                              className="btn-sm" style={{ background: "rgba(16,185,129,0.12)", color: "var(--accent-emerald)", border: "1px solid rgba(16,185,129,0.2)" }}>
                              ✓ Complete
                            </button>
                          )}
                          {a.status !== "Cancelled" && a.status !== "Completed" && (
                            <>
                              <button onClick={() => { setRescheduleModal(a); setRescheduleDate(""); }}
                                className="btn-sm" style={{ background: "rgba(139,92,246,0.12)", color: "var(--accent-violet)", border: "1px solid rgba(139,92,246,0.2)" }}>
                                📅 Reschedule
                              </button>
                              <button onClick={() => updateStatus(a._id, "Cancelled")}
                                className="btn-sm" style={{ background: "rgba(244,63,94,0.12)", color: "var(--accent-rose)", border: "1px solid rgba(244,63,94,0.2)" }}>
                                ✕ Cancel
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Toast */}
        {toast && (
          <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 10000, animation: "fade-in-up 0.3s ease-out" }}>
            <div className={toast.type === "error" ? "toast-error" : "toast-success"} style={{ padding: "0.85rem 1.25rem", fontSize: "0.9rem", minWidth: 250 }}>
              {toast.message}
            </div>
          </div>
        )}

        {/* Reschedule Modal */}
        {rescheduleModal && (
          <div className="admin-modal" onClick={() => setRescheduleModal(null)}>
            <div className="admin-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 400 }}>
              <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.15rem", marginBottom: "1rem" }}>
                Reschedule Appointment
              </h2>
              <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", marginBottom: "1.25rem" }}>
                Patient: <strong style={{ color: "var(--text-primary)" }}>{rescheduleModal.patientId?.name}</strong><br />
                Doctor: <strong style={{ color: "var(--text-primary)" }}>{rescheduleModal.doctorId?.name}</strong>
              </p>
              <form onSubmit={handleReschedule} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <label className="input-label">New Date *</label>
                  <input type="date" className="input-field" value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)} required
                    min={new Date().toISOString().split("T")[0]} />
                </div>
                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <button type="button" onClick={() => setRescheduleModal(null)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
                  <button type="submit" className="btn-primary" disabled={saving} style={{ flex: 1, opacity: saving ? 0.7 : 1 }}>
                    {saving ? "Saving..." : "Reschedule"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default AdminManageAppointments;
