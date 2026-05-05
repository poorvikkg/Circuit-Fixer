import React, { useState, useEffect } from "react";

export default function CapacityCalculator({ form }) {
  const [assumptions, setAssumptions] = useState({
    readsPerUser: 50,
    writesPerUser: 10,
    readSizeBytes: 1000,
    writeSizeBytes: 500,
    cacheActiveUsersPercent: 20,
    serversCapacityRPS: 1000
  });

  useEffect(() => {
    setAssumptions(prev => ({
      ...prev,
      readsPerUser: 50,
      writesPerUser: 10,
      readSizeBytes: 1000,
      writeSizeBytes: 500
    }));
  }, [form]);

  const updateAssumption = (key, value) => {
    setAssumptions(prev => ({ ...prev, [key]: Number(value) }));
  };

  const dau = Number(form.users) || 1000000;

  const totalRequestsPerDay = dau * (assumptions.readsPerUser + assumptions.writesPerUser);
  const averageRPS = Math.ceil(totalRequestsPerDay / 86400);
  const peakRPS = averageRPS * 2;
  const storagePerDayBytes = dau * assumptions.writesPerUser * assumptions.writeSizeBytes;
  const storagePerYearGB = ((storagePerDayBytes * 365) / (1024 ** 3)).toFixed(2);
  const storage5YearsTB = (((storagePerDayBytes * 365 * 5) / (1024 ** 4))).toFixed(2);
  const bandwidthPerDayBytes = dau * assumptions.readsPerUser * assumptions.readSizeBytes;
  const bandwidthMbps = Math.ceil((bandwidthPerDayBytes * 8) / (86400 * 1000 * 1000));
  const estimatedServers = Math.max(1, Math.ceil(peakRPS / assumptions.serversCapacityRPS));

  return (
    <div style={{ marginTop: "2rem" }}>
      {/* Assumptions Panel */}
      <div style={{ background: "#050505", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 0, padding: "1.5rem", marginBottom: "2rem" }}>
        <h4 style={{ marginBottom: "1.5rem", color: "#fff", fontSize: "0.65rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1.5px" }}>Assumptions Override</h4>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <label style={{ fontSize: "0.7rem", color: "#a1a1aa", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px" }}>Reads per DAU</label>
            <input type="number" value={assumptions.readsPerUser} onChange={e => updateAssumption("readsPerUser", e.target.value)}
              className="editable-input" />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <label style={{ fontSize: "0.7rem", color: "#a1a1aa", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px" }}>Writes per DAU</label>
            <input type="number" value={assumptions.writesPerUser} onChange={e => updateAssumption("writesPerUser", e.target.value)}
              className="editable-input" />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <label style={{ fontSize: "0.7rem", color: "#a1a1aa", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px" }}>Read Size (Bytes)</label>
            <input type="number" value={assumptions.readSizeBytes} onChange={e => updateAssumption("readSizeBytes", e.target.value)}
              className="editable-input" />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <label style={{ fontSize: "0.7rem", color: "#a1a1aa", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px" }}>Write Size (Bytes)</label>
            <input type="number" value={assumptions.writeSizeBytes} onChange={e => updateAssumption("writeSizeBytes", e.target.value)}
              className="editable-input" />
          </div>
        </div>
      </div>

      {/* Results Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.1)" }}>

        <div style={{ background: "#000", padding: "1.5rem" }}>
          <div style={{ fontSize: "0.65rem", color: "#a1a1aa", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1.5px" }}>Throughput</div>
          <div style={{ fontSize: "2rem", fontWeight: 800, color: "#fff", margin: "0.75rem 0" }}>{averageRPS.toLocaleString()} <span style={{ fontSize: "0.9rem", color: "#71717a" }}>RPS</span></div>
          <div style={{ fontSize: "0.7rem", color: "#71717a", fontWeight: 800 }}>PEAK CAPACITY: {peakRPS.toLocaleString()} RPS</div>
        </div>

        <div style={{ background: "#000", padding: "1.5rem" }}>
          <div style={{ fontSize: "0.65rem", color: "#a1a1aa", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1.5px" }}>Persistence</div>
          <div style={{ fontSize: "2rem", fontWeight: 800, color: "#fff", margin: "0.75rem 0" }}>{storage5YearsTB} <span style={{ fontSize: "0.9rem", color: "#71717a" }}>TB / 5Y</span></div>
          <div style={{ fontSize: "0.7rem", color: "#71717a", fontWeight: 800 }}>ANNUAL GROWTH: {storagePerYearGB} GB</div>
        </div>

        <div style={{ background: "#000", padding: "1.5rem" }}>
          <div style={{ fontSize: "0.65rem", color: "#a1a1aa", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1.5px" }}>Network I/O</div>
          <div style={{ fontSize: "2rem", fontWeight: 800, color: "#fff", margin: "0.75rem 0" }}>{bandwidthMbps.toLocaleString()} <span style={{ fontSize: "0.9rem", color: "#71717a" }}>MBPS</span></div>
          <div style={{ fontSize: "0.7rem", color: "#71717a", fontWeight: 800 }}>EGRESS PROJECTION</div>
        </div>

        <div style={{ background: "#000", padding: "1.5rem" }}>
          <div style={{ fontSize: "0.65rem", color: "#a1a1aa", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1.5px" }}>Node Compute</div>
          <div style={{ fontSize: "2rem", fontWeight: 800, color: "#fff", margin: "0.75rem 0" }}>{estimatedServers} <span style={{ fontSize: "0.9rem", color: "#71717a" }}>NODES</span></div>
          <div style={{ fontSize: "0.7rem", color: "#71717a", fontWeight: 800 }}>@ {assumptions.serversCapacityRPS} RPS/NODE</div>
        </div>
      </div>
    </div>
  );
}
