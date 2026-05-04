import React, { useState, useCallback, useEffect } from "react";
import ReactFlow, {
  Controls, Background, MiniMap, applyNodeChanges, applyEdgeChanges,
  MarkerType, Handle, Position, BaseEdge, getBezierPath, EdgeLabelRenderer
} from "reactflow";
import "reactflow/dist/style.css";

// ── CONSTANTS ─────────────────────────────────────────────────
const NODE_W     = 160;
const NODE_H     = 80;
const COL_GAP    = 200;   // horizontal gap between nodes in same row
const ROW_H      = 160;   // height per swim-lane row
const LANE_PAD   = 20;    // padding inside each swim-lane
const START_X    = 80;    // left margin
const START_Y    = 80;    // top margin

// ── SWIM-LANE DEFINITIONS (ordered top → bottom) ──────────────
const SWIM_LANES = [
  { id: "client",   label: "CLIENT",             color: "#3b82f6", bg: "rgba(59,130,246,0.05)"  },
  { id: "edge",     label: "EDGE / CDN / WAF",   color: "#8b5cf6", bg: "rgba(139,92,246,0.05)"  },
  { id: "traffic",  label: "GATEWAY / TRAFFIC",  color: "#f97316", bg: "rgba(249,115,22,0.05)"  },
  { id: "service",  label: "MICROSERVICES",       color: "#10b981", bg: "rgba(16,185,129,0.05)"  },
  { id: "async",    label: "ASYNC / EVENTS",      color: "#f59e0b", bg: "rgba(245,158,11,0.05)"  },
  { id: "data",     label: "DATA LAYER",          color: "#60a5fa", bg: "rgba(96,165,250,0.05)"  },
];

// Map tier name → swim-lane index (row)
const TIER_ROW = {
  client:   0,
  security: 1,
  edge:     1,
  traffic:  2,
  infra:    2,
  service:  3,
  async:    4,
  data:     5,
  cache:    5,
};

// ── LAYER CONFIG ──────────────────────────────────────────────
const LAYER_STYLE = {
  client:   { border: "#3b82f6", glow: "#3b82f6", icon: "🖥️",  badge: "CLIENT"   },
  edge:     { border: "#8b5cf6", glow: "#8b5cf6", icon: "🌐",  badge: "EDGE"     },
  traffic:  { border: "#f97316", glow: "#f97316", icon: "⚖️",  badge: "GATEWAY"  },
  service:  { border: "#10b981", glow: "#10b981", icon: "⚙️",  badge: "SERVICE"  },
  data:     { border: "#60a5fa", glow: "#60a5fa", icon: "🗄️",  badge: "DATA"     },
  cache:    { border: "#ef4444", glow: "#ef4444", icon: "⚡",  badge: "CACHE"    },
  async:    { border: "#f59e0b", glow: "#f59e0b", icon: "📡",  badge: "ASYNC"    },
  security: { border: "#f87171", glow: "#f87171", icon: "🛡️",  badge: "SECURITY" },
  infra:    { border: "#a78bfa", glow: "#a78bfa", icon: "🔧",  badge: "INFRA"    },
};

const NODE_ICONS = {
  client: "🖥️", waf_security_layer: "🛡️", cdn_cloudfront: "☁️", edge_compute: "⚡",
  dns_route53: "📡", identity_provider: "🔑",
  gRPC_API_Gateway: "🔌", Apollo_Federation_Gateway: "🔮", REST_API_Gateway: "🔗",
  Service_Mesh_Istio: "🕸️", load_balancer: "⚖️", auto_scaling: "📈", rate_limiter_redis: "🚦",
  service_discovery_consul: "🗺️", centralized_config_server: "⚙️",
  auth_service: "🔑", user_service: "👤", feed_service: "📰", chat_service: "💬",
  media_service: "🎬", notification_service: "🔔", audit_logging_service: "📋",
  OpenTelemetry_Collector: "🔭", Chaos_Mesh_Agent: "🌪️",
  distributed_tracing_jaeger: "🔍", metrics_prometheus: "📊", log_aggregator_elk: "📝",
  NoSQL_DB: "🍃", SQL_DB: "🗄️", SQL_DB_Strict: "🔒", NewSQL_Distributed_DB: "🌐",
  Write_Model_DB: "✏️", Read_Model_DB: "👁️",
  cache: "⚡", Redis_Cluster_Ultra_Fast: "🚀", read_replica: "📄", sharding: "🧩",
  Cross_Region_Active_Replication: "🔄", KMS_Encryption_Service: "🔐", blob_storage_s3: "📦",
  Event_Store_Kafka: "🌊", message_queue: "📨", worker_services: "⚙️", event_streaming: "📡",
};

function resolveLayer(nodeId, layer) {
  if (nodeId === "client") return "client";
  if (["waf_security_layer", "KMS_Encryption_Service"].includes(nodeId)) return "security";
  if (["dns_route53", "cdn_cloudfront", "edge_compute", "gRPC_API_Gateway",
       "Apollo_Federation_Gateway", "REST_API_Gateway", "Service_Mesh_Istio",
       "identity_provider"].includes(nodeId)) return "edge";
  if (["load_balancer", "auto_scaling", "rate_limiter_redis", "service_discovery_consul",
       "centralized_config_server"].includes(nodeId)) return "traffic";
  if (nodeId.endsWith("_service") || ["OpenTelemetry_Collector", "Chaos_Mesh_Agent",
       "audit_logging_service", "distributed_tracing_jaeger", "metrics_prometheus",
       "log_aggregator_elk"].includes(nodeId)) return "service";
  if (["cache", "Redis_Cluster_Ultra_Fast", "read_replica", "sharding",
       "Cross_Region_Active_Replication", "blob_storage_s3"].includes(nodeId)) return "cache";
  if (["Event_Store_Kafka", "message_queue", "worker_services",
       "event_streaming"].includes(nodeId)) return "async";
  return layer || "data";
}

// ── SWIM-LANE LAYOUT ENGINE ───────────────────────────────────
function buildLayout(rawNodes) {
  const tierBuckets = {};
  rawNodes.forEach(node => {
    const tier = resolveLayer(node.id, node.data?.layer);
    const rowIndex = TIER_ROW[tier] ?? 3;
    if (!tierBuckets[rowIndex]) tierBuckets[rowIndex] = [];
    tierBuckets[rowIndex].push(node);
  });

  // Canvas width based on max nodes in any row
  const maxNodesInRow = Math.max(...Object.values(tierBuckets).map(b => b.length), 1);
  const canvasW = START_X * 2 + maxNodesInRow * (NODE_W + COL_GAP) - COL_GAP;

  // Build lane background "group" nodes + positioned content nodes
  const laneNodes = [];
  const contentNodes = [];

  SWIM_LANES.forEach((lane, laneIndex) => {
    const laneY = START_Y + laneIndex * ROW_H;
    const rowBucket = tierBuckets[laneIndex] || [];

    // Swim-lane background
    laneNodes.push({
      id: `lane-${lane.id}`,
      type: "laneNode",
      position: { x: 0, y: laneY - LANE_PAD },
      data: { label: lane.label, color: lane.color, bg: lane.bg, width: canvasW },
      draggable: false,
      selectable: false,
      zIndex: -1,
    });

    // Content nodes — centered in lane
    const totalW = rowBucket.length * NODE_W + (rowBucket.length - 1) * COL_GAP;
    const offsetX = (canvasW - totalW) / 2;

    rowBucket.forEach((node, idx) => {
      const tier = resolveLayer(node.id, node.data?.layer);
      const cfg = LAYER_STYLE[tier] || LAYER_STYLE.service;
      contentNodes.push({
        ...node,
        position: {
          x: offsetX + idx * (NODE_W + COL_GAP),
          y: laneY + (ROW_H - NODE_H) / 2 - LANE_PAD / 2,
        },
        data: { ...node.data, tier, cfg },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top,
        zIndex: 1,
      });
    });
  });

  return { contentNodes, laneNodes, canvasW };
}

// ── SWIM-LANE BACKGROUND NODE ─────────────────────────────────
const LaneNode = ({ data }) => (
  <div style={{
    width: data.width,
    height: ROW_H,
    background: data.bg,
    border: `1px solid ${data.color}22`,
    borderLeft: `4px solid ${data.color}`,
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    paddingLeft: 16,
    boxSizing: "border-box",
    pointerEvents: "none",
  }}>
    <span style={{
      fontSize: 10, fontWeight: 800, letterSpacing: 2,
      color: data.color, fontFamily: "monospace",
      textTransform: "uppercase", opacity: 0.8,
      writingMode: "initial",
    }}>
      {data.label}
    </span>
  </div>
);

// ── CONTENT NODE ──────────────────────────────────────────────
const ArchNode = ({ data, selected }) => {
  const cfg = data.cfg || LAYER_STYLE.service;
  const icon = NODE_ICONS[data.nodeId] || cfg.icon;

  return (
    <div style={{
      width: NODE_W,
      height: NODE_H,
      background: "#0d0d12",
      border: `1.5px solid ${selected ? "#fff" : cfg.border}`,
      borderRadius: 10,
      cursor: "pointer",
      transition: "all 0.15s ease",
      boxShadow: selected
        ? `0 0 0 2px #fff, 0 0 20px ${cfg.glow}88, 0 8px 24px rgba(0,0,0,0.8)`
        : `0 0 8px ${cfg.glow}30, 0 4px 12px rgba(0,0,0,0.6)`,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      position: "relative",
      transform: selected ? "scale(1.04)" : "none",
      overflow: "visible",
    }}>
      {/* Layer badge */}
      <div style={{
        position: "absolute", top: -10, left: 8,
        background: cfg.border, color: "#000",
        fontSize: 8, fontWeight: 800,
        padding: "2px 6px", borderRadius: 4,
        letterSpacing: "0.8px", fontFamily: "monospace",
      }}>
        {cfg.badge}
      </div>

      {/* Bottom glow bar */}
      <div style={{
        position: "absolute", bottom: 0, left: "20%", right: "20%",
        height: 2, borderRadius: 2,
        background: `linear-gradient(90deg, transparent, ${cfg.glow}, transparent)`,
        opacity: 0.6,
      }} />

      {/* Handles — top and bottom for structured vertical flow */}
      <Handle type="target" position={Position.Top}
        style={{ background: cfg.glow, width: 8, height: 8, border: "2px solid #000", top: -5 }} />
      <Handle type="source" position={Position.Bottom}
        style={{ background: cfg.glow, width: 8, height: 8, border: "2px solid #000", bottom: -5 }} />
      {/* Side handles for cross-lane connections */}
      <Handle id="l" type="target" position={Position.Left}
        style={{ background: cfg.glow, width: 6, height: 6, border: "2px solid #000", left: -4 }} />
      <Handle id="r" type="source" position={Position.Right}
        style={{ background: cfg.glow, width: 6, height: 6, border: "2px solid #000", right: -4 }} />

      {/* Icon */}
      <div style={{ fontSize: 22, lineHeight: 1, filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" }}>
        {icon}
      </div>

      {/* Label */}
      <div style={{
        fontSize: 10, fontWeight: 600, color: "#e4e4e7",
        textAlign: "center", lineHeight: 1.3,
        fontFamily: "'Inter', sans-serif",
        paddingInline: 8, maxWidth: "90%",
      }}>
        {data.label}
      </div>
    </div>
  );
};

const edgeTypes  = {};
const nodeTypes  = { arch: ArchNode, laneNode: LaneNode };

// ── EDGE META ─────────────────────────────────────────────────
const EDGE_META = {
  "client->waf_security_layer":          { label: "HTTPS",       color: "#f87171" },
  "client->dns_route53":                 { label: "DNS",         color: "#8b5cf6" },
  "client->cdn_cloudfront":              { label: "HTTPS",       color: "#8b5cf6" },
  "client->REST_API_Gateway":            { label: "REST",        color: "#3b82f6" },
  "client->gRPC_API_Gateway":            { label: "gRPC",        color: "#3b82f6" },
  "client->Apollo_Federation_Gateway":   { label: "GraphQL",     color: "#3b82f6" },
  "dns_route53->cdn_cloudfront":         { label: "resolve",     color: "#8b5cf6" },
  "dns_route53->REST_API_Gateway":       { label: "resolve",     color: "#8b5cf6" },
  "cdn_cloudfront->REST_API_Gateway":    { label: "origin",      color: "#8b5cf6" },
  "waf_security_layer->cdn_cloudfront":  { label: "filtered",    color: "#f87171" },
  "rate_limiter_redis->REST_API_Gateway":{ label: "throttle",    color: "#f97316" },
  "rate_limiter_redis->gRPC_API_Gateway":{ label: "throttle",    color: "#f97316" },
  "REST_API_Gateway->Service_Mesh_Istio":{ label: "mesh",        color: "#8b5cf6" },
  "REST_API_Gateway->load_balancer":     { label: "route",       color: "#f97316" },
  "gRPC_API_Gateway->load_balancer":     { label: "route",       color: "#f97316" },
  "Service_Mesh_Istio->load_balancer":   { label: "LB",          color: "#f97316" },
  "identity_provider->REST_API_Gateway": { label: "verify",      color: "#f87171" },
  "identity_provider->gRPC_API_Gateway": { label: "verify",      color: "#f87171" },
};

function getEdgeMeta(source, target) {
  return EDGE_META[`${source}->${target}`] || { label: "", color: "#52525b" };
}

// ── MINIMAP ───────────────────────────────────────────────────
function minimapColor(node) {
  const tier = node.data?.tier;
  return (LAYER_STYLE[tier] || {}).glow || "#52525b";
}

// ── MAIN COMPONENT ────────────────────────────────────────────
export default function ArchitectureDiagram({ architectureData, onNodeSelect }) {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [built, setBuilt] = useState(false);

  useEffect(() => {
    if (!architectureData) return;

    const rawNodes = architectureData.nodes.map(n => ({
      id: n.id,
      type: "arch",
      data: { label: n.label, layer: n.layer, nodeId: n.id },
      position: { x: 0, y: 0 },
    }));

    const rawEdges = architectureData.edges.map(([source, target], i) => {
      const meta = getEdgeMeta(source, target);
      return {
        id: `e${i}-${source}-${target}`,
        source,
        target,
        animated: true,
        style: { stroke: meta.color, strokeWidth: 1.8 },
        markerEnd: { type: MarkerType.ArrowClosed, color: meta.color, width: 14, height: 14 },
        label: meta.label,
        labelStyle: {
          fontSize: 9, fill: meta.color, fontWeight: 700,
          fontFamily: "monospace", textTransform: "uppercase",
        },
        labelBgStyle: { fill: "#09090b", fillOpacity: 0.9 },
        labelBgPadding: [4, 6],
        labelBgBorderRadius: 4,
        type: "smoothstep",
        pathOptions: { borderRadius: 16 },
      };
    });

    const { contentNodes, laneNodes } = buildLayout(rawNodes);
    setNodes([...laneNodes, ...contentNodes]);
    setEdges(rawEdges);
    setBuilt(true);
  }, [architectureData]);

  const onNodesChange = useCallback(c => setNodes(n => applyNodeChanges(c, n)), []);
  const onEdgesChange = useCallback(c => setEdges(e => applyEdgeChanges(c, e)), []);
  const onNodeClick   = useCallback((_, node) => {
    if (onNodeSelect && node.type === "arch") onNodeSelect(node.id, node.data);
  }, [onNodeSelect]);

  if (!built) return null;

  return (
    <div style={{ width: "100%", height: "100%", background: "#070710", position: "relative" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.12, maxZoom: 0.9 }}
        minZoom={0.2}
        maxZoom={2}
        style={{ background: "transparent" }}
        proOptions={{ hideAttribution: true }}
        elementsSelectable
      >
        <Background color="#1a1a2e" gap={32} size={0.7} variant="dots" />
        <Controls style={{
          background: "#0d0d12", border: "1px solid #27272a",
          borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.5)"
        }} />
        <MiniMap
          nodeColor={minimapColor}
          maskColor="rgba(0,0,0,0.8)"
          style={{
            background: "#09090b", border: "1px solid #27272a",
            borderRadius: 8, bottom: 50
          }}
        />
      </ReactFlow>

      {/* Legend */}
      <div style={{
        position: "absolute", bottom: 12, left: "50%", transform: "translateX(-50%)",
        zIndex: 10, display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center",
        background: "rgba(7,7,16,0.92)", border: "1px solid #27272a",
        borderRadius: 10, padding: "6px 16px",
        backdropFilter: "blur(10px)",
      }}>
        {SWIM_LANES.map(lane => (
          <div key={lane.id} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: lane.color, boxShadow: `0 0 4px ${lane.color}` }} />
            <span style={{ fontSize: 9, color: "#a1a1aa", fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              {lane.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
