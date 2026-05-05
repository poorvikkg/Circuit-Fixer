import React, { useState, useEffect } from "react";
import BuildMode   from "./components/BuildMode";
import ImproveMode from "./components/ImproveMode";
import AuthPage    from "./components/AuthPage";
import "./index.css";

const API_BASE = process.env.REACT_APP_API_URL || (window.location.hostname === "localhost" ? "http://localhost:5000" : "");
const API = `${API_BASE}/api/auth`;

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
      <div style={{ minHeight: "100vh", background: "#09090b", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 28, height: 28, border: "2px solid #27272a", borderTopColor: "#ffffff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
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
    <div className="landing" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <header className="landing-header">
        <div className="landing-logo" style={{ letterSpacing: "2px", textTransform: "uppercase", fontWeight: 800 }}>
          CIRCUIT FIXER
        </div>
        
        <div className="landing-attribution" style={{ fontSize: "0.75rem", color: "#a1a1aa", fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ width: 8, height: 8, background: "#ffffff", borderRadius: "50%", boxShadow: "0 0 8px rgba(255,255,255,0.4)" }}></span>
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

      <div className="hero-section" style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "2rem", width: "100%", margin: "0 auto" }}>
        <h1 className="hero-title">What are we building today?</h1>
      </div>

      <div className="feature-grid" style={{ paddingBottom: "3rem", paddingTop: "0" }}>
        <div className="feature-card" onClick={() => setMode("build")} style={{ justifyContent: "center", alignItems: "center", textAlign: "center", gap: "1rem", padding: "3rem" }}>
          <div className="feature-card-header" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem", margin: 0 }}>
            <h2 style={{ fontSize: "1.5rem" }}>Start fresh</h2>
          </div>
        </div>

        <div className="feature-card" onClick={() => setMode("improve")} style={{ justifyContent: "center", alignItems: "center", textAlign: "center", gap: "1rem", padding: "3rem" }}>
          <div className="feature-card-header" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem", margin: 0 }}>
            <h2 style={{ fontSize: "1.5rem" }}>Check my setup</h2>
          </div>
        </div>
      </div>
    </div>
  );
}