import React, { useState } from "react";

const API = "http://localhost:5000/api/auth";

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
      {/* Background grid */}
      <div style={styles.grid} />

      {/* Glow orb */}
      <div style={styles.orb} />

      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logoRow}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
            stroke="#a78bfa" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
          <span style={styles.logoText}>Fixy</span>
        </div>

        <h1 style={styles.heading}>
          {mode === "login" ? "Welcome back" : "Create account"}
        </h1>
        <p style={styles.subheading}>
          {mode === "login"
            ? "Sign in to your workspace"
            : "Start building production architectures"}
        </p>

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

          {/* Error message */}
          {error && (
            <div style={styles.errorBox}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              {error}
            </div>
          )}

          {/* Submit */}
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
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round">
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

        {/* Session note */}
        <div style={styles.sessionNote}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#52525b" strokeWidth="2" strokeLinecap="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          Session persists for 7 days
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input:-webkit-autofill { -webkit-box-shadow: 0 0 0 40px #0d0d14 inset !important; -webkit-text-fill-color: #e4e4e7 !important; }
        input:focus { outline: none; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
      `}</style>
    </div>
  );
}

const styles = {
  root: {
    minHeight: "100vh",
    background: "#070710",
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
    backgroundImage: "radial-gradient(circle, #ffffff08 1px, transparent 1px)",
    backgroundSize: "32px 32px",
    pointerEvents: "none",
  },
  orb: {
    position: "absolute",
    top: "15%",
    left: "50%",
    transform: "translateX(-50%)",
    width: 600,
    height: 300,
    background: "radial-gradient(ellipse, #7c3aed18 0%, transparent 70%)",
    pointerEvents: "none",
    filter: "blur(40px)",
  },
  card: {
    position: "relative",
    zIndex: 1,
    width: "100%",
    maxWidth: 420,
    background: "rgba(13,13,20,0.92)",
    border: "1px solid #27272a",
    borderRadius: 20,
    padding: "40px 36px",
    backdropFilter: "blur(20px)",
    boxShadow: "0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)",
    animation: "fadeUp 0.4s ease",
  },
  logoRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 28,
  },
  logoText: {
    fontSize: 18,
    fontWeight: 700,
    color: "#f4f4f5",
    letterSpacing: "-0.3px",
  },
  heading: {
    fontSize: 26,
    fontWeight: 700,
    color: "#f4f4f5",
    letterSpacing: "-0.5px",
    marginBottom: 6,
  },
  subheading: {
    fontSize: 13,
    color: "#71717a",
    marginBottom: 32,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 7,
  },
  label: {
    fontSize: 12,
    fontWeight: 600,
    color: "#a1a1aa",
    letterSpacing: "0.3px",
    textTransform: "uppercase",
  },
  inputWrap: {
    position: "relative",
  },
  inputIcon: {
    position: "absolute",
    left: 13,
    top: "50%",
    transform: "translateY(-50%)",
    pointerEvents: "none",
  },
  input: {
    width: "100%",
    background: "#0a0a12",
    border: "1px solid #3f3f46",
    borderRadius: 10,
    padding: "11px 14px 11px 40px",
    fontSize: 14,
    color: "#e4e4e7",
    fontFamily: "'Inter', sans-serif",
    transition: "border-color 0.15s",
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
    gap: 7,
    background: "rgba(239,68,68,0.08)",
    border: "1px solid rgba(239,68,68,0.25)",
    borderRadius: 8,
    padding: "10px 14px",
    fontSize: 13,
    color: "#f87171",
    marginTop: -4,
  },
  submitBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 4,
    padding: "13px 24px",
    background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
    border: "none",
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 600,
    color: "#fff",
    fontFamily: "'Inter', sans-serif",
    letterSpacing: "0.1px",
    transition: "all 0.15s ease",
    boxShadow: "0 4px 16px rgba(124,58,237,0.35), 0 0 0 1px rgba(255,255,255,0.05)",
    width: "100%",
  },
  spinner: {
    width: 16,
    height: 16,
    border: "2px solid rgba(255,255,255,0.3)",
    borderTopColor: "#fff",
    borderRadius: "50%",
    display: "inline-block",
    animation: "spin 0.7s linear infinite",
  },
  toggleText: {
    marginTop: 24,
    textAlign: "center",
    fontSize: 13,
    color: "#71717a",
  },
  toggleBtn: {
    background: "none",
    border: "none",
    color: "#a78bfa",
    fontWeight: 600,
    fontSize: 13,
    cursor: "pointer",
    fontFamily: "'Inter', sans-serif",
    textDecoration: "underline",
    textDecorationColor: "transparent",
    transition: "color 0.15s",
  },
  sessionNote: {
    marginTop: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    fontSize: 11,
    color: "#52525b",
    fontFamily: "monospace",
  },
};
