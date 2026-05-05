import React, { useState, useCallback, useEffect, useRef } from "react";
import ReactFlow, {
  Controls, Background, applyNodeChanges, applyEdgeChanges,
  MarkerType, Handle, Position, useReactFlow, ReactFlowProvider
} from "reactflow";
import "reactflow/dist/style.css";

// Constants
const NODE_W     = 280;   
const NODE_H     = 95;    
const COL_GAP    = 380;   // Even wider
const ROW_H      = 420;   // Even deeper to prevent line clumping
const LANE_PAD   = 40;    
const START_X    = 150;   
const START_Y    = 150;   

const SWIM_LANES = [
  { id: "client",   label: "CLIENT",             color: "#6366f1" },
  { id: "edge",     label: "EDGE / CDN",         color: "#8b5cf6" },
  { id: "traffic",  label: "GATEWAY",            color: "#f59e0b" },
  { id: "service",  label: "MICROSERVICES",       color: "#10b981" },
  { id: "async",    label: "ASYNC / EVENTS",      color: "#f43f5e" },
  { id: "data",     label: "DATA LAYER",          color: "#06b6d4" },
];

const TIER_ROW = {
  client: 0, security: 1, edge: 1, traffic: 2, infra: 2, service: 3, async: 4, data: 5, cache: 5,
};

const LAYER_STYLE = {
  client:   { border: "#6366f1", glow: "#6366f1", icon: "🖥️",  badge: "CLIENT"   },
  edge:     { border: "#8b5cf6", glow: "#8b5cf6", icon: "🌐",  badge: "EDGE"     },
  traffic:  { border: "#f59e0b", glow: "#f59e0b", icon: "⚖️",  badge: "GATEWAY"  },
  service:  { border: "#10b981", glow: "#10b981", icon: "⚙️",  badge: "SERVICE"  },
  data:     { border: "#06b6d4", glow: "#06b6d4", icon: "🗄️",  badge: "DATA"     },
  cache:    { border: "#f97316", glow: "#f97316", icon: "⚡",  badge: "CACHE"    },
  async:    { border: "#f43f5e", glow: "#f43f5e", icon: "📡",  badge: "ASYNC"    },
  security: { border: "#ef4444", glow: "#ef4444", icon: "🛡️",  badge: "SECURITY" },
  infra:    { border: "#8b5cf6", glow: "#8b5cf6", icon: "🔧",  badge: "INFRA"    },
};

const NODE_ICONS = {
  client: "🖥️", waf_security_layer: "🛡️", cdn_cloudfront: "☁️", edge_compute: "⚡",
  dns_route53: "📡", identity_provider: "🔑",
  gRPC_API_Gateway: "🔌", Apollo_Federation_Gateway: "🔮", REST_API_Gateway: "🔗",
  Service_Mesh_Istio: "🕸️", load_balancer: "⚖️", auto_scaling: "📈", rate_limiter_redis: "🚦",
  service_discovery_consul: "🗺️", centralized_config_server: "⚙️",
  auth_service: "🔑", user_service: "👤", feed_service: "📰", chat_service: "💬",
  media_service: "🎬", notification_service: "🔔", audit_logging_service: "📋",
  core_service: "⚙️", payment_service: "💳", ai_service: "🧠", search_service: "🔍",
  OpenTelemetry_Collector: "🔭", Chaos_Mesh_Agent: "🌪️",
  distributed_tracing_jaeger: "🔍", metrics_prometheus: "📊", log_aggregator_elk: "📝",
  NoSQL_DB: "🍃", SQL_DB: "🗄️", SQL_DB_Strict: "🔒", NewSQL_Distributed_DB: "🌐",
  Write_Model_DB: "✏️", Read_Model_DB: "👁️", data_warehouse: "🏢",
  cache: "⚡", Redis_Cluster_Ultra_Fast: "🚀", read_replica: "📄", sharding: "🧩",
  Cross_Region_Active_Replication: "🔄", KMS_Encryption_Service: "🔐", blob_storage_s3: "📦",
  Event_Store_Kafka: "🌊", message_queue: "📨", worker_services: "⚙️", event_streaming: "📡",
};

function resolveLayer(nodeId, layer) {
  if (nodeId === "client") return "client";
  if (["waf_security_layer", "KMS_Encryption_Service"].includes(nodeId)) return "security";
  if (["dns_route53", "cdn_cloudfront", "edge_compute", "gRPC_API_Gateway", "Apollo_Federation_Gateway", "REST_API_Gateway", "Service_Mesh_Istio", "identity_provider"].includes(nodeId)) return "edge";
  if (["load_balancer", "auto_scaling", "rate_limiter_redis", "service_discovery_consul", "centralized_config_server"].includes(nodeId)) return "traffic";
  if (nodeId.endsWith("_service") || ["OpenTelemetry_Collector", "Chaos_Mesh_Agent", "audit_logging_service", "distributed_tracing_jaeger", "metrics_prometheus", "log_aggregator_elk"].includes(nodeId)) return "service";
  if (["cache", "Redis_Cluster_Ultra_Fast"].includes(nodeId)) return "cache";
  if (["Event_Store_Kafka", "message_queue", "worker_services", "event_streaming"].includes(nodeId)) return "async";
  return layer || "data";
}

function buildLayout(rawNodes) {
  const tierBuckets = {};
  rawNodes.forEach(node => {
    const tier = resolveLayer(node.id, node.data?.layer);
    const rowIndex = TIER_ROW[tier] ?? 3;
    if (!tierBuckets[rowIndex]) tierBuckets[rowIndex] = [];
    tierBuckets[rowIndex].push(node);
  });

  const maxNodesInRow = Math.max(...Object.values(tierBuckets).map(b => b.length), 1);
  const canvasW = START_X * 2 + maxNodesInRow * (NODE_W + COL_GAP) - COL_GAP;

  const contentNodes = [];

  SWIM_LANES.forEach((lane, laneIndex) => {
    const laneY = START_Y + laneIndex * ROW_H;
    const rowBucket = tierBuckets[laneIndex] || [];
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

  return { contentNodes, canvasW };
}

const ArchNode = ({ data, selected }) => {
  const cfg = data.cfg || LAYER_STYLE.service;
  const icon = NODE_ICONS[data.nodeId] || cfg.icon;
  return (
    <div style={{
      width: NODE_W,
      height: NODE_H,
      background: "#0d0d12",
      border: `1.5px solid ${selected ? "#fff" : cfg.border}`,
      borderRadius: 12,
      cursor: "pointer",
      transition: "all 0.15s ease",
      boxShadow: selected
        ? `0 0 0 2px #fff, 0 0 25px ${cfg.glow}aa, 0 12px 32px rgba(0,0,0,0.9)`
        : `0 0 10px ${cfg.glow}35, 0 6px 16px rgba(0,0,0,0.7)`,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      position: "relative",
    }}>
      <div style={{
        position: "absolute", top: -12, left: 10,
        background: cfg.border, color: "#000",
        fontSize: 9, fontWeight: 800,
        padding: "2px 8px", borderRadius: 4,
        letterSpacing: "1px", fontFamily: "monospace",
      }}>
        {cfg.badge}
      </div>

      {/* Node handles */}
      <Handle id="t1" type="target" position={Position.Top} style={{ background: cfg.glow, width: 6, height: 6, border: "2px solid #000", left: "25%" }} />
      <Handle id="t" type="target" position={Position.Top} style={{ background: cfg.glow, width: 8, height: 8, border: "2px solid #000" }} />
      <Handle id="t2" type="target" position={Position.Top} style={{ background: cfg.glow, width: 6, height: 6, border: "2px solid #000", left: "75%" }} />

      <Handle id="s1" type="source" position={Position.Bottom} style={{ background: cfg.glow, width: 6, height: 6, border: "2px solid #000", left: "25%" }} />
      <Handle id="s" type="source" position={Position.Bottom} style={{ background: cfg.glow, width: 8, height: 8, border: "2px solid #000" }} />
      <Handle id="s2" type="source" position={Position.Bottom} style={{ background: cfg.glow, width: 6, height: 6, border: "2px solid #000", left: "75%" }} />

      <div style={{ fontSize: 26, lineHeight: 1 }}>{icon}</div>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#fff", textAlign: "center", fontFamily: "'Outfit', sans-serif", paddingInline: 12, textTransform: "uppercase", letterSpacing: "0.5px" }}>
        {data.label.replace(/_/g, " ")}
      </div>
    </div>
  );
};

const nodeTypes = { arch: ArchNode };

function DiagramContent({ architectureData, onNodeSelect }) {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [built, setBuilt] = useState(false);
  const containerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { fitView } = useReactFlow();

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isNowFull = !!document.fullscreenElement;
      setIsFullscreen(isNowFull);
      setTimeout(() => fitView({ duration: 400, padding: 0.15 }), 100);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [fitView]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => console.error("Fullscreen err:", err));
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
    }
  };

  useEffect(() => {
    if (!architectureData) return;

    const rawNodes = architectureData.nodes.map(n => ({
      id: n.id,
      type: "arch",
      data: { label: n.label, layer: n.layer, nodeId: n.id },
      position: { x: 0, y: 0 },
    }));

    const rawEdges = architectureData.edges.map(([source, target], i) => {
      const tierSource = resolveLayer(source);
      const color = (LAYER_STYLE[tierSource] || {}).border || "#52525b";
      
      // Distribute source/target handles based on edge index to reduce clumping
      const sHandle = i % 3 === 0 ? "s1" : i % 3 === 1 ? "s2" : "s";
      const tHandle = i % 3 === 0 ? "t1" : i % 3 === 1 ? "t2" : "t";

      return {
        id: `e${i}-${source}-${target}`,
        source,
        target,
        sourceHandle: sHandle,
        targetHandle: tHandle,
        animated: true,
        style: { stroke: color, strokeWidth: 2.5, opacity: 0.8 },
        markerEnd: { type: MarkerType.ArrowClosed, color: color, width: 16, height: 16 },
        type: "smoothstep",
        pathOptions: { borderRadius: 45 }, // Large radius to avoid overlapping right angles
      };
    });

    const { contentNodes } = buildLayout(rawNodes);
    setNodes(contentNodes);
    setEdges(rawEdges);
    setBuilt(true);
  }, [architectureData]);

  const onNodesChange = useCallback(c => setNodes(n => applyNodeChanges(c, n)), []);
  const onEdgesChange = useCallback(c => setEdges(e => applyEdgeChanges(c, e)), []);
  const onNodeClick   = useCallback((_, node) => {
    if (onNodeSelect && node.type === "arch") onNodeSelect(node.id, node.data);
  }, [onNodeSelect]);

  const [hoveredEdge, setHoveredEdge] = useState(null);

  const onEdgeMouseEnter = useCallback((_, edge) => setHoveredEdge(edge.id), []);
  const onEdgeMouseLeave = useCallback(() => setHoveredEdge(null), []);

  useEffect(() => {
    setEdges(currentEdges => currentEdges.map(edge => {
      const isHovered = edge.id === hoveredEdge;
      const anyHovered = !!hoveredEdge;
      return {
        ...edge,
        style: { 
          ...edge.style, 
          strokeWidth: isHovered ? 6 : 2.5,
          opacity: isHovered ? 1 : anyHovered ? 0.15 : 0.8, // Dim others significantly
          filter: isHovered ? `drop-shadow(0 0 10px ${edge.style.stroke})` : "none",
          transition: "all 0.3s ease"
        },
        animated: isHovered || edge.animated,
        zIndex: isHovered ? 1000 : 0
      };
    }));
  }, [hoveredEdge]);

  if (!built) return null;

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%", background: "#070710", position: "relative" }}>
      <button 
        onClick={toggleFullscreen}
        style={{
          position: "absolute", top: 20, right: 20, zIndex: 100,
          background: "rgba(0,0,0,0.8)", border: "1px solid rgba(255,255,255,0.2)",
          borderRadius: 0, padding: "10px 16px", color: "#fff",
          cursor: "pointer", display: "flex", alignItems: "center", gap: 10,
          fontSize: "0.7rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px",
          fontFamily: "'JetBrains Mono', monospace", backdropFilter: "blur(4px)"
        }}
      >
        {isFullscreen ? (
          <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg> EXIT FOCUS</>
        ) : (
          <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg> ENTER FOCUS</>
        )}
      </button>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onEdgeMouseEnter={onEdgeMouseEnter}
        onEdgeMouseLeave={onEdgeMouseLeave}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.15, maxZoom: 1 }}
        minZoom={0.05}
        maxZoom={2}
        style={{ background: "transparent" }}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#11111a" gap={50} size={1} variant="lines" />
        <Controls />
      </ReactFlow>
    </div>
  );
}

export default function ArchitectureDiagram(props) {
  return (
    <ReactFlowProvider>
      <DiagramContent {...props} />
    </ReactFlowProvider>
  );
}
