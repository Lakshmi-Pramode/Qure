import { useState, useEffect, useCallback } from "react";
import API from "../../api/axios";
import AdminLayout from "../../components/AdminLayout";

function AdminQueueManagement() {
  const [queues, setQueues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [setTokenModal, setSetTokenModal] = useState(null);
  const [tokenValue, setTokenValue] = useState("");
  const [toast, setToast] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const admin = (() => {
    try { return JSON.parse(localStorage.getItem("adminInfo")); } catch { return null; }
  })();
  const headers = { Authorization: `Bearer ${admin?.token}` };

  const fetchQueues = useCallback(async () => {
    try {
      const res = await API.get("/admin/queues", { headers });
      setQueues(res.data);
    } catch (error) {
      console.error("Failed to fetch queues:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQueues();
    // Poll every 30 seconds (real-time ready — swap for Socket.io later)
    const interval = setInterval(fetchQueues, 30000);
    return () => clearInterval(interval);
  }, [fetchQueues]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const advanceToken = async (queueId) => {
    setActionLoading(queueId);
    try {
      await API.put(`/admin/queues/${queueId}/advance`, {}, { headers });
      showToast("Token advanced");
      fetchQueues();
    } catch (error) {
      showToast("Failed to advance token", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSetToken = async (e) => {
    e.preventDefault();
    if (!setTokenModal) return;
    setActionLoading(setTokenModal._id);
    try {
      await API.put(`/admin/queues/${setTokenModal._id}/set-token`, { currentToken: Number(tokenValue) }, { headers });
      showToast("Token updated");
      setSetTokenModal(null);
      fetchQueues();
    } catch (error) {
      showToast("Failed to set token", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const skipPatient = async (queueId) => {
    // For skip, we'll advance token and cancel current — simplified approach
    setActionLoading(queueId);
    try {
      // Find current appointment for this queue
      const queue = queues.find((q) => q._id === queueId);
      if (queue) {
        await API.put(`/admin/queues/${queueId}/advance`, {}, { headers });
        showToast("Patient skipped, token advanced");
        fetchQueues();
      }
    } catch (error) {
      showToast("Failed to skip patient", "error");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <AdminLayout>
      <div style={{ padding: "2rem 2rem 4rem" }}>
        {/* Header */}
        <div className="animate-in" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "clamp(1.4rem, 3vw, 1.8rem)", marginBottom: "0.2rem" }}>
              Queue <span className="gradient-text-accent">Management</span>
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", margin: 0 }}>
              {queues.length} active queue{queues.length !== 1 ? "s" : ""} · Auto-refreshes every 30s
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="live-dot" />
            <span style={{ fontSize: "0.82rem", color: "var(--accent-emerald)", fontWeight: 500 }}>Live</span>
          </div>
        </div>

        {/* Queue Cards */}
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.25rem" }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="glass-card-static" style={{ padding: "1.5rem" }}>
                <div className="skeleton" style={{ height: 24, width: "60%", marginBottom: 16 }} />
                <div className="skeleton" style={{ height: 80, marginBottom: 16 }} />
                <div className="skeleton" style={{ height: 36, width: "100%" }} />
              </div>
            ))}
          </div>
        ) : queues.length === 0 ? (
          <div className="glass-card-static" style={{ padding: "3rem", textAlign: "center" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>📡</div>
            <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, marginBottom: "0.5rem" }}>No queues available</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
              Queues will appear once doctors are registered and queues are created.
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.25rem" }}>
            {queues.map((q, i) => (
              <div key={q._id} className="glass-card-static animate-in" style={{ animationDelay: `${i * 0.06}s`, padding: "1.5rem" }}>
                {/* Doctor Info */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
                  <div className="avatar" style={{ width: 44, height: 44, fontSize: "1rem", background: "linear-gradient(135deg, #8b5cf6, #06b6d4)" }}>
                    {q.doctorId?.name?.charAt(0) || "?"}
                  </div>
                  <div>
                    <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1rem", marginBottom: "0.1rem" }}>
                      {q.doctorId?.name || "Unknown Doctor"}
                    </h3>
                    <span style={{ fontSize: "0.82rem", color: "var(--accent-cyan)" }}>
                      {q.doctorId?.specialization || "—"}
                    </span>
                  </div>
                </div>

                {/* Token Display */}
                <div style={{
                  background: "var(--surface)", border: "1px solid var(--surface-border)",
                  borderRadius: "var(--radius-lg)", padding: "1.25rem",
                  textAlign: "center", marginBottom: "1.25rem",
                }}>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "0.4rem" }}>
                    Current Token
                  </div>
                  <div className="stat-number" style={{ fontSize: "2.5rem", lineHeight: 1 }}>
                    {q.currentToken}
                  </div>
                  <div style={{ marginTop: "0.75rem", display: "flex", justifyContent: "center", gap: "1.5rem" }}>
                    <div>
                      <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--accent-amber)" }}>{q.waitingCount}</div>
                      <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Waiting</div>
                    </div>
                    <div style={{ width: 1, background: "var(--surface-border)" }} />
                    <div>
                      <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--accent-emerald)" }}>
                        {q.currentToken > 0 ? q.currentToken : 0}
                      </div>
                      <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Served</div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <button
                    onClick={() => advanceToken(q._id)}
                    disabled={actionLoading === q._id}
                    className="btn-primary"
                    style={{ width: "100%", padding: "0.7rem", fontSize: "0.88rem", opacity: actionLoading === q._id ? 0.7 : 1 }}
                  >
                    {actionLoading === q._id ? "Processing..." : "▶ Next Token"}
                  </button>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      onClick={() => { setSetTokenModal(q); setTokenValue(String(q.currentToken)); }}
                      className="btn-secondary"
                      style={{ flex: 1, padding: "0.6rem", fontSize: "0.82rem" }}
                    >
                      🔢 Set Token
                    </button>
                    <button
                      onClick={() => skipPatient(q._id)}
                      disabled={actionLoading === q._id}
                      className="btn-sm"
                      style={{
                        flex: 1, padding: "0.6rem", fontSize: "0.82rem",
                        background: "rgba(245,158,11,0.12)", color: "var(--accent-amber)",
                        border: "1px solid rgba(245,158,11,0.2)", cursor: "pointer",
                        borderRadius: "var(--radius-md)",
                      }}
                    >
                      ⏭️ Skip Patient
                    </button>
                  </div>
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

        {/* Set Token Modal */}
        {setTokenModal && (
          <div className="admin-modal" onClick={() => setSetTokenModal(null)}>
            <div className="admin-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 380 }}>
              <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.15rem", marginBottom: "1rem" }}>
                Set Token Number
              </h2>
              <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", marginBottom: "1.25rem" }}>
                Doctor: <strong style={{ color: "var(--text-primary)" }}>{setTokenModal.doctorId?.name}</strong>
              </p>
              <form onSubmit={handleSetToken} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <label className="input-label">Token Number</label>
                  <input type="number" className="input-field" value={tokenValue}
                    onChange={(e) => setTokenValue(e.target.value)} min="0" required
                    style={{ fontSize: "1.25rem", textAlign: "center", fontWeight: 700 }} />
                </div>
                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <button type="button" onClick={() => setSetTokenModal(null)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
                  <button type="submit" className="btn-primary" style={{ flex: 1 }}>Set Token</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default AdminQueueManagement;
