/**
 * ====================================================
 * APPOINTMENT PAGE — With Simulated Payment Popup
 * ====================================================
 *
 * 📚 WHAT'S DIFFERENT FROM RAZORPAY?
 * Instead of Razorpay's third-party popup, we built our OWN
 * payment modal that simulates the entire payment experience.
 *
 * 🔄 THE FLOW:
 *   1. User selects date & consultation type → clicks "Book & Pay"
 *   2. Backend creates an order (mock order ID)
 *   3. Our custom payment popup opens (UPI / Card / Net Banking tabs)
 *   4. User enters dummy details & clicks "Pay ₹XXX"
 *   5. We simulate a 2-second processing delay
 *   6. Frontend gets a mock signature from backend
 *   7. Backend verifies signature → marks appointment as "Paid"
 *   8. Success screen! 🎉
 *
 * This is how real payment gateways work internally —
 * we're just doing it all ourselves for the demo.
 */

import { useLocation, Link } from "react-router-dom";
import { useState } from "react";
import API from "../api/axios";

const VIDEO_SURCHARGE = 200;

function Appointment() {
  const { state } = useLocation();
  const doctor = state?.doctor;
  const hospital = state?.hospital;

  const [appointmentDate, setAppointmentDate] = useState("");
  const [consultationType, setConsultationType] = useState("In-Person");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  // Payment popup state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [orderData, setOrderData] = useState(null);

  // Dummy form fields for the payment popup
  const [upiId, setUpiId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");

  const baseFee = doctor?.consultationFee || 0;
  const isVideoCall = consultationType === "Video Call";
  const totalFee = isVideoCall ? baseFee + VIDEO_SURCHARGE : baseFee;

  const getAuthHeaders = () => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    return { headers: { Authorization: `Bearer ${userInfo?.token}` } };
  };

  // Step 1: Create order and open payment popup
  const handleBookAndPay = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await API.post("/payments/create-order", {
        doctorId: doctor._id,
        hospitalId: hospital._id,
        appointmentDate,
        consultationType,
      }, getAuthHeaders());

      setOrderData(res.data);
      setShowPaymentModal(true);
    } catch (err) {
      setError(err.response?.data?.message || "Booking failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Process the simulated payment
  const handlePayment = async () => {
    setPaymentProcessing(true);

    // Simulate 2-second payment processing delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    try {
      // Generate a mock payment ID
      const paymentId = `pay_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

      // Get mock signature from backend (simulates Razorpay's server-side signing)
      const sigRes = await API.post("/payments/mock-signature", {
        orderId: orderData.orderId,
        paymentId,
      }, getAuthHeaders());

      // Verify the payment with backend
      const verifyRes = await API.post("/payments/verify", {
        orderId: orderData.orderId,
        paymentId,
        signature: sigRes.data.signature,
        appointmentId: orderData.appointmentId,
      }, getAuthHeaders());

      // Success!
      setShowPaymentModal(false);
      setResult({
        ...verifyRes.data.appointment,
        tokenNumber: orderData.tokenNumber,
        estimatedWaitTime: orderData.estimatedWaitTime,
      });
    } catch (err) {
      setError("Payment verification failed. Please try again.");
      setShowPaymentModal(false);
    } finally {
      setPaymentProcessing(false);
    }
  };

  if (!doctor || !hospital) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-primary)" }}>
        <div className="glass-card-static" style={{ textAlign: "center", padding: "3rem", maxWidth: 400 }}>
          <p style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>📅</p>
          <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, marginBottom: "0.5rem" }}>No Doctor Selected</h2>
          <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>Please select a doctor from a hospital to book an appointment.</p>
          <Link to="/hospitals" className="btn-primary">Browse Hospitals →</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="animated-bg" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem 1rem" }}>
      <span className="orb-extra" style={{ top: "15%", left: "15%" }} />
      <div className="container-main" style={{ maxWidth: 560, position: "relative", zIndex: 1 }}>
        <div className="animate-in">
          <Link to={`/hospital/${hospital._id}`} className="btn-ghost" style={{ marginBottom: "1rem", display: "inline-flex", padding: "0.4rem 0" }}>
            ← Back to {hospital.name}
          </Link>
        </div>

        <div className="glass-card-static gradient-border-top animate-in-delay-1" style={{ padding: "2rem" }}>
          <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.6rem", marginBottom: "1.5rem", textAlign: "center" }}>
            Book Appointment
          </h1>

          {/* Doctor Summary Card */}
          <div className="glass-card-static" style={{ padding: "1.25rem", marginBottom: "1.5rem", background: "rgba(6,182,212,0.05)", borderColor: "rgba(6,182,212,0.15)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div className="avatar" style={{ width: 48, height: 48 }}>{doctor.name?.charAt(0)?.toUpperCase()}</div>
              <div>
                <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.05rem" }}>{doctor.name}</h3>
                <span className="badge" style={{ fontSize: "0.7rem", padding: "0.1rem 0.5rem" }}>{doctor.specialization}</span>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginTop: "1rem" }}>
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Hospital</div>
                <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{hospital.name}</div>
              </div>
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Base Fee</div>
                <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>₹{baseFee}</div>
              </div>
            </div>
          </div>

          {!result ? (
            <form onSubmit={handleBookAndPay} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div>
                <label className="input-label">Appointment Date</label>
                <input type="date" value={appointmentDate} onChange={(e) => setAppointmentDate(e.target.value)}
                  className="input-field" required min={new Date().toISOString().split("T")[0]} style={{ colorScheme: "dark" }} />
              </div>

              {/* Consultation Type Selector */}
              <div>
                <label className="input-label">Consultation Type</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  {["In-Person", "Video Call"].map((type) => (
                    <button key={type} type="button" onClick={() => setConsultationType(type)}
                      style={{
                        padding: "1rem", borderRadius: "var(--radius-lg, 12px)",
                        border: `2px solid ${consultationType === type ? "var(--accent-cyan)" : "var(--surface-border)"}`,
                        background: consultationType === type ? "rgba(6,182,212,0.1)" : "var(--surface)",
                        color: "var(--text-primary)", cursor: "pointer", transition: "all 0.2s ease", textAlign: "center",
                      }}>
                      <div style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>{type === "In-Person" ? "🏥" : "📹"}</div>
                      <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{type}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                        {type === "In-Person" ? `₹${baseFee}` : `₹${baseFee} + ₹${VIDEO_SURCHARGE}`}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Fee Breakdown */}
              <div className="glass-card-static" style={{ padding: "1rem 1.25rem", background: "rgba(139,92,246,0.05)", borderColor: "rgba(139,92,246,0.15)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                  <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Consultation Fee</span>
                  <span style={{ fontSize: "0.9rem" }}>₹{baseFee}</span>
                </div>
                {isVideoCall && (
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                    <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Video Call Surcharge</span>
                    <span style={{ fontSize: "0.9rem" }}>₹{VIDEO_SURCHARGE}</span>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "0.5rem", borderTop: "1px solid var(--surface-border)", fontWeight: 700, fontSize: "1.05rem" }}>
                  <span>Total</span>
                  <span className="gradient-text">₹{totalFee}</span>
                </div>
              </div>

              {error && <div className="toast-error" style={{ fontSize: "0.9rem" }}>{error}</div>}

              <button type="submit" className="btn-primary" disabled={loading}
                style={{ width: "100%", padding: "0.85rem", fontSize: "1rem", opacity: loading ? 0.7 : 1 }}>
                {loading ? (
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Creating order...
                  </span>
                ) : `Book & Pay ₹${totalFee} →`}
              </button>
              <p style={{ textAlign: "center", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                🔒 Secure payment · UPI, Cards & Net Banking
              </p>
            </form>
          ) : (
            /* Success Screen */
            <div className="animate-scale" style={{ textAlign: "center" }}>
              <div style={{ width: 72, height: 72, borderRadius: "50%", margin: "0 auto 1.25rem", background: "rgba(16,185,129,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem" }}>✅</div>
              <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.4rem", marginBottom: "0.5rem" }}>Payment Successful!</h2>
              <p style={{ color: "var(--text-secondary)", marginBottom: "1.25rem" }}>Your appointment has been confirmed and payment received.</p>
              <div className="glass-card-static" style={{ padding: "1.25rem", textAlign: "left", marginBottom: "1.5rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Token Number</div>
                    <div className="stat-number" style={{ fontSize: "1.5rem" }}>{result.tokenNumber}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Date</div>
                    <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>{appointmentDate}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Payment</div>
                    <span className="badge-success">₹{result.consultationFee || totalFee} Paid</span>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Type</div>
                    <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>{result.consultationType === "Video Call" ? "📹 Video Call" : "🏥 In-Person"}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Status</div>
                    <span className="badge-success">Approved</span>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Est. Wait</div>
                    <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>{result.estimatedWaitTime || "~15"} min</div>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
                <Link to="/queue" className="btn-primary">Track Queue →</Link>
                <Link to="/dashboard" className="btn-secondary">Dashboard</Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ====== PAYMENT POPUP MODAL ====== */}
      {showPaymentModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999,
          background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "1rem", animation: "fade-in-up 0.3s ease-out",
        }}>
          <div style={{
            background: "var(--bg-primary)", borderRadius: 20,
            width: "100%", maxWidth: 420, maxHeight: "90vh", overflow: "auto",
            border: "1px solid var(--surface-border)",
            boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
          }}>
            {/* Popup Header */}
            <div style={{
              background: "var(--gradient-primary)", padding: "1.5rem", borderRadius: "20px 20px 0 0",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: "1.1rem", color: "white", fontFamily: "var(--font-heading)" }}>Qure Pay</div>
                <div style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.8rem" }}>Secure Payment Gateway</div>
              </div>
              <div style={{ fontWeight: 800, fontSize: "1.4rem", color: "white" }}>₹{totalFee}</div>
            </div>

            <div style={{ padding: "1.5rem" }}>
              {/* Order Info */}
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.25rem", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                <span>Dr. {doctor.name} • {consultationType}</span>
                <span>Order #{orderData?.orderId?.slice(-8)}</span>
              </div>

              {/* Payment Method Tabs */}
              <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
                {[
                  { id: "upi", label: "UPI", icon: "📱" },
                  { id: "card", label: "Card", icon: "💳" },
                  { id: "netbanking", label: "Net Banking", icon: "🏦" },
                ].map((m) => (
                  <button key={m.id} onClick={() => setPaymentMethod(m.id)}
                    style={{
                      flex: 1, padding: "0.7rem 0.5rem", borderRadius: 10, border: "none",
                      background: paymentMethod === m.id ? "rgba(6,182,212,0.15)" : "var(--surface)",
                      color: paymentMethod === m.id ? "var(--accent-cyan)" : "var(--text-secondary)",
                      cursor: "pointer", fontWeight: 600, fontSize: "0.8rem",
                      transition: "all 0.2s ease",
                      outline: paymentMethod === m.id ? "2px solid var(--accent-cyan)" : "1px solid var(--surface-border)",
                    }}>
                    <div style={{ fontSize: "1.2rem", marginBottom: "0.2rem" }}>{m.icon}</div>
                    {m.label}
                  </button>
                ))}
              </div>

              {/* UPI Form */}
              {paymentMethod === "upi" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div>
                    <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 4, display: "block" }}>UPI ID</label>
                    <input type="text" placeholder="yourname@upi" value={upiId} onChange={(e) => setUpiId(e.target.value)}
                      className="input-field" style={{ fontSize: "0.95rem" }} />
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                    {["Google Pay", "PhonePe", "Paytm", "BHIM"].map((app) => (
                      <button key={app} type="button" onClick={() => setUpiId(`demo@${app.toLowerCase().replace(" ", "")}`)}
                        style={{
                          padding: "0.4rem 0.75rem", borderRadius: 8, fontSize: "0.75rem",
                          background: "var(--surface)", border: "1px solid var(--surface-border)",
                          color: "var(--text-secondary)", cursor: "pointer",
                        }}>
                        {app}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Card Form */}
              {paymentMethod === "card" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <div>
                    <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 4, display: "block" }}>Card Number</label>
                    <input type="text" placeholder="4111 1111 1111 1111" value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, "").replace(/(\d{4})/g, "$1 ").trim())}
                      className="input-field" maxLength={19} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                    <div>
                      <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 4, display: "block" }}>Expiry</label>
                      <input type="text" placeholder="MM/YY" value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)} className="input-field" maxLength={5} />
                    </div>
                    <div>
                      <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 4, display: "block" }}>CVV</label>
                      <input type="password" placeholder="•••" value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)} className="input-field" maxLength={3} />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 4, display: "block" }}>Name on Card</label>
                    <input type="text" placeholder="John Doe" value={cardName}
                      onChange={(e) => setCardName(e.target.value)} className="input-field" />
                  </div>
                </div>
              )}

              {/* Net Banking */}
              {paymentMethod === "netbanking" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                  {["SBI", "HDFC", "ICICI", "Axis", "Kotak", "PNB"].map((bank) => (
                    <button key={bank} type="button" onClick={() => {}}
                      style={{
                        padding: "0.75rem", borderRadius: 10, fontSize: "0.85rem", fontWeight: 600,
                        background: "var(--surface)", border: "1px solid var(--surface-border)",
                        color: "var(--text-primary)", cursor: "pointer", transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent-cyan)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--surface-border)"; }}>
                      🏦 {bank}
                    </button>
                  ))}
                </div>
              )}

              {/* Pay Button */}
              <button onClick={handlePayment} disabled={paymentProcessing}
                style={{
                  width: "100%", padding: "0.9rem", marginTop: "1.5rem",
                  borderRadius: 12, border: "none", fontWeight: 700, fontSize: "1rem",
                  background: paymentProcessing ? "var(--surface)" : "var(--gradient-primary)",
                  color: "white", cursor: paymentProcessing ? "not-allowed" : "pointer",
                  transition: "all 0.2s ease",
                }}>
                {paymentProcessing ? (
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                    <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                    Processing Payment...
                  </span>
                ) : `Pay ₹${totalFee}`}
              </button>

              {/* Cancel */}
              <button onClick={() => { setShowPaymentModal(false); setError("Payment was cancelled."); }}
                disabled={paymentProcessing}
                style={{
                  width: "100%", padding: "0.6rem", marginTop: "0.5rem",
                  background: "none", border: "none", color: "var(--text-muted)",
                  cursor: "pointer", fontSize: "0.85rem",
                }}>
                Cancel Payment
              </button>

              {/* Security Badge */}
              <div style={{ textAlign: "center", marginTop: "0.75rem", fontSize: "0.7rem", color: "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                🔒 256-bit SSL Encrypted · Powered by Qure Pay
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Appointment;