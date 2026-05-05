import React, { useState, useRef, useEffect } from "react";
import ArchitectureDiagram from "./ArchitectureDiagram";
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
      style={{ 
        background:"#000", padding:"1rem", borderRadius:0, 
        border: "none", overflow:"auto",
        width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center"
      }}
    >
      <div 
        style={{ 
          transform: "scale(2.2)", 
          transformOrigin: "center center",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "transform 0.3s ease"
        }}
        dangerouslySetInnerHTML={{ __html: svgContent }} 
      />
    </div>
  );
};

const SEV_COLOR = { critical:"#ffffff", high:"#a1a1aa", medium:"#71717a", info:"#3f3f46" };

export default function ImproveMode({ onBack }) {
  const [section, setSection] = useState("hld"); // "hld" or "lld"
  const [activeTab, setActiveTab] = useState("issues");
  const [loading, setLoading] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // HLD state
  const [hldFile, setHldFile] = useState(null);
  const [hldResult, setHldResult] = useState(null);
  const [hldErrorMessage, setHldErrorMessage] = useState("");
  const [hldForm, setHldForm] = useState({
    existingHLD: "",
    improvementsWanted: "",
    techStack: "",
    currentScale: "medium"
  });

  // LLD / Code Review state
  const [repoUrl, setRepoUrl] = useState("");
  const [githubToken, setGithubToken] = useState("");
  const [codeResult, setCodeResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const setHld = (k,v) => setHldForm(p => ({...p,[k]:v}));
  const fileRef = useRef(null);

  // ── HLD File Upload ──
  const handleFileUpload = async () => {
    if (!hldFile) return;
    setLoading(true); setHldResult(null); setHldErrorMessage("");
    const fd = new FormData();
    fd.append("hldFile", hldFile);
    fd.append("improvementsWanted", hldForm.improvementsWanted);
    fd.append("currentScale", hldForm.currentScale);
    fd.append("techStack", hldForm.techStack);
    fd.append("existingHLD", hldForm.existingHLD);
    try {
      const res = await fetch("http://localhost:5000/api/hld-analyze", {
        method: "POST",
        credentials: "include",
        body: fd
      });
      const data = await res.json();
      if (data.status === "success") {
        setHldResult(data);
        setActiveTab("issues");
      } else {
        setHldErrorMessage(data.message || "Analysis failed. Please try again.");
      }
    } catch (e) {
      console.error(e);
      setHldErrorMessage("Could not connect to server. Is the backend running?");
    }
    setLoading(false);
  };

  // ── HLD Text-only Analysis ──
  const handleTextAnalyze = async () => {
    if (hldForm.existingHLD.length < 10) return;
    setLoading(true); setHldResult(null); setHldErrorMessage("");
    try {
      const res = await fetch("http://localhost:5000/api/improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(hldForm)
      });
      const data = await res.json();
      if (data.status === "success") {
        setHldResult(data);
        setActiveTab("issues");
      } else {
        setHldErrorMessage(data.message || "Analysis failed. Please try again.");
      }
    } catch (e) {
      console.error(e);
      setHldErrorMessage("Could not connect to server. Is the backend running?");
    }
    setLoading(false);
  };

  // ── Code Review ──
  const handleCodeReview = async () => {
    if (!repoUrl) return;
    setLoading(true); setCodeResult(null); setErrorMessage("");
    try {
      const res = await fetch("http://localhost:5000/api/code-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ 
          repoUrl, 
          githubToken,
          jobId: `job_${Date.now()}` 
        })
      });
      const data = await res.json();
      if (data.status === "success") { 
        setCodeResult(data); setActiveTab("codeIssues"); 
      } else {
        setErrorMessage(data.message || "Failed to analyze repository.");
      }
    } catch(e) { 
      setErrorMessage(e.message || "Network error. Make sure the backend is running.");
      console.error(e); 
    }
    setLoading(false);
  };

  const handleDownloadPdf = () => {
    window.print();
  };

  const issues = hldResult?.analysis?.issues || [];
  const improvements = hldResult?.analysis?.improvements || [];
  const review = codeResult?.review || {};

  return (
    <div className="app" style={{ background: "#000", position: "relative" }}>
      {/* ─── SIDEBAR ─── */}
      <div className="sidebar" style={{ 
        width: isSidebarCollapsed ? "0px" : "360px", 
        minWidth: isSidebarCollapsed ? "0px" : "360px",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        overflow: "hidden",
        position: "relative",
        borderRight: isSidebarCollapsed ? "none" : "1px solid var(--border)"
      }}>
        <div style={{ width: "360px", height: "100%", display: "flex", flexDirection: "column" }}>
          <div className="sidebar-head" style={{ flexDirection: "column", alignItems: "stretch" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", width: "100%" }}>
              <button className="back-btn" onClick={onBack}>←</button>
              <span className="sidebar-logo" style={{ letterSpacing: "2px", textTransform: "uppercase" }}>CIRCUIT FIXER</span>
              <span className="sidebar-mode-badge improve-badge" style={{ marginLeft: "auto" }}>Audit</span>
            </div>
            
            <div style={{display:"flex", gap:"1rem", marginTop:"1.5rem"}}>
              <button onClick={()=>setSection("hld")} style={{
                flex:1, padding:"0.75rem", borderRadius:4, border: section==="hld" ? "1px solid #fff" : "1px solid #27272a",
                background: section==="hld" ? "#fff" : "transparent",
                color: section==="hld" ? "#000" : "#a1a1aa",
                fontWeight:800, fontSize:"0.7rem", textTransform:"uppercase", letterSpacing:"1px", cursor:"pointer",
                transition: "all 0.2s ease"
              }}>System Audit</button>
              <button onClick={()=>setSection("lld")} style={{
                flex:1, padding:"0.75rem", borderRadius:4, border: section==="lld" ? "1px solid #fff" : "1px solid #27272a",
                background: section==="lld" ? "#fff" : "transparent",
                color: section==="lld" ? "#000" : "#a1a1aa",
                fontWeight:800, fontSize:"0.7rem", textTransform:"uppercase", letterSpacing:"1px", cursor:"pointer",
                transition: "all 0.2s ease"
              }}>Code Review</button>
            </div>
          </div>
          <div className="sidebar-body" style={{background: "var(--bg-panel)"}}>

          {/* ═══ HLD Section ═══ */}
          {section === "hld" && (
            <div style={{ 
              height: "100%", display: "flex", alignItems: "center", justifyContent: "center", 
              padding: "2rem", textAlign: "center", background: "#050505"
            }}>
              <div style={{
                border: "1px solid #fff", padding: "3rem 2rem", borderRadius: 0,
                color: "#fff", fontWeight: 800, fontSize: "0.85rem", textTransform: "uppercase",
                letterSpacing: "2px", width: "100%"
              }}>
                HLD Analysis Module<br/>Temporarily Offline
              </div>
            </div>
          )}


          {/* ═══ LLD / Code Review Section ═══ */}
          {section === "lld" && (<>
            <div className="section-label" style={{marginTop:"0.25rem"}}>GitHub Review</div>

            <div className="form-group">
              <label className="form-label">GitHub Repository URL <span style={{color:"#ef4444"}}>*</span></label>
              <input className="input-g" placeholder="https://github.com/owner/repo"
                value={repoUrl} onChange={e=>setRepoUrl(e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">GitHub Access Token <span style={{color:"#9ca3af"}}>(Optional)</span></label>
              <input type="password" className="input-g" placeholder="ghp_xxxxxxxxxxxx"
                value={githubToken} onChange={e=>setGithubToken(e.target.value)} />
            </div>

            {errorMessage && (
              <div style={{padding:"0.75rem",background:"rgba(239,68,68,0.1)",borderRadius:10,border:"1px solid rgba(239,68,68,0.2)",marginTop:"0.5rem", color: "#ef4444", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.5rem"}}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                {errorMessage}
              </div>
            )}

            {codeResult && (
              <div style={{padding:"1rem", background:"#050505", border:"1px solid rgba(255,255,255,0.2)", borderRadius:4, marginTop:"1rem"}}>
                <div style={{fontWeight:800, fontSize:"0.75rem", color:"#fff", textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:"0.5rem", display:"flex", justifyContent:"space-between"}}>
                  <span>Audit Summary</span>
                  <span>Health: {review.summary?.healthScore}/100</span>
                </div>
                <div style={{fontSize:"0.75rem", color:"#a1a1aa", fontFamily:"'JetBrains Mono', monospace"}}>
                  {codeResult.repo?.filesCrawled || 0} files · {review.summary?.criticalCount || 0} critical · {review.summary?.highCount || 0} high
                </div>
              </div>
            )}
          </>)}
        </div>

        {/* Footer Button */}
        <div className="sidebar-footer">
          {section === "hld" ? (
            <>
              {hldErrorMessage && (
                <div style={{
                  padding:"0.65rem 0.85rem", marginBottom:"0.5rem",
                  background:"rgba(239,68,68,0.09)", border:"1px solid rgba(239,68,68,0.25)",
                  borderRadius:8, color:"#f87171", fontSize:"0.8rem",
                  display:"flex", alignItems:"flex-start", gap:"0.5rem", lineHeight:1.5
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{flexShrink:0,marginTop:1}}>
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  {hldErrorMessage}
                </div>
              )}
              <button className="btn-purple" disabled={true}
                onClick={undefined} style={{ opacity: 0.6, cursor: "not-allowed" }}>
                Temporarily Unavailable
              </button>
            </>
          ) : (
            <button className="btn-purple" disabled={loading || !repoUrl}
              onClick={handleCodeReview}>
              {loading ? "Crawling Repo..." : "Run Code Review"}
            </button>
          )}
        </div>
      </div>
    </div>

      {/* ── MAIN PANEL ── */}
      <div className="main">
        {/* Toolbar */}
        <div className="main-toolbar">
          {/* Collapse Toggle Button */}
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            style={{
              background: "#18181b", border: "1px solid var(--border)", color: "#fff",
              width: "32px", height: "32px", borderRadius: "6px", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              marginRight: "0.5rem"
            }}
          >
            {isSidebarCollapsed ? "→" : "←"}
          </button>

          {(hldResult || codeResult) && (
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", width: "100%" }}>
              {section === "hld" && hldResult && (<>
              <div className="toolbar-title">System Audit &amp; New Design</div>
              <button className={`toolbar-tab ${activeTab==="issues"?"active":""}`} onClick={()=>setActiveTab("issues")}>Issues ({issues.length})</button>
              <button className={`toolbar-tab ${activeTab==="improvements"?"active":""}`} onClick={()=>setActiveTab("improvements")}>Plan</button>
              <button className={`toolbar-tab ${activeTab==="diagram"?"active":""}`} onClick={()=>setActiveTab("diagram")}>New Design</button>
            </>)}
            {section === "lld" && codeResult && (<>
              <div style={{width:"2rem"}}></div>
              <button className={`toolbar-tab ${activeTab==="security"?"active":""}`} onClick={()=>setActiveTab("security")}>Security ({review.security?.length||0})</button>
              <button className={`toolbar-tab ${activeTab==="codeIssues"?"active":""}`} onClick={()=>setActiveTab("codeIssues")}>Design Flaws ({review.issues?.length||0})</button>
              <button className={`toolbar-tab ${activeTab==="patterns"?"active":""}`} onClick={()=>setActiveTab("patterns")}>Patterns</button>
              <button className={`toolbar-tab ${activeTab==="scalability"?"active":""}`} onClick={()=>setActiveTab("scalability")}>Scaling</button>
              <button className={`toolbar-tab ${activeTab==="readability"?"active":""}`} onClick={()=>setActiveTab("readability")}>Readability</button>
              <button className={`toolbar-tab ${activeTab==="complexity"?"active":""}`} onClick={()=>setActiveTab("complexity")}>Complexity</button>
              <button className={`toolbar-tab ${activeTab==="archMap"?"active":""}`} onClick={()=>setActiveTab("archMap")}>Dependency Map</button>
            </>)}
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
      </div>

        <div id="pdf-export-area" className="canvas-area">
          {/* Empty states */}
          {!hldResult && section==="hld" && (
            <div className="empty-state">
              <div className="empty-title">Describe Your System</div>
            </div>
          )}
          {!codeResult && section==="lld" && (
            <div className="empty-state">
              <div className="empty-title">Check Your Code</div>
            </div>
          )}

          {/* ═══ HLD TABS ═══ */}
          {hldResult && activeTab==="issues" && (
            <div style={{height:"100%",overflowY:"auto",padding:"2rem",background:"#000"}}>
              <table style={{width:"100%", borderCollapse:"collapse", color:"#fff"}}>
                <thead>
                  <tr style={{borderBottom:"2px solid rgba(255,255,255,0.2)", textAlign:"left", fontSize:"0.75rem", textTransform:"uppercase", letterSpacing:"1px"}}>
                    <th style={{padding:"1rem", width:"120px"}}>Severity</th>
                    <th style={{padding:"1rem", width:"200px"}}>Area</th>
                    <th style={{padding:"1rem"}}>Issue & Resolution</th>
                  </tr>
                </thead>
                <tbody>
                  {issues.map((issue,i)=>(
                    <tr key={i} style={{borderBottom:"1px solid rgba(255,255,255,0.1)", verticalAlign:"top"}}>
                      <td style={{padding:"1.25rem 1rem", fontSize:"0.7rem", fontWeight:800, borderRight:"1px solid rgba(255,255,255,0.1)"}}>{issue.severity}</td>
                      <td style={{padding:"1.25rem 1rem", fontSize:"0.75rem", color:"#a1a1aa", fontFamily:"'JetBrains Mono',monospace", borderRight:"1px solid rgba(255,255,255,0.1)"}}>{issue.area}</td>
                      <td style={{padding:"1.25rem 1rem"}}>
                        <div style={{fontWeight:700, fontSize:"1rem", marginBottom:"0.5rem"}}>{issue.title}</div>
                        <div style={{fontSize:"0.88rem", color:"#a1a1aa", lineHeight:1.5, marginBottom:"1rem"}}>{issue.description}</div>
                        <div style={{padding:"0.75rem", border:"1px solid rgba(255,255,255,0.1)", background:"rgba(255,255,255,0.02)", fontSize:"0.85rem"}}>
                          <span style={{fontWeight:800, marginRight:"0.5rem", borderBottom:"1px solid #fff"}}>FIX:</span>
                          {issue.fix}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {hldResult && activeTab==="improvements" && (
            <div style={{height:"100%",overflowY:"auto",padding:"2rem",background:"#000"}}>
              <h2 style={{marginBottom:"1.5rem",fontSize:"1.2rem",fontWeight:700}}>Improvement Roadmap</h2>
              <table style={{width:"100%", borderCollapse:"collapse", color:"#fff"}}>
                <thead>
                  <tr style={{borderBottom:"2px solid rgba(255,255,255,0.2)", textAlign:"left", fontSize:"0.75rem", textTransform:"uppercase", letterSpacing:"1px"}}>
                    <th style={{padding:"1rem", width:"200px"}}>Phase / Area</th>
                    <th style={{padding:"1rem"}}>Strategic Action Items</th>
                  </tr>
                </thead>
                <tbody>
                  {improvements.map((imp,i)=>(
                    <tr key={i} style={{borderBottom:"1px solid rgba(255,255,255,0.1)", verticalAlign:"top"}}>
                      <td style={{padding:"1.25rem 1rem", fontSize:"0.75rem", fontWeight:800, color:"#fff", borderRight:"1px solid rgba(255,255,255,0.1)"}}>{imp.area}</td>
                      <td style={{padding:"1.25rem 1rem"}}>
                        <div style={{fontWeight:700, fontSize:"1rem", marginBottom:"0.75rem"}}>{imp.title}</div>
                        <ol style={{paddingLeft:"1.2rem", display:"flex", flexDirection:"column", gap:"8px", margin:0}}>
                          {imp.steps.map((step,j)=>(
                            <li key={j} style={{fontSize:"0.88rem", color:"#a1a1aa", lineHeight:1.5}}>{step}</li>
                          ))}
                        </ol>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {hldResult && activeTab==="diagram" && (
            <div style={{height:"100%",position:"relative"}}>
              <div style={{position:"absolute",top:12,left:"50%",transform:"translateX(-50%)",zIndex:10,background:"rgba(22,27,34,0.95)",color:"#8b949e",padding:"6px 16px",borderRadius:20,border:"1px solid #30363d",fontSize:"0.82rem",fontWeight:500}}>Recommended Target Architecture</div>
              <ArchitectureDiagram architectureData={hldResult.improvedGraph} />
            </div>
          )}

          {/* ═══ CODE REVIEW TABS ═══ */}
          {codeResult && activeTab==="security" && (
            <div style={{height:"100%",overflowY:"auto",padding:"2rem",background:"#000"}}>
              <table style={{width:"100%", borderCollapse:"collapse", color:"#fff"}}>
                <thead>
                  <tr style={{borderBottom:"2px solid rgba(255,255,255,0.2)", textAlign:"left", fontSize:"0.75rem", textTransform:"uppercase", letterSpacing:"1px"}}>
                    <th style={{padding:"1rem", width:"120px"}}>Severity</th>
                    <th style={{padding:"1rem", width:"200px"}}>Component</th>
                    <th style={{padding:"1rem"}}>Vulnerability & Patch</th>
                  </tr>
                </thead>
                <tbody>
                  {(review.security||[]).length > 0 ? (review.security||[]).map((sec,i)=>(
                    <tr key={i} style={{borderBottom:"1px solid rgba(255,255,255,0.1)", verticalAlign:"top"}}>
                      <td style={{padding:"1.25rem 1rem", fontSize:"0.7rem", fontWeight:800, borderRight:"1px solid rgba(255,255,255,0.1)"}}>{sec.severity}</td>
                      <td style={{padding:"1.25rem 1rem", fontSize:"0.75rem", color:"#a1a1aa", fontFamily:"'JetBrains Mono',monospace", borderRight:"1px solid rgba(255,255,255,0.1)"}}>{sec.area}</td>
                      <td style={{padding:"1.25rem 1rem"}}>
                        <div style={{fontWeight:700, fontSize:"1rem", marginBottom:"0.5rem"}}>{sec.title}</div>
                        <div style={{fontSize:"0.88rem", color:"#a1a1aa", lineHeight:1.5, marginBottom:"1rem"}}>{sec.description}</div>
                        <div style={{padding:"0.75rem", border:"1px solid rgba(255,255,255,0.1)", background:"rgba(255,255,255,0.02)", fontSize:"0.85rem"}}>
                          <span style={{fontWeight:800, marginRight:"0.5rem", borderBottom:"1px solid #fff"}}>PATCH:</span>
                          {sec.fix}
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={3} style={{padding:"4rem", textAlign:"center", color:"#71717a", fontSize:"0.85rem", textTransform:"uppercase", letterSpacing:"1px"}}>
                        No security vulnerabilities detected in current scope
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {codeResult && activeTab==="codeIssues" && (
            <div style={{height:"100%",overflowY:"auto",padding:"2rem",background:"#000"}}>
              <table style={{width:"100%", borderCollapse:"collapse", color:"#fff"}}>
                <thead>
                  <tr style={{borderBottom:"2px solid rgba(255,255,255,0.2)", textAlign:"left", fontSize:"0.75rem", textTransform:"uppercase", letterSpacing:"1px"}}>
                    <th style={{padding:"1rem", width:"120px"}}>Severity</th>
                    <th style={{padding:"1rem", width:"200px"}}>Location</th>
                    <th style={{padding:"1rem"}}>Problem & Recommendation</th>
                  </tr>
                </thead>
                <tbody>
                  {(review.issues||[]).length > 0 ? (review.issues||[]).map((issue,i)=>(
                    <tr key={i} style={{borderBottom:"1px solid rgba(255,255,255,0.1)", verticalAlign:"top"}}>
                      <td style={{padding:"1.25rem 1rem", fontSize:"0.7rem", fontWeight:800, borderRight:"1px solid rgba(255,255,255,0.1)"}}>{issue.severity}</td>
                      <td style={{padding:"1.25rem 1rem", fontSize:"0.75rem", color:"#a1a1aa", fontFamily:"'JetBrains Mono',monospace", wordBreak:"break-all", borderRight:"1px solid rgba(255,255,255,0.1)"}}>
                        {issue.files && issue.files[0] ? issue.files[0] : "Global"}
                      </td>
                      <td style={{padding:"1.25rem 1rem"}}>
                        <div style={{fontWeight:700, fontSize:"1rem", marginBottom:"0.5rem"}}>{issue.title}</div>
                        <div style={{fontSize:"0.88rem", color:"#a1a1aa", lineHeight:1.5, marginBottom:"1rem"}}>{issue.description}</div>
                        <div style={{padding:"0.75rem", border:"1px solid rgba(255,255,255,0.1)", background:"rgba(255,255,255,0.02)", fontSize:"0.85rem"}}>
                          <span style={{fontWeight:800, marginRight:"0.5rem", borderBottom:"1px solid #fff"}}>FIX:</span>
                          {issue.fix}
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={3} style={{padding:"4rem", textAlign:"center", color:"#71717a", fontSize:"0.85rem", textTransform:"uppercase", letterSpacing:"1px"}}>
                        No design flaws identified in current scope
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {codeResult && activeTab==="patterns" && (
            <div style={{height:"100%",overflowY:"auto",padding:"2rem",background:"#000"}}>
              <h2 style={{marginBottom:"1.5rem",fontSize:"1.2rem",fontWeight:700}}>Recommended Design Patterns</h2>
              <table style={{width:"100%", borderCollapse:"collapse", color:"#fff"}}>
                <thead>
                  <tr style={{borderBottom:"2px solid rgba(255,255,255,0.2)", textAlign:"left", fontSize:"0.75rem", textTransform:"uppercase", letterSpacing:"1px"}}>
                    <th style={{padding:"1rem", width:"200px"}}>Pattern</th>
                    <th style={{padding:"1rem"}}>Architecture Strategy</th>
                  </tr>
                </thead>
                <tbody>
                  {(review.patterns||[]).map((p,i)=>(
                    <tr key={i} style={{borderBottom:"1px solid rgba(255,255,255,0.1)", verticalAlign:"top"}}>
                      <td style={{padding:"1.25rem 1rem", borderRight:"1px solid rgba(255,255,255,0.1)"}}>
                        <div style={{fontSize:"0.7rem", fontWeight:800, color:"#fff", marginBottom:"0.4rem"}}>{p.pattern.category}</div>
                        <div style={{fontWeight:700, fontSize:"0.95rem"}}>{p.pattern.name}</div>
                      </td>
                      <td style={{padding:"1.25rem 1rem"}}>
                        <div style={{fontSize:"0.88rem", color:"#a1a1aa", lineHeight:1.5, marginBottom:"1rem"}}>{p.pattern.description}</div>
                        <div style={{padding:"1rem", border:"1px solid rgba(255,255,255,0.1)", background:"#050505", borderRadius:4}}>
                          <div style={{fontSize:"0.75rem", fontWeight:800, marginBottom:"0.5rem", borderBottom:"1px solid rgba(255,255,255,0.1)", paddingBottom:"0.4rem"}}>Implementation Example</div>
                          <pre style={{margin:0, color:"#fff", fontSize:"0.75rem", fontFamily:"'JetBrains Mono',monospace", overflowX:"auto"}}><code>{p.example}</code></pre>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {codeResult && activeTab==="scalability" && (
            <div style={{height:"100%",overflowY:"auto",padding:"2rem",background:"#000"}}>
              <h2 style={{marginBottom:"1.5rem",fontSize:"1.2rem",fontWeight:700}}>Scalability Recommendations</h2>
              <table style={{width:"100%", borderCollapse:"collapse", color:"#fff"}}>
                <thead>
                  <tr style={{borderBottom:"2px solid rgba(255,255,255,0.2)", textAlign:"left", fontSize:"0.75rem", textTransform:"uppercase", letterSpacing:"1px"}}>
                    <th style={{padding:"1rem", width:"200px"}}>Scale Area</th>
                    <th style={{padding:"1rem"}}>Bottleneck & Resolution</th>
                  </tr>
                </thead>
                <tbody>
                  {(review.scalability||[]).map((s,i)=>(
                    <tr key={i} style={{borderBottom:"1px solid rgba(255,255,255,0.1)", verticalAlign:"top"}}>
                      <td style={{padding:"1.25rem 1rem", fontSize:"0.75rem", fontWeight:800}}>{s.area}</td>
                      <td style={{padding:"1.25rem 1rem"}}>
                        <div style={{fontSize:"0.88rem", color:"#fff", fontWeight:700, marginBottom:"0.5rem", textTransform:"uppercase"}}>Bottleneck: {s.issue}</div>
                        <div style={{padding:"0.75rem", border:"1px solid rgba(255,255,255,0.1)", background:"rgba(255,255,255,0.02)", fontSize:"0.85rem", color:"#fff"}}>
                          <span style={{fontWeight:800, marginRight:"0.5rem", borderBottom:"1px solid #fff"}}>STRATEGY:</span>
                          {s.fix}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {codeResult && activeTab==="readability" && (
            <div style={{height:"100%",overflowY:"auto",padding:"2rem",background:"#000"}}>
              <h2 style={{marginBottom:"1.5rem",fontSize:"1.2rem",fontWeight:700}}>Readability Improvements</h2>
              <table style={{width:"100%", borderCollapse:"collapse", color:"#fff"}}>
                <thead>
                  <tr style={{borderBottom:"2px solid rgba(255,255,255,0.2)", textAlign:"left", fontSize:"0.75rem", textTransform:"uppercase", letterSpacing:"1px"}}>
                    <th style={{padding:"1rem", width:"200px"}}>Refactoring Goal</th>
                    <th style={{padding:"1rem"}}>Code Transformation</th>
                  </tr>
                </thead>
                <tbody>
                  {(review.readability||[]).map((r,i)=>(
                    <tr key={i} style={{borderBottom:"1px solid rgba(255,255,255,0.1)", verticalAlign:"top"}}>
                      <td style={{padding:"1.25rem 1rem", fontSize:"0.85rem", fontWeight:700, borderRight:"1px solid rgba(255,255,255,0.1)"}}>{r.title}</td>
                      <td style={{padding:"1.25rem 1rem"}}>
                        <div style={{fontSize:"0.85rem", color:"#a1a1aa", marginBottom:"1rem"}}>{r.description}</div>
                        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem"}}>
                          <div style={{padding:"0.75rem", border:"1px solid rgba(255,255,255,0.1)", background:"#050505", borderRadius:4}}>
                            <div style={{fontSize:"0.6rem", fontWeight:800, color:"#71717a", marginBottom:"0.5rem"}}>LEGACY</div>
                            <pre style={{margin:0, color:"#ef4444", fontSize:"0.72rem", fontFamily:"'JetBrains Mono',monospace", whiteSpace:"pre-wrap"}}>{r.before}</pre>
                          </div>
                          <div style={{padding:"0.75rem", border:"1px solid rgba(255,255,255,0.1)", background:"#050505", borderRadius:4}}>
                            <div style={{fontSize:"0.6rem", fontWeight:800, color:"#71717a", marginBottom:"0.5rem"}}>OPTIMIZED</div>
                            <pre style={{margin:0, color:"#10b981", fontSize:"0.72rem", fontFamily:"'JetBrains Mono',monospace", whiteSpace:"pre-wrap"}}>{r.after}</pre>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {codeResult && activeTab==="complexity" && (
            <div style={{height:"100%",overflowY:"auto",padding:"2rem",background:"#000"}}>
              <table style={{width:"100%", borderCollapse:"collapse", color:"#fff"}}>
                <thead>
                  <tr style={{borderBottom:"2px solid rgba(255,255,255,0.2)", textAlign:"left", fontSize:"0.75rem", textTransform:"uppercase", letterSpacing:"1px"}}>
                    <th style={{padding:"1rem", width:"220px"}}>File Identity</th>
                    <th style={{padding:"1rem"}}>Complexity Metrics</th>
                  </tr>
                </thead>
                <tbody>
                  {(review.complexity||[]).map((f,i)=>(
                    <tr key={i} style={{borderBottom:"1px solid rgba(255,255,255,0.1)", verticalAlign:"top"}}>
                      <td style={{padding:"1.25rem 1rem", fontSize:"0.75rem", fontFamily:"'JetBrains Mono',monospace", color:"#fff", borderRight:"1px solid rgba(255,255,255,0.1)"}}>{f.path}</td>
                      <td style={{padding:"1.25rem 1rem"}}>
                        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                          <div style={{fontSize:"0.85rem", color:"#a1a1aa"}}>{f.lines} lines · {f.functions} functions · {f.imports} imports</div>
                          <div style={{display:"flex", alignItems:"center", gap:"1rem"}}>
                            <span style={{fontSize:"1.1rem", fontWeight:800, color:"#fff"}}>{f.complexityScore}</span>
                            <span style={{fontSize:"0.6rem", fontWeight:800, color:"#71717a", textTransform:"uppercase", letterSpacing:"1px"}}>Complexity</span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {codeResult && activeTab==="archMap" && (
            <div style={{height:"100%",position:"relative", background:"#000"}}>
              <div style={{position:"absolute",top:16,left:"50%",transform:"translateX(-50%)",zIndex:10,background:"#000",color:"#fff",padding:"8px 24px",borderRadius:4,border:"1px solid rgba(255,255,255,0.2)",fontSize:"0.7rem",fontWeight:800,textTransform:"uppercase",letterSpacing:"1px"}}>
                Module Dependency Map
              </div>
              {review.mermaidGraph ? (
                <div style={{width:"100%", height:"100%", padding:"1rem"}}>
                   <MermaidChart chart={review.mermaidGraph} />
                </div>
              ) : (
                <div style={{display:"flex",height:"100%",alignItems:"center",justifyContent:"center",color:"#6b7280",flexDirection:"column"}}>
                  <div style={{marginBottom:"1rem"}}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                  </div>
                  <div>No internal dependencies found to map.</div>
                  <div style={{fontSize:"0.8rem",marginTop:"0.5rem"}}>This typically happens if files don't import each other or use unrecognized import paths.</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
