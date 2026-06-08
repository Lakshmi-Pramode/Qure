import { useState, useRef, useEffect } from "react";
import API from "../api/axios";
const SUGGESTED_QUESTIONS = [
  "Which hospital has the shortest queue?",
  "Recommend a cardiologist",
  "Recommend a dermatologist",
  "What is my estimated waiting time?",
  "Which hospital is least crowded today?",
  "Best time to visit today?",
  "Which doctor is available now?",
];

function AIAssistant() {
  const [messages, setMessages] = useState([
    {
      role: "ai",
      content: "Hello! 👋 I'm Qure AI, your smart healthcare assistant. I can help you find the best hospitals, shortest queues, and optimal visit times. What would you like to know?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  
 const handleSend = async (text) => {
  const msgText = text || input.trim();

  if (!msgText) return;

  const userMsg = {
    role: "user",
    content: msgText,
  };

  setMessages((prev) => [...prev, userMsg]);

  setInput("");
  setLoading(true);

  try {
    const res = await API.post("/ai/chat", {
      prompt: `
You are Qure AI Assistant.

Rules:
- You are a healthcare queue assistant.
- Help users find hospitals.
- Help users find doctors.
- Help users estimate waiting time.
- Suggest best visiting times.
- Keep answers concise.
- Use bullet points.

User Question:
${msgText}
      `,
    });

    setMessages((prev) => [
      ...prev,
      {
        role: "ai",
        content:
          res.data.answer ||
          "Sorry, I couldn't generate a response.",
      },
    ]);
  } catch (error) {
    console.error(error);

    setMessages((prev) => [
      ...prev,
      {
        role: "ai",
        content:
          "⚠️ Failed to connect with Gemini AI.",
      },
    ]);
  }

  setLoading(false);
  inputRef.current?.focus();
};
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatMessage = (text) => {
    // Escape HTML to prevent XSS, then apply formatting
    let formatted = text
      // Bold: **text**
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Italic: *text* (but not bullet points at line start)
      .replace(/(?<!\n)(?<!^)\*(?!\*)(.*?)\*(?!\*)/g, '<em>$1</em>')
      // Headers: ## text or ### text
      .replace(/^### (.+)$/gm, '<strong style="font-size:1rem;display:block;margin:0.5rem 0 0.25rem">$1</strong>')
      .replace(/^## (.+)$/gm, '<strong style="font-size:1.05rem;display:block;margin:0.6rem 0 0.3rem">$1</strong>')
      // Bullet points: - item or * item
      .replace(/^[\-\*] (.+)$/gm, '<div style="display:flex;gap:0.5rem;margin:0.2rem 0;padding-left:0.25rem"><span style="color:var(--accent-cyan)">•</span><span>$1</span></div>')
      // Numbered lists: 1. item
      .replace(/^(\d+)\. (.+)$/gm, '<div style="display:flex;gap:0.5rem;margin:0.2rem 0;padding-left:0.25rem"><span style="color:var(--accent-cyan);font-weight:600;min-width:1.2rem">$1.</span><span>$2</span></div>')
      // Line breaks
      .replace(/\n/g, '<br />');
    return formatted;
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg-primary)" }}>
     {/* Header */}
<div
  style={{
    background: "var(--surface)",
    borderBottom: "1px solid var(--surface-border)",
    padding: "1rem 0",
    flexShrink: 0,
  }}
>
  <div
    className="container-main"
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          background: "var(--gradient-primary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.2rem",
        }}
      >
        🤖
      </div>

      <div>
        <h1
          style={{
            fontFamily: "var(--font-heading)",
            fontWeight: 700,
            fontSize: "1.15rem",
            margin: 0,
          }}
        >
          Qure <span className="gradient-text">AI Assistant</span>
        </h1>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginTop: 2,
          }}
        >
          <span
            className="live-dot"
            style={{ width: 6, height: 6 }}
          />
          <span
            style={{
              fontSize: "0.75rem",
              color: "var(--accent-emerald)",
            }}
          >
            Online
          </span>
        </div>
      </div>
    </div>

    {/* Clear Chat Button */}
    <button
      onClick={() =>
        setMessages([
          {
            role: "ai",
            content:
              "Hello! 👋 I'm Qure AI Assistant. I can help you find hospitals, doctors, queue status, waiting times, and healthcare information. How can I assist you today?",
          },
        ])
      }
      className="btn-ghost"
      style={{
        padding: "0.6rem 1rem",
        borderRadius: "12px",
        cursor: "pointer",
      }}
    >
      🗑️ Clear Chat
    </button>
  </div>
</div>

      {/* Messages */}
      <div style={{ flex: 1, overflow: "auto", padding: "1.5rem 0" }}>
        <div className="container-main" style={{ maxWidth: 800 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
                {msg.role === "ai" && (
                  <div style={{
                    width: 32, height: 32, borderRadius: 10, flexShrink: 0, marginRight: 8, marginTop: 4,
                    background: "var(--gradient-primary)", display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.9rem",
                  }}>🤖</div>
                )}
                <div className={msg.role === "user" ? "chat-bubble-user" : "chat-bubble-ai"}>
                  <span dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }} />
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                  background: "var(--gradient-primary)", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.9rem",
                }}>🤖</div>
                <div className="chat-bubble-ai" style={{ display: "flex", gap: 6, padding: "1rem 1.25rem" }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent-cyan)", animation: "dot-pulse 1.5s infinite" }} />
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent-cyan)", animation: "dot-pulse 1.5s infinite 0.3s" }} />
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent-cyan)", animation: "dot-pulse 1.5s infinite 0.6s" }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions (only show when few messages) */}
          {messages.length <= 2 && (
            <div style={{ marginTop: "1.5rem" }}>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.75rem" }}>Try asking:</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {SUGGESTED_QUESTIONS.map((q, i) => (
                  <button key={i} onClick={() => handleSend(q)}
                    className="btn-ghost" style={{
                      padding: "0.5rem 1rem", borderRadius: "var(--radius-full)",
                      border: "1px solid var(--glass-border)", fontSize: "0.8rem",
                      background: "var(--surface)",
                    }}>
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div style={{
        borderTop: "1px solid var(--surface-border)", padding: "1rem 0",
        background: "var(--surface)", flexShrink: 0,
      }}>
        <div className="container-main" style={{ maxWidth: 800 }}>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about queues, hospitals, doctors, wait times..."
              className="input-field"
              style={{ flex: 1 }}
              disabled={loading}
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="btn-primary"
              style={{
                padding: "0.75rem 1.5rem", flexShrink: 0,
                opacity: loading || !input.trim() ? 0.5 : 1,
              }}
            >
              {loading ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : "Send →"}
            </button>
          </div>
          <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "0.5rem", textAlign: "center" }}>
            Powered by AI · Responses are based on current queue data in the system
          </p>
        </div>
      </div>
    </div>
  );
}

export default AIAssistant;
