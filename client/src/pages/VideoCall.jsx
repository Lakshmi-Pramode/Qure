/**
 * ====================================================
 * VIDEO CALL PAGE — Jitsi Meet Integration
 * ====================================================
 *
 * 📚 WHAT IS JITSI MEET?
 * Jitsi is a FREE, open-source video conferencing platform.
 * It works like Zoom/Google Meet but requires:
 *   - No account signup
 *   - No API keys
 *   - No payment
 *
 * 🔄 HOW IT WORKS:
 *   1. Patient books a "Video Call" appointment and pays
 *   2. When it's time, they click "Join Video Call"
 *   3. This page loads with Jitsi embedded
 *   4. The doctor joins the same room using the same link
 *   5. Both can see each other, talk, share screen, chat
 *   6. When done, they leave → appointment is marked complete
 *
 * 🔑 ROOM NAMING:
 * Each video call gets a unique room name based on the appointment ID:
 *   Room: "QureMeet-{appointmentId}"
 * This ensures no two calls collide.
 *
 * 📹 JITSI IFRAME API:
 * We use Jitsi's IFrame API which embeds a full video call
 * inside our page. It provides:
 *   - Video & audio streams
 *   - Screen sharing
 *   - Chat
 *   - Recording (optional)
 *   - Raise hand, reactions
 *   - Works on all browsers
 */

import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

function VideoCall() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const jitsiContainerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Get user info for the call
  const userInfo = (() => {
    try { return JSON.parse(localStorage.getItem("userInfo")); }
    catch { return null; }
  })();

  const userName = userInfo?.user?.name || "Patient";
  const userEmail = userInfo?.user?.email || "";

  useEffect(() => {
    if (!appointmentId) {
      setError("No appointment ID provided.");
      setLoading(false);
      return;
    }

    // Load the Jitsi Meet external API script
    const script = document.createElement("script");
    script.src = "https://meet.jit.si/external_api.js";
    script.async = true;

    script.onload = () => {
      try {
        // Create the Jitsi Meet room
        const api = new window.JitsiMeetExternalAPI("meet.jit.si", {
          // Room name — unique per appointment
          roomName: `QureMeet-${appointmentId}`,

          // Embed inside our container div
          parentNode: jitsiContainerRef.current,

          // Size
          width: "100%",
          height: "100%",

          // User info
          userInfo: {
            displayName: userName,
            email: userEmail,
          },

          // UI configuration
          configOverwrite: {
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            prejoinPageEnabled: false, // Skip the "join" preview screen
            disableDeepLinking: true,
          },

          // Interface customization
          interfaceConfigOverwrite: {
            TOOLBAR_BUTTONS: [
              "microphone", "camera", "desktop", "fullscreen",
              "chat", "raisehand", "hangup",
              "tileview", "settings",
            ],
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            SHOW_BRAND_WATERMARK: false,
            BRAND_WATERMARK_LINK: "",
            SHOW_POWERED_BY: false,
            DEFAULT_BACKGROUND: "#0f172a",
          },
        });

        setLoading(false);

        // When user hangs up, navigate back to dashboard
        api.addEventListener("readyToClose", () => {
          navigate("/dashboard");
        });

        // Cleanup when component unmounts
        return () => {
          api.dispose();
        };
      } catch (err) {
        console.error("Jitsi init error:", err);
        setError("Failed to start video call. Please try again.");
        setLoading(false);
      }
    };

    script.onerror = () => {
      setError("Failed to load video call service. Check your internet connection.");
      setLoading(false);
    };

    document.body.appendChild(script);

    return () => {
      // Remove the script on unmount
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [appointmentId, userName, userEmail, navigate]);

  // Error state
  if (error) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-primary)" }}>
        <div className="glass-card-static" style={{ textAlign: "center", padding: "3rem", maxWidth: 400 }}>
          <p style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>❌</p>
          <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, marginBottom: "0.5rem" }}>
            Video Call Error
          </h2>
          <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>{error}</p>
          <Link to="/dashboard" className="btn-primary">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#0f172a" }}>
      {/* Top Bar */}
      <div style={{
        padding: "0.75rem 1.5rem",
        background: "rgba(15, 23, 42, 0.95)",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "var(--gradient-primary)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "0.9rem", color: "white",
          }}>Q</div>
          <div>
            <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "white" }}>
              Qure <span style={{ color: "var(--accent-cyan)" }}>Video Consultation</span>
            </span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", animation: "dot-pulse 2s infinite" }} />
            <span style={{ fontSize: "0.8rem", color: "#10b981" }}>Live</span>
          </div>
          <button onClick={() => navigate("/dashboard")}
            style={{
              padding: "0.4rem 1rem", borderRadius: 8, border: "1px solid rgba(255,255,255,0.15)",
              background: "rgba(255,255,255,0.05)", color: "white", cursor: "pointer",
              fontSize: "0.8rem", fontWeight: 500,
            }}>
            Leave Call
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div style={{
          flex: 1, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: "1.5rem",
        }}>
          <div style={{
            width: 80, height: 80, borderRadius: 20,
            background: "var(--gradient-primary)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "2.5rem", animation: "dot-pulse 2s infinite",
          }}>📹</div>
          <div style={{ textAlign: "center" }}>
            <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, color: "white", marginBottom: "0.5rem" }}>
              Starting Video Call...
            </h2>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9rem" }}>
              Connecting to secure consultation room
            </p>
          </div>
          <span className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
        </div>
      )}

      {/* Jitsi Meet Container */}
      <div ref={jitsiContainerRef} style={{
        flex: 1,
        display: loading ? "none" : "block",
      }} />
    </div>
  );
}

export default VideoCall;
