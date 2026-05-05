import React, { useState, useCallback, useEffect, useRef } from "react";
import ReactFlow, {
  Controls, Background, applyNodeChanges, applyEdgeChanges,
  MarkerType, Handle, Position, useReactFlow, ReactFlowProvider
} from "reactflow";
import "reactflow/dist/style.css";

// ── CONSTANTS ───────────────────────────────────────────────
const NODE_W     = 220;   
const NODE_H     = 70;    
const COL_GAP    = 100;   
const ROW_H      = 180;   
const START_Y    = 50;   

const VIBRANT_PALETTE = ["#6366f1", "#8b5cf6", "#f59e0b", "#10b981", "#f43f5e", "#06b6d4", "#f97316", "#d946ef"];

const LAYER_COLORS = {
  routes:      { border: "#6366f1", glow: "#6366f1", icon: "🌐", badge: "ROUTE" },
  controllers: { border: "#f59e0b", glow: "#f59e0b", icon: "🎮", badge: "CONTROLLER" },
  services:    { border: "#10b981", glow: "#10b981", icon: "⚙️",  badge: "SERVICE" },
  models:      { border: "#06b6d4", glow: "#06b6d4", icon: "🗄️", badge: "MODEL" },
  data:        { border: "#06b6d4", glow: "#06b6d4", icon: "🗄️", badge: "DATA" },
  config:      { border: "#8b5cf6", glow: "#8b5cf6", icon: "🔧", badge: "CONFIG" },
  utils:       { border: "#94a3b8", glow: "#94a3b8", icon: "🛠️", badge: "UTIL" },
  root:        { border: "#f43f5e", glow: "#f43f5e", icon: "📄", badge: "CORE" },
  other:       { border: "#52525b", glow: "#52525b", icon: "📄", badge: "MODULE" },
};

const TIER_ORDER = ["routes", "controllers", "services", "models", "data", "config", "utils", "root"];

const MAX_NODES_PER_ROW = 4;
const GROUP_PADDING = 30;

function buildLayout(rawNodes) {
  const tierBuckets = {};
  rawNodes.forEach(node => {
    const tier = node.data.layer || "other";
    const orderIndex = TIER_ORDER.indexOf(tier.toLowerCase());
    const rowIndex = orderIndex === -1 ? 99 : orderIndex;
    if (!tierBuckets[rowIndex]) tierBuckets[rowIndex] = [];
    tierBuckets[rowIndex].push(node);
  });

  const sortedRows = Object.keys(tierBuckets).sort((a, b) => Number(a) - Number(b));
  const contentNodes = [];
  let currentY = START_Y;

  sortedRows.forEach((rowIndex) => {
    const rowBucket = tierBuckets[rowIndex];
    const tierName = (rowBucket[0]?.data.layer || "MODULES").toUpperCase();
    const groupId = `group-${rowIndex}`;
    
    // Calculate group dimensions
    const numRows = Math.ceil(rowBucket.length / MAX_NODES_PER_ROW);
    const numCols = Math.min(rowBucket.length, MAX_NODES_PER_ROW);
    const groupW = numCols * (NODE_W + COL_GAP) - COL_GAP + GROUP_PADDING * 2;
    const groupH = numRows * ROW_H + GROUP_PADDING * 2;

    // Add Group Node
    contentNodes.push({
      id: groupId,
      type: "groupNode",
      data: { label: tierName },
      position: { x: -groupW / 2, y: currentY },
      style: { width: groupW, height: groupH, background: "#11111a", border: "1px dashed #333", borderRadius: 12 },
      zIndex: -1
    });

    // Add modules inside group
    rowBucket.forEach((node, idx) => {
      const row = Math.floor(idx / MAX_NODES_PER_ROW);
      const col = idx % MAX_NODES_PER_ROW;
      
      contentNodes.push({
        ...node,
        parentId: groupId,
        extent: 'parent',
        position: {
          x: GROUP_PADDING + col * (NODE_W + COL_GAP),
          y: GROUP_PADDING + row * ROW_H + 20, 
        },
        zIndex: 1
      });
    });

    currentY += groupH + ROW_H / 4;
  });

  return { contentNodes };
}

const GroupNode = ({ data }) => (
  <div style={{
    width: "100%", height: "100%", 
    pointerEvents: "none", 
    position: "relative"
  }}>
    <div style={{
      position: "absolute", top: 12, left: 12,
      fontSize: "0.65rem", fontWeight: 900, color: "rgba(255,255,255,0.3)",
      letterSpacing: "2px", textTransform: "uppercase"
    }}>
      {data.label} Group
    </div>
  </div>
);

const DependencyNode = ({ data, selected }) => {
  const cfg = data.cfg || LAYER_COLORS.other;
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
        ? `0 0 0 2px #fff, 0 0 25px ${cfg.glow}aa`
        : `0 0 10px ${cfg.glow}25`,
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      padding: "0 14px",
      gap: 12,
      position: "relative",
    }}>
      <div style={{
        position: "absolute", top: -12, left: 10,
        background: cfg.border, color: "#000",
        fontSize: 9, fontWeight: 900,
        padding: "2px 8px", borderRadius: 4,
        letterSpacing: "1px", fontFamily: "monospace",
      }}>
        {cfg.badge}
      </div>

      {/* Multiple handles to distribute edges */}
      {/* Multiple handles to distribute edges - hidden to avoid visual glitch */}
      <Handle type="target" position={Position.Top} id="t1" style={{ left: "25%", opacity: 0 }} />
      <Handle type="target" position={Position.Top} id="t"  style={{ left: "50%", opacity: 0 }} />
      <Handle type="target" position={Position.Top} id="t2" style={{ left: "75%", opacity: 0 }} />

      <Handle type="source" position={Position.Bottom} id="s1" style={{ left: "25%", opacity: 0 }} />
      <Handle type="source" position={Position.Bottom} id="s"  style={{ left: "50%", opacity: 0 }} />
      <Handle type="source" position={Position.Bottom} id="s2" style={{ left: "75%", opacity: 0 }} />

      <div style={{ fontSize: 24 }}>{cfg.icon}</div>
      <div style={{ 
        fontSize: 11, 
        fontWeight: 700, 
        color: "#fff", 
        fontFamily: "'Outfit', sans-serif",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        flex: 1,
        letterSpacing: "0.2px"
      }}>
        {data.label}
      </div>
    </div>
  );
};

const nodeTypes = { dependency: DependencyNode, groupNode: GroupNode };

function DependencyContent({ dependencyData }) {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [hoveredEdge, setHoveredEdge] = useState(null);
  const { fitView } = useReactFlow();

  const isFirstRender = useRef(true);

  useEffect(() => {
    if (!dependencyData) return;

    const rawNodes = dependencyData.nodes.map(n => ({
      id: n.id,
      type: "dependency",
      data: { label: n.label, layer: n.layer },
      position: { x: 0, y: 0 },
    }));

    const rawEdges = dependencyData.edges.map(([source, target], i) => {
      const color = VIBRANT_PALETTE[i % VIBRANT_PALETTE.length];
      
      const sHandle = i % 3 === 0 ? "s1" : i % 3 === 1 ? "s2" : "s";
      const tHandle = i % 3 === 0 ? "t1" : i % 3 === 1 ? "t2" : "t";

      return {
        id: `e${i}-${source}-${target}`,
        source,
        target,
        sourceHandle: sHandle,
        targetHandle: tHandle,
        animated: true,
        style: { 
          stroke: color, 
          strokeWidth: 2.5, 
          opacity: 0.9,
          filter: `drop-shadow(0 0 3px ${color}66)` 
        },
        markerEnd: { type: MarkerType.ArrowClosed, color: color, width: 14, height: 14 },
        type: "default", 
      };
    });

    const { contentNodes } = buildLayout(rawNodes);
    setNodes(contentNodes);
    setEdges(rawEdges);

    if (isFirstRender.current) {
      setTimeout(() => {
        fitView({ duration: 800, padding: 0.2 });
        isFirstRender.current = false;
      }, 500);
    }
  }, [dependencyData, fitView]);

  const onNodesChange = useCallback(c => setNodes(n => applyNodeChanges(c, n)), []);
  const onEdgesChange = useCallback(c => setEdges(e => applyEdgeChanges(c, e)), []);

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
          strokeWidth: isHovered ? 5 : 2,
          opacity: isHovered ? 1 : anyHovered ? 0.15 : 0.8,
          filter: isHovered ? `drop-shadow(0 0 8px ${edge.style.stroke})` : "none",
          transition: "all 0.3s ease"
        },
        animated: isHovered || edge.animated,
        zIndex: isHovered ? 1000 : 0
      };
    }));
  }, [hoveredEdge]);

  return (
    <div style={{ width: "100%", height: "100%", background: "#070710", position: "relative" }}>
      <div className="diagram-title" style={{
        position: "absolute", top: 24, left: 24, zIndex: 10,
        display: "flex", flexDirection: "column", gap: 6
      }}>
        <div className="diagram-subtitle" style={{ fontSize: "0.65rem", fontWeight: 900, color: "rgba(255,255,255,0.4)", letterSpacing: "3px", textTransform: "uppercase" }}>
          Module Architecture
        </div>
        <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "#fff", letterSpacing: "-0.5px" }}>
          DEPENDENCY AUDIT
        </div>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onEdgeMouseEnter={onEdgeMouseEnter}
        onEdgeMouseLeave={onEdgeMouseLeave}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        style={{ background: "transparent" }}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={true}
      >
        <Background color="#11111a" gap={50} size={1} variant="lines" />
        <Controls />
      </ReactFlow>
    </div>
  );
}

export default function DependencyMap(props) {
  return (
    <ReactFlowProvider>
      <DependencyContent {...props} />
    </ReactFlowProvider>
  );
}
