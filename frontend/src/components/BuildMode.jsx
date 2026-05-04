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

  if (error) return <div style={{ color:"red", fontSize:"0.8rem", background:"#111827", padding:"1rem", borderRadius:"8px" }}>{error}</div>;

  return (
    <div 
      className="mermaid-container" 
      style={{ background:"#111827", padding:"1rem", borderRadius:"8px", border:"1px solid #374151", overflowX:"auto" }}
      dangerouslySetInnerHTML={{ __html: svgContent }} 
    />
  );
};

const FEATURES = ["chat","media","feed","notifications","search","payments","auth","analytics"];

export default function BuildMode({ onBack }) {
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedSvc, setSelectedSvc] = useState(null);
  const [lldData, setLldData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("hld");
  const [result, setResult] = useState(null);
  const [form, setForm] = useState({
    appType:"social", users:1000000, readWriteRatio:"read-heavy",
    region:"global", availability:"high", realTime:true,
    cloudProvider:"aws", compliance:"none", consistency:"eventual",
    latency:"standard", budget:"medium", drStrategy:"single-region",
    observability:"basic", resiliency:"standard", apiProtocol:"rest",
    dataArchitecture:"crud", features:["chat","feed"]
  });

  const set = (k,v) => setForm(p => ({...p,[k]:v}));
  const toggleFeat = f => set("features", form.features.includes(f) ? form.features.filter(x=>x!==f) : [...form.features,f]);

  const handleNodeSelect = (nodeId, nodeData) => {
    setSelectedNode(nodeData);
    if(result){
      const svc = result.raw.serviceExpansion.services.find(s=>s.service===nodeId);
      setSelectedSvc(svc || null);
      setLldData(svc ? svc.layers : null);
    }
  };

  const handleGenerate = async () => {
    setLoading(true); setResult(null); setSelectedNode(null); setLldData(null);
    try {
      const res = await fetch("http://localhost:5000/api/generate",{
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({...form, users:Number(form.users)})
      });
      const data = await res.json();
      if(data.status==="success") setResult(data);
    } catch(e){ console.error(e); }
    setLoading(false);
  };

  const handleDownloadPdf = () => {
    window.print();
  };

  const SL = ({children,cls}) => <div className={`section-label ${cls||""}`} style={{marginTop:"1rem"}}>{children}</div>;

  return (
    <div className="app">
      <div className="sidebar">
        <div className="sidebar-head">
          <button className="back-btn" onClick={onBack}>←</button>
          <span className="sidebar-logo">FIXY</span>
          <span className="sidebar-mode-badge build-badge">Build</span>
        </div>
        <div className="sidebar-body">
          <SL>Core Requirements</SL>
          <div className="form-group">
            <label className="form-label">Application Domain</label>
            <select className="input-g" value={form.appType} onChange={e=>set("appType",e.target.value)}>
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
            <label className="form-label">Expected Daily Active Users</label>
            <input type="number" className="input-g" value={form.users} onChange={e=>set("users",e.target.value)}/>
          </div>
          <div className="form-group">
            <label className="form-label">Traffic Pattern</label>
            <select className="input-g" value={form.readWriteRatio} onChange={e=>set("readWriteRatio",e.target.value)}>
              <option value="read-heavy">Read-Heavy (90/10)</option>
              <option value="write-heavy">Write-Heavy (10/90)</option>
              <option value="balanced">Balanced (50/50)</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Geographic Distribution</label>
            <select className="input-g" value={form.region} onChange={e=>set("region",e.target.value)}>
              <option value="single">Single Region</option>
              <option value="multi">Multi-Region (US+EU)</option>
              <option value="global">Global (Edge Optimized)</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Features Required</label>
            <div className="feat-grid">
              {FEATURES.map(f=>(
                <div key={f} className={`feat-chip ${form.features.includes(f)?"active":""}`} onClick={()=>toggleFeat(f)}>
                  <div className="feat-dot"/><span style={{textTransform:"capitalize"}}>{f}</span>
                </div>
              ))}
            </div>
          </div>
          <label className="checkbox-row" style={{marginTop:"0.5rem"}}>
            <input type="checkbox" checked={form.realTime} onChange={e=>set("realTime",e.target.checked)}/>
            <span>Real-Time / WebSocket Required</span>
          </label>

          <SL cls="accent">Advanced Config</SL>
          <div className="form-group">
            <label className="form-label">Cloud Provider</label>
            <select className="input-g" value={form.cloudProvider} onChange={e=>set("cloudProvider",e.target.value)}>
              <option value="aws">Amazon Web Services (AWS)</option>
              <option value="gcp">Google Cloud (GCP)</option>
              <option value="azure">Microsoft Azure</option>
              <option value="on-prem">On-Premises</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Compliance & Security</label>
            <select className="input-g" value={form.compliance} onChange={e=>set("compliance",e.target.value)}>
              <option value="none">Standard Security</option>
              <option value="gdpr">GDPR (EU Data)</option>
              <option value="hipaa">HIPAA (Healthcare)</option>
              <option value="pci">PCI-DSS (Payments)</option>
              <option value="soc2">SOC-2 Type II</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Data Consistency</label>
            <select className="input-g" value={form.consistency} onChange={e=>set("consistency",e.target.value)}>
              <option value="eventual">Eventual Consistency</option>
              <option value="strong">Strong Consistency (ACID)</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Latency Target</label>
            <select className="input-g" value={form.latency} onChange={e=>set("latency",e.target.value)}>
              <option value="standard">Standard (&lt;500ms)</option>
              <option value="interactive">Interactive (&lt;100ms)</option>
              <option value="low">Ultra-Low (&lt;10ms)</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Budget Strategy</label>
            <select className="input-g" value={form.budget} onChange={e=>set("budget",e.target.value)}>
              <option value="low">Startup (Cost-Optimized)</option>
              <option value="medium">Growth (Balanced)</option>
              <option value="high">Enterprise (Max Reliability)</option>
            </select>
          </div>

          <SL cls="red">Staff Engineer Level</SL>
          <div className="form-group">
            <label className="form-label">Disaster Recovery</label>
            <select className="input-g" value={form.drStrategy} onChange={e=>set("drStrategy",e.target.value)}>
              <option value="single-region">Single Region (Multi-AZ)</option>
              <option value="active-passive">Active-Passive (Failover)</option>
              <option value="active-active">Multi-Region Active-Active</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Observability</label>
            <select className="input-g" value={form.observability} onChange={e=>set("observability",e.target.value)}>
              <option value="basic">Basic (Logs + Metrics)</option>
              <option value="distributed">Distributed Tracing (OpenTelemetry)</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Resiliency Pattern</label>
            <select className="input-g" value={form.resiliency} onChange={e=>set("resiliency",e.target.value)}>
              <option value="standard">Standard (Retries)</option>
              <option value="circuit-breaker">Service Mesh + Circuit Breaking</option>
              <option value="chaos">Chaos Engineering</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">API Protocol</label>
            <select className="input-g" value={form.apiProtocol} onChange={e=>set("apiProtocol",e.target.value)}>
              <option value="rest">RESTful APIs</option>
              <option value="graphql">GraphQL (Apollo Federation)</option>
              <option value="grpc">gRPC (High Performance)</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Data Architecture Pattern</label>
            <select className="input-g" value={form.dataArchitecture} onChange={e=>set("dataArchitecture",e.target.value)}>
              <option value="crud">Standard CRUD</option>
              <option value="cqrs">CQRS (Read/Write Split)</option>
              <option value="event-sourcing">Event Sourcing (Kafka)</option>
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
            {["hld","lld","insights","iac"].map(t=>(
              <button key={t} className={`toolbar-tab ${activeTab===t?"active":""}`} onClick={()=>setActiveTab(t)}>
                {t==="hld"?"HLD Diagram":t==="lld"?"LLD Details":t==="insights"?"Scaling & Tradeoffs":"Infrastructure (IaC)"}
              </button>
            ))}
            <div style={{flex: 1}}></div>
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
          {activeTab==="hld" && (
            <>
              {result ? (
                <ArchitectureDiagram
                  architectureData={result.raw.architecture}
                  onNodeSelect={handleNodeSelect}
                />
              ) : (
                <div className="empty-state" style={{background:"var(--bg)"}}>
                  <div className="empty-title" style={{color:"var(--text)"}}>No Architecture Generated</div>
                  <div className="empty-desc" style={{color:"var(--muted)"}}>Configure your system requirements in the left panel and click Generate Architecture to proceed.</div>
                </div>
              )}
              {selectedNode && (
                <div className="lld-panel">
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                    <h3>{selectedNode.label}</h3>
                    <button className="lld-close" onClick={()=>setSelectedNode(null)}>×</button>
                  </div>
                  <span className="layer-tag">{selectedNode.layer}</span>
                  
                  {selectedSvc?.designPatterns && selectedSvc.designPatterns.length > 0 && (
                    <div style={{marginTop:"1.5rem"}}>
                      <div style={{fontSize:"0.72rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",color:"#10b981",marginBottom:"0.6rem"}}>Recommended Patterns</div>
                      <div style={{display:"flex",flexWrap:"wrap",gap:"0.5rem"}}>
                        {selectedSvc.designPatterns.map((p,i) => (
                          <span key={i} style={{background:"rgba(16,185,129,0.1)",color:"#34d399",border:"1px solid rgba(16,185,129,0.3)",padding:"4px 8px",borderRadius:"6px",fontSize:"0.75rem",fontWeight:600}}>{p}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {lldData ? Object.entries(lldData).map(([ln,items])=>(
                    <div key={ln} style={{marginTop:"1rem"}}>
                      <div style={{fontSize:"0.72rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",color:"#6b7280",marginBottom:"0.4rem"}}>{ln}</div>
                      <ul>{items.map((item,i)=><li key={i}>{item}</li>)}</ul>
                    </div>
                  )) : <p style={{marginTop:"1rem",fontSize:"0.88rem",color:"#9ca3af"}}>Infrastructure component. Click a service node for LLD.</p>}
                  
                  {selectedSvc?.classDiagram && (
                    <div style={{marginTop:"1.5rem"}}>
                      <div style={{fontSize:"0.72rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",color:"#8b5cf6",marginBottom:"0.6rem"}}>Class Diagram</div>
                      <MermaidChart chart={selectedSvc.classDiagram} />
                    </div>
                  )}
                  {selectedSvc?.codeScaffold && (
                    <div style={{marginTop:"1.5rem"}}>
                      <div style={{fontSize:"0.72rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",color:"#3b82f6",marginBottom:"0.6rem"}}>Code Scaffold</div>
                      <pre style={{
                        background:"#111827", color:"#e5e7eb", padding:"1rem",
                        borderRadius:"8px", fontSize:"0.75rem", fontFamily:"'JetBrains Mono', monospace",
                        overflowX:"auto", border:"1px solid #374151"
                      }}>
                        <code>{selectedSvc.codeScaffold}</code>
                      </pre>
                      <button style={{
                        marginTop:"0.75rem", width:"100%", padding:"0.6rem", background:"rgba(59,130,246,0.1)",
                        color:"#60a5fa", border:"1px solid rgba(59,130,246,0.3)", borderRadius:"6px", cursor:"pointer",
                        fontWeight:600, fontSize:"0.8rem", transition:"all 0.2s"
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

          {activeTab==="lld" && result && (
            <div style={{height:"100%",overflowY:"auto",padding:"2rem",background:"#fff"}}>
              <h2 style={{marginBottom:"1.5rem",fontSize:"1.2rem",fontWeight:700}}>Low-Level Design — All Services</h2>
              {result.raw.serviceExpansion.services.map(svc=>(
                <div key={svc.service} style={{marginBottom:"2rem",border:"1px solid #e5e7eb",borderRadius:12,overflow:"hidden"}}>
                  <div style={{background:"#f9fafb",padding:"0.9rem 1.25rem",borderBottom:"1px solid #e5e7eb",fontWeight:700,fontSize:"0.95rem"}}>
                    {svc.service.replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase())}
                  </div>
                  {svc.classDiagram && (
                    <div style={{padding:"1.25rem", borderBottom:"1px solid #e5e7eb"}}>
                      <div style={{fontSize:"0.8rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",color:"#6b7280",marginBottom:"0.75rem"}}>UML Class Diagram</div>
                      <MermaidChart chart={svc.classDiagram} />
                    </div>
                  )}
                  {svc.designPatterns && svc.designPatterns.length > 0 && (
                    <div style={{padding:"1.25rem", borderBottom:"1px solid #e5e7eb"}}>
                       <div style={{fontSize:"0.8rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",color:"#6b7280",marginBottom:"0.75rem"}}>Recommended Design Patterns</div>
                       <div style={{display:"flex",flexWrap:"wrap",gap:"0.5rem"}}>
                        {svc.designPatterns.map((p,i) => (
                          <span key={i} style={{background:"#f3f4f6",color:"#374151",border:"1px solid #e5e7eb",padding:"6px 10px",borderRadius:"6px",fontSize:"0.8rem",fontWeight:600}}>{p}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div style={{padding:"1.25rem",display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1.25rem"}}>
                    {svc.layers && Object.entries(svc.layers).map(([ln,items])=>(
                      <div key={ln}>
                        <div style={{fontSize:"0.72rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",color:"#6b7280",marginBottom:"0.5rem"}}>{ln}</div>
                        <ul style={{paddingLeft:"1.2rem",display:"flex",flexDirection:"column",gap:4}}>
                          {items.map((item,i)=><li key={i} style={{fontSize:"0.85rem",color:"#374151"}}>{item}</li>)}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab==="insights" && result && (
            <div style={{height:"100%",overflowY:"auto",padding:"2rem",background:"var(--bg)"}}>
              <h2 style={{marginBottom:"1.5rem",fontSize:"1.2rem",fontWeight:700}}>Scaling & Tradeoffs</h2>
              
              <CapacityCalculator form={form} />

              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"1.25rem",marginBottom:"2rem",marginTop:"2rem"}}>
                {[{title:"Scaling",data:result.raw.insights.scaling},{title:"Reliability",data:result.raw.insights.reliability}].map(({title,data})=>(
                  <div key={title} style={{border:"1px solid #e5e7eb",borderRadius:12,padding:"1.25rem"}}>
                    <div style={{fontWeight:700,marginBottom:"0.75rem"}}>{title}</div>
                    <ul style={{paddingLeft:"1.2rem",display:"flex",flexDirection:"column",gap:6}}>
                      {data.map((s,i)=><li key={i} style={{fontSize:"0.88rem",color:"#374151"}}>{s.replace(/_/g," ")}</li>)}
                    </ul>
                  </div>
                ))}
                <div style={{border:"1px solid var(--border)",borderRadius:"var(--radius)",padding:"1.25rem", background:"var(--bg-card)"}}>
                  <div style={{fontWeight:700,marginBottom:"0.75rem"}}>Request Pipeline</div>
                  <div style={{fontSize:"0.78rem",color:"var(--muted)",lineHeight:1.8,fontFamily:"'JetBrains Mono', monospace"}}>
                    {result.raw.pipelines.requestPipeline.join(" →\n")}
                  </div>
                </div>
              </div>
              {result.raw.dataModels?.mermaidERDiagram && (
                <div style={{marginBottom:"2rem"}}>
                  <h3 style={{marginBottom:"1rem",fontWeight:700}}>Database Schema</h3>
                  <MermaidChart chart={result.raw.dataModels.mermaidERDiagram} />
                </div>
              )}
              <h3 style={{marginBottom:"1rem",fontWeight:700}}>Architectural Tradeoffs</h3>
              {result.raw.insights.tradeoffs.map((t,i)=>(
                <div key={i} style={{border:"1px solid var(--border)",borderRadius:"var(--radius)",padding:"1rem 1.25rem",display:"flex",gap:"2rem",marginBottom:"0.75rem", background:"var(--bg-card)"}}>
                  <div style={{minWidth:160,fontWeight:700,color:"var(--text)"}}>{t.decision}</div>
                  <div style={{color:"var(--green)",fontSize:"0.88rem"}}>Advantage: {t.advantage}</div>
                  <div style={{color:"var(--red)",fontSize:"0.88rem"}}>Risk: {t.disadvantage}</div>
                </div>
              ))}
            </div>
          )}

          {activeTab==="iac" && result && (
            <div style={{height:"100%",overflowY:"auto",padding:"2rem",background:"#111827",color:"#f9fafb"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"1.5rem"}}>
                <div>
                  <h2 style={{fontSize:"1.2rem",fontWeight:700,color:"#e5e7eb",marginBottom:"0.5rem"}}>Infrastructure as Code</h2>
                  <div style={{fontSize:"0.85rem",color:"#9ca3af"}}>Auto-generated Docker Compose based on your architecture decisions.</div>
                </div>
                <button className="btn-primary" onClick={()=>{
                  const blob = new Blob([result.raw.iac.dockerCompose], { type: "text/yaml" });
                  const link = document.createElement("a");
                  link.href = URL.createObjectURL(blob);
                  link.download = "docker-compose.yml";
                  link.click();
                }}>↓ Download Compose File</button>
              </div>
              <pre style={{
                background:"#0d1117", color:"#c9d1d9", padding:"1.5rem",
                borderRadius:"10px", fontSize:"0.8rem", fontFamily:"'JetBrains Mono', monospace",
                border:"1px solid #30363d", overflowX:"auto"
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
