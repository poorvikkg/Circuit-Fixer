import React, { useState, useEffect } from "react";
import BuildMode   from "./components/BuildMode";
import ImproveMode from "./components/ImproveMode";
import AuthPage    from "./components/AuthPage";
import "./index.css";

const API = "http://localhost:5000/api/auth";

export default function App() {
  const [mode, setMode] = useState(null);         // null | "build" | "improve"
  const [user, setUser] = useState(undefined);    // undefined = checking, null = not logged in

  // On mount: check existing session
  useEffect(() => {
    fetch(`${API}/me`, { credentials: "include" })
      .then(res => res.json())
      .then(data => setUser(data.status === "success" ? data.user : null))
      .catch(() => setUser(null));
  }, []);

  async function handleLogout() {
    await fetch(`${API}/logout`, { method: "POST", credentials: "include" });
    setUser(null);
    setMode(null);
  }

  // Loading state
  if (user === undefined) {
    return (
      <div style={{ minHeight: "100vh", background: "#070710", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 28, height: 28, border: "2px solid #3f3f46", borderTopColor: "#a78bfa", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Not logged in → show auth page
  if (!user) {
    return <AuthPage onAuthenticated={setUser} />;
  }

  // Logged in → show app
  if (mode === "build")   return <BuildMode   onBack={() => setMode(null)} />;
  if (mode === "improve") return <ImproveMode onBack={() => setMode(null)} />;

  // Landing
  return (
    <div className="landing" style={{ height: "100vh", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <header className="landing-header" style={{ position: "relative", justifyContent: "space-between" }}>
        <div className="landing-logo">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
          Fixy
        </div>
        
        <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", fontSize: "0.75rem", color: "#a1a1aa", fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ width: 8, height: 8, background: "#8b5cf6", borderRadius: "50%", boxShadow: "0 0 8px #8b5cf6" }}></span>
          Made by Poorvik
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={handleLogout}
            style={{
              background: "transparent",
              border: "1px solid #3f3f46",
              borderRadius: 7,
              color: "#a1a1aa",
              fontSize: 12,
              padding: "5px 12px",
              cursor: "pointer",
              fontFamily: "'Inter', sans-serif",
              transition: "all 0.15s",
            }}
          >
            Sign out
          </button>
        </div>
      </header>

      <div className="hero-section" style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "0 2rem", width: "100%", margin: "0 auto" }}>
        <h1 className="hero-title">What are we building today?</h1>
      </div>

      <div className="feature-grid" style={{ paddingBottom: "3rem", paddingTop: "0" }}>
        <div className="feature-card" onClick={() => setMode("build")} style={{ justifyContent: "center", alignItems: "center", textAlign: "center", gap: "1rem", padding: "3rem" }}>
          <div className="feature-card-header" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem", margin: 0 }}>
            <div className="feature-card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <line x1="3" y1="9" x2="21" y2="9" />
                <line x1="9" y1="21" x2="9" y2="9" />
              </svg>
            </div>
            <h2 style={{ fontSize: "1.5rem" }}>Start fresh</h2>
          </div>
          <div className="feature-card-footer" style={{ marginTop: 0, justifyContent: "center", opacity: 0.6 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </div>
        </div>

        <div className="feature-card" onClick={() => setMode("improve")} style={{ justifyContent: "center", alignItems: "center", textAlign: "center", gap: "1rem", padding: "3rem" }}>
          <div className="feature-card-header" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem", margin: 0 }}>
            <div className="feature-card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </div>
            <h2 style={{ fontSize: "1.5rem" }}>Check my setup</h2>
          </div>
          <div className="feature-card-footer" style={{ marginTop: 0, justifyContent: "center", opacity: 0.6 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}