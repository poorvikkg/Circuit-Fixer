import React, { useState, useEffect } from "react";

export default function CapacityCalculator({ form }) {
  const [assumptions, setAssumptions] = useState({
    readsPerUser: 50,
    writesPerUser: 10,
    readSizeBytes: 5000, // 5 KB
    writeSizeBytes: 2000, // 2 KB
    cacheActiveUsersPercent: 20, // 20%
    serversCapacityRPS: 1000 // Each server handles 1000 RPS
  });

  // Update assumptions based on form changes
  useEffect(() => {
    let reads = 50;
    let writes = 10;
    
    if (form.readWriteRatio === "write-heavy") {
      reads = 10;
      writes = 50;
    } else if (form.readWriteRatio === "balanced") {
      reads = 30;
      writes = 30;
    }

    let writeSize = 2000;
    let readSize = 5000;
    if (form.features.includes("media")) {
      writeSize = 500000; // 500 KB per post on average with images
      readSize = 1000000; // 1 MB
    } else if (form.features.includes("chat")) {
      writeSize = 500;
      readSize = 1000;
    }

    setAssumptions(prev => ({
      ...prev,
      readsPerUser: reads,
      writesPerUser: writes,
      readSizeBytes: readSize,
      writeSizeBytes: writeSize
    }));
  }, [form]);

  const updateAssumption = (key, value) => {
    setAssumptions(prev => ({ ...prev, [key]: Number(value) }));
  };

  const dau = Number(form.users) || 1000000;
  
  // RPS
  const totalRequestsPerDay = dau * (assumptions.readsPerUser + assumptions.writesPerUser);
  const averageRPS = Math.ceil(totalRequestsPerDay / 86400);
  const peakRPS = averageRPS * 2; // Assuming peak is 2x average

  // Storage
  const storagePerDayBytes = dau * assumptions.writesPerUser * assumptions.writeSizeBytes;
  const storagePerYearGB = ((storagePerDayBytes * 365) / (1024 ** 3)).toFixed(2);
  const storage5YearsTB = (((storagePerDayBytes * 365 * 5) / (1024 ** 4))).toFixed(2);

  // Bandwidth
  const bandwidthPerDayBytes = dau * assumptions.readsPerUser * assumptions.readSizeBytes;
  const bandwidthMbps = Math.ceil((bandwidthPerDayBytes * 8) / (86400 * 1000 * 1000));

  // Memory (Cache) - caching active users metadata
  const activeUsers = (dau * (assumptions.cacheActiveUsersPercent / 100));
  const cacheMemoryMB = Math.ceil((activeUsers * 2000) / (1024 ** 2)); // 2KB per user cache

  // Servers
  const estimatedServers = Math.max(1, Math.ceil(peakRPS / assumptions.serversCapacityRPS));

  return (
    <div style={{ marginTop: "2rem" }}>
      <h3 style={{ marginBottom: "1rem", fontWeight: 700, color: "#111" }}>Capacity & Hardware Estimation</h3>
      
      <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1.5rem" }}>
        <div style={{ flex: 1, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: "1.25rem" }}>
          <h4 style={{ marginBottom: "1rem", color: "#334155", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "1px" }}>Assumptions Override</h4>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <label style={{ fontSize: "0.8rem", color: "#64748b" }}>Reads per DAU</label>
              <input type="number" value={assumptions.readsPerUser} onChange={e => updateAssumption("readsPerUser", e.target.value)} 
                style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", background: "#fff" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <label style={{ fontSize: "0.8rem", color: "#64748b" }}>Writes per DAU</label>
              <input type="number" value={assumptions.writesPerUser} onChange={e => updateAssumption("writesPerUser", e.target.value)} 
                style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", background: "#fff" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <label style={{ fontSize: "0.8rem", color: "#64748b" }}>Read Size (Bytes)</label>
              <input type="number" value={assumptions.readSizeBytes} onChange={e => updateAssumption("readSizeBytes", e.target.value)} 
                style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", background: "#fff" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <label style={{ fontSize: "0.8rem", color: "#64748b" }}>Write Size (Bytes)</label>
              <input type="number" value={assumptions.writeSizeBytes} onChange={e => updateAssumption("writeSizeBytes", e.target.value)} 
                style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", background: "#fff" }} />
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
        
        {/* RPS Card */}
        <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", padding: "1.25rem", borderRadius: 12 }}>
          <div style={{ fontSize: "0.8rem", color: "#3b82f6", fontWeight: 600, textTransform: "uppercase" }}>Throughput</div>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#1e3a8a", margin: "0.5rem 0" }}>{averageRPS.toLocaleString()} <span style={{fontSize:"0.9rem"}}>RPS</span></div>
          <div style={{ fontSize: "0.75rem", color: "#60a5fa", display:"flex", justifyContent:"space-between" }}>
            <span>Peak: {peakRPS.toLocaleString()} RPS</span>
          </div>
        </div>

        {/* Storage Card */}
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", padding: "1.25rem", borderRadius: 12 }}>
          <div style={{ fontSize: "0.8rem", color: "#ef4444", fontWeight: 600, textTransform: "uppercase" }}>Storage</div>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#7f1d1d", margin: "0.5rem 0" }}>{storage5YearsTB} <span style={{fontSize:"0.9rem"}}>TB / 5yrs</span></div>
          <div style={{ fontSize: "0.75rem", color: "#f87171", display:"flex", justifyContent:"space-between" }}>
            <span>{storagePerYearGB} GB / yr</span>
          </div>
        </div>

        {/* Bandwidth Card */}
        <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "1.25rem", borderRadius: 12 }}>
          <div style={{ fontSize: "0.8rem", color: "#22c55e", fontWeight: 600, textTransform: "uppercase" }}>Bandwidth</div>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#14532d", margin: "0.5rem 0" }}>{bandwidthMbps.toLocaleString()} <span style={{fontSize:"0.9rem"}}>Mbps</span></div>
          <div style={{ fontSize: "0.75rem", color: "#4ade80", display:"flex", justifyContent:"space-between" }}>
            <span>Egress</span>
          </div>
        </div>

        {/* Memory Cache Card */}
        <div style={{ background: "#fffbeb", border: "1px solid #fde68a", padding: "1.25rem", borderRadius: 12 }}>
          <div style={{ fontSize: "0.8rem", color: "#f59e0b", fontWeight: 600, textTransform: "uppercase" }}>Cache Memory</div>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#78350f", margin: "0.5rem 0" }}>{cacheMemoryMB.toLocaleString()} <span style={{fontSize:"0.9rem"}}>MB</span></div>
          <div style={{ fontSize: "0.75rem", color: "#fbbf24", display:"flex", justifyContent:"space-between" }}>
            <span>For {assumptions.cacheActiveUsersPercent}% active users</span>
          </div>
        </div>

        {/* Server Count Card */}
        <div style={{ background: "#f3f4f6", border: "1px solid #e5e7eb", padding: "1.25rem", borderRadius: 12 }}>
          <div style={{ fontSize: "0.8rem", color: "#6b7280", fontWeight: 600, textTransform: "uppercase" }}>API Servers</div>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#1f2937", margin: "0.5rem 0" }}>{estimatedServers} <span style={{fontSize:"0.9rem"}}>Nodes</span></div>
          <div style={{ fontSize: "0.75rem", color: "#9ca3af", display:"flex", justifyContent:"space-between" }}>
            <span>@ {assumptions.serversCapacityRPS} RPS/node</span>
          </div>
        </div>

      </div>

    </div>
  );
}
