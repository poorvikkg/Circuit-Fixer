import React, { useState, useEffect } from "react";
import ArchitectureDiagram from "./ArchitectureDiagram";
import CapacityCalculator from "./CapacityCalculator";
import mermaid from "mermaid";

mermaid.initialize({ startOnLoad: false, theme: 'dark' });

const MermaidChart = ({ chart }) => {
  const [svgContent, setSvgContent] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (chart) {
      mermaid.render(`mermaid-${Math.random().toString(36).substr(2, 9)}`, chart)
        .then(({ svg }) => {
          setSvgContent(svg);
          setError("");
        }).catch(e => {
          setError(e.message);
        });
    }
  }, [chart]);

  if (error) return <div style={{ color: "red", fontSize: "0.8rem", background: "#111827", padding: "1rem", borderRadius: "8px" }}>{error}</div>;

  return (
    <div
      className="mermaid-container"
      style={{ background: "#111827", padding: "1rem", borderRadius: "8px", border: "1px solid #374151", overflowX: "auto" }}
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
};

const FEATURES = ["chat", "media", "feed", "notifications", "search", "payments", "auth", "analytics"];

export default function BuildMode({ onBack }) {
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedSvc, setSelectedSvc] = useState(null);
  const [lldData, setLldData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("hld");
  const [result, setResult] = useState(null);
  const [form, setForm] = useState({
    appType: "social", users: 1000000, readWriteRatio: "read-heavy",
    region: "global", availability: "high", realTime: true,
    cloudProvider: "aws", compliance: "none", consistency: "eventual",
    latency: "standard", budget: "medium", drStrategy: "single-region",
    observability: "basic", resiliency: "standard", apiProtocol: "rest",
    dataArchitecture: "crud", features: ["chat", "feed"]
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const toggleFeat = f => set("features", form.features.includes(f) ? form.features.filter(x => x !== f) : [...form.features, f]);

  const handleNodeSelect = (nodeId, nodeData) => {
    setSelectedNode(nodeData);
    if (result) {
      const svc = result.raw.serviceExpansion.services.find(s => s.service === nodeId);
      setSelectedSvc(svc || null);
      setLldData(svc ? svc.layers : null);
    }
  };

  const handleGenerate = async () => {
    setLoading(true); setResult(null); setSelectedNode(null); setLldData(null);
    try {
      const res = await fetch("http://localhost:5000/api/generate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, users: Number(form.users) })
      });
      const data = await res.json();
      if (data.status === "success") setResult(data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleDownloadPdf = () => {
    window.print();
  };

  const SL = ({ children, cls }) => <div className={`section-label ${cls || ""}`} style={{ marginTop: "1rem" }}>{children}</div>;

  return (
    <div className="app">
      <div className="sidebar">
        <div className="sidebar-head">
          <button className="back-btn" onClick={onBack}>←</button>
          <span className="sidebar-logo" style={{ letterSpacing: "2px", textTransform: "uppercase" }}>CIRCUIT FIXER</span>
          <span className="sidebar-mode-badge build-badge">Build</span>
        </div>
        <div className="sidebar-body">
          <SL cls="blue">Core Requirements</SL>
          <div className="form-group">
            <label className="form-label">Business Domain</label>
            <select className="input-g" value={form.appType} onChange={e => set("appType", e.target.value)}>
              <option value="social">Social Media</option>
              <option value="ecommerce">E-Commerce</option>
              <option value="streaming">Video Streaming</option>
              <option value="gaming">Gaming Platform</option>
              <option value="saas">B2B SaaS</option>
              <option value="fintech">Fintech / Payments</option>
              <option value="healthtech">HealthTech</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Scale Target</label>
            <input type="number" className="input-g" value={form.users} onChange={e => set("users", e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Read/Write Ratio</label>
            <select className="input-g" value={form.readWriteRatio} onChange={e => set("readWriteRatio", e.target.value)}>
              <option value="read-heavy">Read-Heavy (90/10)</option>
              <option value="write-heavy">Write-Heavy (10/90)</option>
              <option value="balanced">Balanced (50/50)</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Data Locality & Routing</label>
            <select className="input-g" value={form.region} onChange={e => set("region", e.target.value)}>
              <option value="single">Single Region</option>
              <option value="multi">Multi-Region (US+EU)</option>
              <option value="global">Global (Edge Optimized)</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Core Capabilities</label>
            <div className="feat-grid">
              {FEATURES.map(f => (
                <div key={f} className={`feat-chip ${form.features.includes(f) ? "active" : ""}`} onClick={() => toggleFeat(f)}>
                  <div className="feat-dot" /><span style={{ textTransform: "capitalize" }}>{f}</span>
                </div>
              ))}
            </div>
          </div>
          <label className="checkbox-row" style={{ marginTop: "0.5rem" }}>
            <input type="checkbox" checked={form.realTime} onChange={e => set("realTime", e.target.checked)} />
            <span>Enable Persistent Connections (WebSockets)</span>
          </label>

          <SL cls="accent">Advanced Config</SL>
          <div className="form-group">
            <label className="form-label">Cloud Hosting</label>
            <select className="input-g" value={form.cloudProvider} onChange={e => set("cloudProvider", e.target.value)}>
              <option value="aws">Amazon Web Services (AWS)</option>
              <option value="gcp">Google Cloud (GCP)</option>
              <option value="azure">Microsoft Azure</option>
              <option value="on-prem">On-Premises</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Security & Privacy</label>
            <select className="input-g" value={form.compliance} onChange={e => set("compliance", e.target.value)}>
              <option value="none">Standard Security</option>
              <option value="gdpr">GDPR (EU Data)</option>
              <option value="hipaa">HIPAA (Healthcare)</option>
              <option value="pci">PCI-DSS (Payments)</option>
              <option value="soc2">SOC-2 Type II</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Consistency Model</label>
            <select className="input-g" value={form.consistency} onChange={e => set("consistency", e.target.value)}>
              <option value="eventual">Standard (Eventual)</option>
              <option value="strong">Instant Sync (Strong)</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Latency Target</label>
            <select className="input-g" value={form.latency} onChange={e => set("latency", e.target.value)}>
              <option value="standard">Standard (Under 500ms)</option>
              <option value="interactive">Fast (Under 100ms)</option>
              <option value="low">Real-time (Under 10ms)</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Performance & Budget</label>
            <select className="input-g" value={form.budget} onChange={e => set("budget", e.target.value)}>
              <option value="low">Budget (Cost-Optimized)</option>
              <option value="medium">Growth (Balanced)</option>
              <option value="high">Enterprise (Maximum Performance)</option>
            </select>
          </div>


          <div className="form-group">
            <label className="form-label">Availability & DR</label>
            <select className="input-g" value={form.drStrategy} onChange={e => set("drStrategy", e.target.value)}>
              <option value="single-region">Standard Backup</option>
              <option value="active-passive">Fail-safe Backup</option>
              <option value="active-active">Global Safety (Multi-Region)</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Observability</label>
            <select className="input-g" value={form.observability} onChange={e => set("observability", e.target.value)}>
              <option value="basic">Basic (Logs + Metrics)</option>
              <option value="distributed">Detailed Tracking (OpenTelemetry)</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Error Handling</label>
            <select className="input-g" value={form.resiliency} onChange={e => set("resiliency", e.target.value)}>
              <option value="standard">Standard (Retries)</option>
              <option value="circuit-breaker">Smart Error Blocking</option>
              <option value="chaos">Stress Tested (Chaos)</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Connection Method</label>
            <select className="input-g" value={form.apiProtocol} onChange={e => set("apiProtocol", e.target.value)}>
              <option value="rest">Standard (REST)</option>
              <option value="graphql">Flexible (GraphQL)</option>
              <option value="grpc">Ultra-Fast (gRPC)</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Database Strategy</label>
            <select className="input-g" value={form.dataArchitecture} onChange={e => set("dataArchitecture", e.target.value)}>
              <option value="crud">Standard</option>
              <option value="cqrs">Speed-Optimized (Read/Write Split)</option>
              <option value="event-sourcing">Event Timeline (Kafka)</option>
            </select>
          </div>
        </div>
        <div className="sidebar-footer">
          <button className="btn-primary" onClick={handleGenerate} disabled={loading}>
            {loading ? "Generating Architecture..." : "Generate Architecture"}
          </button>
        </div>
      </div>

      <div className="main">
        {result && (
          <div className="main-toolbar">
            <div className="toolbar-title">{form.appType} · {Number(form.users).toLocaleString()} DAU</div>
            {["hld", "lld", "insights", "iac"].map(t => (
              <button key={t} className={`toolbar-tab ${activeTab === t ? "active" : ""}`} onClick={() => setActiveTab(t)}>
                {t === "hld" ? "System Diagram" : t === "lld" ? "Component Details" : t === "insights" ? "Scaling & Tradeoffs" : "Setup Scripts"}
              </button>
            ))}
            <div style={{ flex: 1 }}></div>
            <button id="export-pdf-btn" onClick={handleDownloadPdf} style={{
              background: "transparent", border: "1px solid var(--border)", color: "var(--text)",
              padding: "0.4rem 0.8rem", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 600,
              cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem"
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              Export PDF
            </button>
          </div>
        )}

        <div id="pdf-export-area" className="canvas-area">
          {activeTab === "hld" && (
            <>
              {result ? (
                <ArchitectureDiagram
                  architectureData={result.raw.architecture}
                  onNodeSelect={handleNodeSelect}
                />
              ) : (
                <div className="empty-state" style={{ background: "var(--bg)" }}>
                  <div className="empty-title" style={{ color: "var(--text)" }}>No Architecture Generated</div>
                </div>
              )}
              {selectedNode && (
                <div className="lld-panel">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <h3>{selectedNode.label}</h3>
                    <button className="lld-close" onClick={() => setSelectedNode(null)}>×</button>
                  </div>
                  <span className="layer-tag">{selectedNode.layer}</span>

                  {selectedSvc?.designPatterns && selectedSvc.designPatterns.length > 0 && (
                    <div style={{ marginTop: "1.5rem" }}>
                      <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "#10b981", marginBottom: "0.6rem" }}>Recommended Patterns</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                        {selectedSvc.designPatterns.map((p, i) => (
                          <span key={i} style={{ background: "rgba(16,185,129,0.1)", color: "#34d399", border: "1px solid rgba(16,185,129,0.3)", padding: "4px 8px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 600 }}>{p}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {lldData ? Object.entries(lldData).map(([ln, items]) => (
                    <div key={ln} style={{ marginTop: "1rem" }}>
                      <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "#6b7280", marginBottom: "0.4rem" }}>{ln}</div>
                      <ul>{items.map((item, i) => <li key={i}>{item}</li>)}</ul>
                    </div>
                  )) : <p style={{ marginTop: "1rem", fontSize: "0.88rem", color: "#9ca3af" }}>Infrastructure component. Click a service node for LLD.</p>}

                  {selectedSvc?.classDiagram && (
                    <div style={{ marginTop: "1.5rem" }}>
                      <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "#8b5cf6", marginBottom: "0.6rem" }}>Class Diagram</div>
                      <MermaidChart chart={selectedSvc.classDiagram} />
                    </div>
                  )}
                  {selectedSvc?.codeScaffold && (
                    <div style={{ marginTop: "1.5rem" }}>
                      <div style={{ fontSize: "0.7rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1.5px", color: "#fff", marginBottom: "0.75rem" }}>Code Scaffold</div>
                      <pre style={{
                        background: "#050505", color: "#fff", padding: "1.25rem",
                        borderRadius: "4px", fontSize: "0.75rem", fontFamily: "'JetBrains Mono', monospace",
                        overflowX: "auto", border: "1px solid rgba(255,255,255,0.1)"
                      }}>
                        <code>{selectedSvc.codeScaffold}</code>
                      </pre>
                      <button style={{
                        marginTop: "1rem", width: "100%", padding: "0.75rem", background: "transparent",
                        color: "#fff", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "4px", cursor: "pointer",
                        fontWeight: 700, fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "1px"
                      }} onClick={() => {
                        const blob = new Blob([selectedSvc.codeScaffold], { type: "text/javascript" });
                        const link = document.createElement("a");
                        link.href = URL.createObjectURL(blob);
                        link.download = `${selectedSvc.service}.js`;
                        link.click();
                      }}>
                        Download Scaffold
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {activeTab === "lld" && result && (
            <div style={{ height: "100%", overflowY: "auto", padding: "2rem", background: "#000" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", color: "#fff" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid rgba(255,255,255,0.2)", textAlign: "left", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px" }}>
                    <th style={{ padding: "1rem", width: "220px" }}>Service Component</th>
                    <th style={{ padding: "1rem" }}>Architecture Specifications</th>
                  </tr>
                </thead>
                <tbody>
                  {result.raw.serviceExpansion.services.map(svc => (
                    <tr key={svc.service} style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", verticalAlign: "top" }}>
                      <td style={{ padding: "1.5rem 1rem", borderRight: "1px solid rgba(255,255,255,0.1)" }}>
                        <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "#fff", textTransform: "uppercase", letterSpacing: "1px" }}>
                          {svc.service.replace(/_/g, " ")}
                        </div>
                      </td>
                      <td style={{ padding: "1.5rem 1rem" }}>
                        {svc.classDiagram && (
                          <div style={{ marginBottom: "1.5rem", border: "1px solid rgba(255,255,255,0.05)", padding: "1rem", borderRadius: 4 }}>
                            <div style={{ fontSize: "0.65rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px", color: "#71717a", marginBottom: "1rem" }}>Internal Class Architecture</div>
                            <MermaidChart chart={svc.classDiagram} />
                          </div>
                        )}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                          {svc.layers && Object.entries(svc.layers).map(([ln, items]) => (
                            <div key={ln}>
                              <div style={{ fontSize: "0.65rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1.5px", color: "#71717a", marginBottom: "0.75rem" }}>{ln}</div>
                              <ul style={{ paddingLeft: "1.2rem", display: "flex", flexDirection: "column", gap: 6, margin: 0 }}>
                                {items.map((item, i) => <li key={i} style={{ fontSize: "0.85rem", color: "#a1a1aa", lineHeight: 1.5 }}>{item}</li>)}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "insights" && result && (
            <div style={{ height: "100%", overflowY: "auto", padding: "2rem", background: "#000" }}>
              <CapacityCalculator form={form} />

            </div>
          )}

          {activeTab === "iac" && result && (
            <div style={{ height: "100%", overflowY: "auto", padding: "2rem", background: "#000", color: "#fff" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem", borderBottom: "2px solid rgba(255,255,255,0.2)", paddingBottom: "1.5rem" }}>
                <div>
                  <h2 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#fff", marginBottom: "0.4rem", textTransform: "uppercase", letterSpacing: "1px" }}>Setup Scripts</h2>
                  <div style={{ fontSize: "0.85rem", color: "#a1a1aa" }}>Automated infrastructure provisioning for your specific architecture.</div>
                </div>
                <button style={{
                  padding: "0.75rem 1.5rem", background: "#fff", color: "#000", border: "none", borderRadius: 4, fontWeight: 800, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px", cursor: "pointer"
                }} onClick={() => {
                  const blob = new Blob([result.raw.iac.dockerCompose], { type: "text/yaml" });
                  const link = document.createElement("a");
                  link.href = URL.createObjectURL(blob);
                  link.download = "docker-compose.yml";
                  link.click();
                }}>Download YAML</button>
              </div>
              <pre style={{
                background: "#050505", color: "#fff", padding: "1.5rem",
                borderRadius: "4px", fontSize: "0.8rem", fontFamily: "'JetBrains Mono', monospace",
                border: "1px solid rgba(255,255,255,0.1)", overflowX: "auto"
              }}>
                <code>{result.raw.iac.dockerCompose}</code>
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
