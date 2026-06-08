import { useState, useEffect } from "react";
import API from "../../api/axios";
import AdminLayout from "../../components/AdminLayout";

function AdminManageDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterHospital, setFilterHospital] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [toast, setToast] = useState(null);

  const [formData, setFormData] = useState({
    name: "", specialization: "", hospitalId: "", experience: "",
    consultationFee: "", consultationTime: "",
    availabilityStatus: "Available", isAcceptingAppointments: true,
  });

  const admin = (() => {
    try { return JSON.parse(localStorage.getItem("adminInfo")); } catch { return null; }
  })();
  const headers = { Authorization: `Bearer ${admin?.token}` };

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [doctorsRes, hospitalsRes] = await Promise.all([
        API.get("/doctors"),
        API.get("/hospitals"),
      ]);
      setDoctors(doctorsRes.data);
      setHospitals(hospitalsRes.data);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const openAddModal = () => {
    setEditingDoctor(null);
    setFormData({
      name: "", specialization: "", hospitalId: hospitals[0]?._id || "",
      experience: "", consultationFee: "", consultationTime: "",
      availabilityStatus: "Available", isAcceptingAppointments: true,
    });
    setShowModal(true);
  };

  const openEditModal = (doctor) => {
    setEditingDoctor(doctor);
    setFormData({
      name: doctor.name || "",
      specialization: doctor.specialization || "",
      hospitalId: doctor.hospitalId?._id || doctor.hospitalId || "",
      experience: doctor.experience || "",
      consultationFee: doctor.consultationFee || "",
      consultationTime: doctor.consultationTime || "",
      availabilityStatus: doctor.availabilityStatus || "Available",
      isAcceptingAppointments: doctor.isAcceptingAppointments !== false,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      ...formData,
      experience: Number(formData.experience),
      consultationFee: Number(formData.consultationFee),
      consultationTime: Number(formData.consultationTime),
    };

    try {
      if (editingDoctor) {
        await API.put(`/doctors/${editingDoctor._id}`, payload, { headers });
        showToast("Doctor updated successfully");
      } else {
        await API.post("/doctors", payload, { headers });
        showToast("Doctor added successfully");
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      showToast(error.response?.data?.message || "Operation failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/doctors/${id}`, { headers });
      showToast("Doctor deleted");
      setDeleteConfirm(null);
      fetchData();
    } catch (error) {
      showToast("Failed to delete doctor", "error");
    }
  };

  const statusBadgeClass = (status) => {
    const map = { Available: "badge-success", Busy: "badge-warning", "On Leave": "badge-danger" };
    return map[status] || "badge";
  };

  const filteredDoctors = doctors.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.specialization.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesHospital = !filterHospital || (d.hospitalId?._id || d.hospitalId) === filterHospital;
    const matchesStatus = !filterStatus || d.availabilityStatus === filterStatus;
    return matchesSearch && matchesHospital && matchesStatus;
  });

  return (
    <AdminLayout>
      <div style={{ padding: "2rem 2rem 4rem" }}>
        {/* Header */}
        <div className="animate-in" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "clamp(1.4rem, 3vw, 1.8rem)", marginBottom: "0.2rem" }}>
              Manage <span className="gradient-text-accent">Doctors</span>
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", margin: 0 }}>
              {doctors.length} doctor{doctors.length !== 1 ? "s" : ""} registered
            </p>
          </div>
          <button onClick={openAddModal} className="btn-primary" style={{ padding: "0.65rem 1.5rem", fontSize: "0.9rem" }}>
            + Add Doctor
          </button>
        </div>

        {/* Filters */}
        <div className="animate-in-delay-1" style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
          <input type="text" placeholder="Search by name or specialization..." value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)} className="input-field" style={{ maxWidth: 300 }} />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="input-field" style={{ maxWidth: 180 }}>
            <option value="">All Status</option>
            <option value="Available">Available</option>
            <option value="Busy">Busy</option>
            <option value="On Leave">On Leave</option>
          </select>
        </div>

        {/* Doctor Cards */}
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.25rem" }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass-card-static" style={{ padding: "1.5rem" }}>
                <div className="skeleton" style={{ height: 18, width: "50%", marginBottom: 10 }} />
                <div className="skeleton" style={{ height: 14, width: "70%", marginBottom: 10 }} />
                <div className="skeleton" style={{ height: 14, width: "40%" }} />
              </div>
            ))}
          </div>
        ) : filteredDoctors.length === 0 ? (
          <div className="glass-card-static" style={{ padding: "3rem", textAlign: "center" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>👨‍⚕️</div>
            <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, marginBottom: "0.5rem" }}>
              {searchQuery || filterHospital || filterStatus ? "No doctors match your filters" : "No doctors yet"}
            </h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
              {searchQuery || filterHospital || filterStatus ? "Try different filter criteria." : "Click \"Add Doctor\" to register your first doctor."}
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.25rem" }}>
            {filteredDoctors.map((d, i) => (
              <div key={d._id} className="glass-card-static animate-in" style={{ animationDelay: `${i * 0.04}s`, padding: "1.25rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "0.75rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div className="avatar" style={{ width: 44, height: 44, fontSize: "1rem", background: "linear-gradient(135deg, #8b5cf6, #06b6d4)" }}>
                      {d.name.charAt(0)}
                    </div>
                    <div>
                      <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1rem", marginBottom: "0.1rem" }}>{d.name}</h3>
                      <span style={{ fontSize: "0.82rem", color: "var(--accent-cyan)" }}>{d.specialization}</span>
                    </div>
                  </div>
                  <span className={statusBadgeClass(d.availabilityStatus)} style={{ fontSize: "0.72rem", padding: "0.15rem 0.55rem" }}>
                    {d.availabilityStatus}
                  </span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginBottom: "1rem", fontSize: "0.82rem" }}>
                  <div style={{ color: "var(--text-muted)" }}>📅 {d.experience} yrs exp</div>
                  <div style={{ color: "var(--text-muted)" }}>💰 ₹{d.consultationFee}</div>
                  <div style={{ color: "var(--text-muted)" }}>⏱️ {d.consultationTime} min</div>
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                  <span style={{ fontSize: "0.8rem", color: d.isAcceptingAppointments ? "var(--accent-emerald)" : "var(--accent-rose)", fontWeight: 500 }}>
                    {d.isAcceptingAppointments ? "✓ Accepting Appointments" : "✕ Not Accepting"}
                  </span>
                </div>

                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button onClick={() => openEditModal(d)} className="btn-sm btn-secondary" style={{ flex: 1 }}>✏️ Edit</button>
                  <button onClick={() => setDeleteConfirm(d._id)} className="btn-sm btn-danger" style={{ flex: 1 }}>🗑️ Delete</button>
                </div>
              </div>
            ))}
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

        {/* Delete Confirm */}
        {deleteConfirm && (
          <div className="admin-modal" onClick={() => setDeleteConfirm(null)}>
            <div className="admin-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 400 }}>
              <div style={{ textAlign: "center", padding: "1rem 0" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>⚠️</div>
                <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.15rem", marginBottom: "0.5rem" }}>Delete Doctor?</h3>
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
                  This action cannot be undone. The doctor's record will be permanently removed.
                </p>
                <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
                  <button onClick={() => setDeleteConfirm(null)} className="btn-secondary" style={{ padding: "0.6rem 1.5rem" }}>Cancel</button>
                  <button onClick={() => handleDelete(deleteConfirm)} className="btn-danger" style={{ padding: "0.6rem 1.5rem" }}>Delete</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="admin-modal" onClick={() => setShowModal(false)}>
            <div className="admin-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
              <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.2rem", marginBottom: "1.5rem" }}>
                {editingDoctor ? "Edit Doctor" : "Add New Doctor"}
              </h2>

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label className="input-label">Doctor Name *</label>
                    <input type="text" className="input-field" placeholder="Dr. John Smith" value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                  </div>
                  <div>
                    <label className="input-label">Specialization *</label>
                    <input type="text" className="input-field" placeholder="Cardiology" value={formData.specialization}
                      onChange={(e) => setFormData({ ...formData, specialization: e.target.value })} required />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label className="input-label">Experience (years) *</label>
                    <input type="number" className="input-field" placeholder="5" value={formData.experience} min="0"
                      onChange={(e) => setFormData({ ...formData, experience: e.target.value })} required />
                  </div>
                  <div>
                    <label className="input-label">Fee (₹) *</label>
                    <input type="number" className="input-field" placeholder="500" value={formData.consultationFee} min="0"
                      onChange={(e) => setFormData({ ...formData, consultationFee: e.target.value })} required />
                  </div>
                  <div>
                    <label className="input-label">Time (min) *</label>
                    <input type="number" className="input-field" placeholder="15" value={formData.consultationTime} min="1"
                      onChange={(e) => setFormData({ ...formData, consultationTime: e.target.value })} required />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label className="input-label">Availability Status</label>
                    <select className="input-field" value={formData.availabilityStatus}
                      onChange={(e) => setFormData({ ...formData, availabilityStatus: e.target.value })}>
                      <option value="Available">Available</option>
                      <option value="Busy">Busy</option>
                      <option value="On Leave">On Leave</option>
                    </select>
                  </div>
                  <div>
                    <label className="input-label">Accepting Appointments</label>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.85rem 0" }}>
                      <button type="button" onClick={() => setFormData({ ...formData, isAcceptingAppointments: !formData.isAcceptingAppointments })}
                        style={{
                          width: 48, height: 26, borderRadius: 13, border: "none", cursor: "pointer",
                          background: formData.isAcceptingAppointments ? "var(--accent-emerald)" : "var(--bg-tertiary)",
                          position: "relative", transition: "all 0.3s ease",
                        }}>
                        <span style={{
                          position: "absolute", top: 3, width: 20, height: 20, borderRadius: "50%", background: "white",
                          transition: "all 0.3s ease",
                          left: formData.isAcceptingAppointments ? 25 : 3,
                        }} />
                      </button>
                      <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                        {formData.isAcceptingAppointments ? "Yes" : "No"}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                  <button type="button" onClick={() => setShowModal(false)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
                  <button type="submit" className="btn-primary" disabled={saving} style={{ flex: 1, opacity: saving ? 0.7 : 1 }}>
                    {saving ? (
                      <span style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
                        <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Saving...
                      </span>
                    ) : editingDoctor ? "Update Doctor" : "Add Doctor"}
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

export default AdminManageDoctors;
