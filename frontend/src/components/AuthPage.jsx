import React, { useState } from "react";

const API_BASE = process.env.REACT_APP_API_URL || (window.location.hostname === "localhost" ? "http://localhost:5000" : "");
const API = `${API_BASE}/api/auth`;

export default function AuthPage({ onAuthenticated }) {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API}/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.status === "success") {
        onAuthenticated(data.user);
      } else {
        setError(data.message || "Something went wrong.");
      }
    } catch {
      setError("Unable to connect to server. Is the backend running?");
    }
    setLoading(false);
  }

  return (
    <div style={styles.root}>
      {/* Background grid - made even more subtle */}
      <div style={styles.grid} />

      <div id="fixy-auth-card" style={styles.card}>
        {/* Brand - Minimalist */}
        <div style={styles.logoRow}>
          <span id="fixy-auth-logo" style={styles.logoText}>CIRCUIT FIXER</span>
        </div>

        <form onSubmit={handleSubmit} style={styles.form} autoComplete="on">
          {/* Email */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Email address</label>
            <div style={styles.inputWrap}>
              <svg style={styles.inputIcon} width="16" height="16" viewBox="0 0 24 24"
                fill="none" stroke="#71717a" strokeWidth="2" strokeLinecap="round">
                <rect x="2" y="4" width="20" height="16" rx="2"/>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
              </svg>
              <input
                id="fixy-email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(""); }}
                required
                style={styles.input}
              />
            </div>
          </div>

          {/* Password */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Password</label>
            <div style={styles.inputWrap}>
              <svg style={styles.inputIcon} width="16" height="16" viewBox="0 0 24 24"
                fill="none" stroke="#71717a" strokeWidth="2" strokeLinecap="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <input
                id="fixy-password"
                type={showPw ? "text" : "password"}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                placeholder={mode === "login" ? "Your password" : "Min. 8 characters"}
                value={password}
                onChange={e => { setPassword(e.target.value); setError(""); }}
                required
                style={{ ...styles.input, paddingRight: 44 }}
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                style={styles.eyeBtn}
                tabIndex={-1}
                aria-label="Toggle password visibility"
              >
                {showPw ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#71717a" strokeWidth="2" strokeLinecap="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#71717a" strokeWidth="2" strokeLinecap="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Error message - more subtle/professional */}
          {error && (
            <div style={styles.errorBox}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fca5a5" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              {error}
            </div>
          )}

          {/* Submit - Pure White for Premium Look */}
          <button
            id="fixy-auth-submit"
            type="submit"
            disabled={loading}
            style={{
              ...styles.submitBtn,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? (
              <span style={styles.spinner} />
            ) : (
              <>
                {mode === "login" ? "Sign in" : "Create account"}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
              </>
            )}
          </button>
        </form>

        {/* Toggle mode */}
        <p style={styles.toggleText}>
          {mode === "login" ? "Don't have an account? " : "Already have an account? "}
          <button
            style={styles.toggleBtn}
            onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
          >
            {mode === "login" ? "Sign up" : "Sign in"}
          </button>
        </p>

      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input:-webkit-autofill { -webkit-box-shadow: 0 0 0 40px #09090b inset !important; -webkit-text-fill-color: #f4f4f5 !important; }
        input:focus { outline: none; border-color: #f4f4f5 !important; }
        button:hover { filter: brightness(0.9); }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
        @media (max-width: 480px) {
          #fixy-auth-card { padding: 32px 24px !important; margin: 0 16px; }
          #fixy-auth-logo { font-size: 20px !important; letter-spacing: 2px !important; }
        }
      `}</style>
    </div>
  );
}

const styles = {
  root: {
    minHeight: "100vh",
    background: "#09090b", // Pure dark zinc
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Inter', sans-serif",
    position: "relative",
    overflow: "hidden",
  },
  grid: {
    position: "absolute",
    inset: 0,
    backgroundImage: "radial-gradient(circle, #ffffff05 1px, transparent 1px)", // Very faint grid
    backgroundSize: "40px 40px",
    pointerEvents: "none",
  },
  card: {
    position: "relative",
    zIndex: 1,
    width: "100%",
    maxWidth: 400,
    background: "#121214",
    border: "1px solid #27272a",
    borderRadius: 12,
    padding: "48px 40px",
    boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
    animation: "fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
  },
  logoRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 48,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 800,
    color: "#ffffff",
    letterSpacing: "4px",
    textTransform: "uppercase",
  },
  heading: {
    fontSize: 24,
    fontWeight: 600,
    color: "#ffffff",
    letterSpacing: "-0.5px",
    marginBottom: 8,
  },
  subheading: {
    fontSize: 14,
    color: "#a1a1aa",
    marginBottom: 36,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 24,
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: 500,
    color: "#71717a",
    letterSpacing: "0.5px",
    textTransform: "uppercase",
  },
  inputWrap: {
    position: "relative",
  },
  inputIcon: {
    position: "absolute",
    left: 14,
    top: "50%",
    transform: "translateY(-50%)",
    pointerEvents: "none",
  },
  input: {
    width: "100%",
    background: "#09090b",
    border: "1px solid #27272a",
    borderRadius: 8,
    padding: "12px 14px 12px 42px",
    fontSize: 14,
    color: "#ffffff",
    fontFamily: "'Inter', sans-serif",
    transition: "all 0.2s ease",
    display: "block",
  },
  eyeBtn: {
    position: "absolute",
    right: 12,
    top: "50%",
    transform: "translateY(-50%)",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: 4,
    display: "flex",
    alignItems: "center",
  },
  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "rgba(127,29,29,0.2)",
    border: "1px solid rgba(248,113,113,0.2)",
    borderRadius: 6,
    padding: "12px",
    fontSize: 13,
    color: "#fca5a5",
    marginTop: -4,
  },
  submitBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 8,
    padding: "14px 24px",
    background: "#ffffff", // Pure white
    border: "none",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    color: "#000000", // Black text on white
    fontFamily: "'Inter', sans-serif",
    transition: "all 0.2s ease",
    width: "100%",
  },
  spinner: {
    width: 18,
    height: 18,
    border: "2px solid rgba(0,0,0,0.1)",
    borderTopColor: "#000",
    borderRadius: "50%",
    display: "inline-block",
    animation: "spin 0.7s linear infinite",
  },
  toggleText: {
    marginTop: 28,
    textAlign: "center",
    fontSize: 14,
    color: "#71717a",
  },
  toggleBtn: {
    background: "none",
    border: "none",
    color: "#ffffff",
    fontWeight: 600,
    fontSize: 14,
    cursor: "pointer",
    fontFamily: "'Inter', sans-serif",
    marginLeft: 4,
    textDecoration: "underline",
    textDecorationThickness: "1px",
    textUnderlineOffset: "4px",
  },
  sessionNote: {
    marginTop: 20,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    fontSize: 11,
    color: "#3f3f46",
    textTransform: "uppercase",
    letterSpacing: "1px",
  },
};
