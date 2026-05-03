import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

function Graph3D({ data }) {
  const mountRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [details, setDetails] = useState(null);
  const [play, setPlay] = useState(false);

  useEffect(() => {
    const mountNode = mountRef.current;

    const width = mountNode.clientWidth;
    const height = mountNode.clientHeight;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 25;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    mountNode.appendChild(renderer.domElement);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const nodeMeshes = {};

    // 🎨 Color by layer
    const layerColor = {
      client: 0x8888ff,
      edge: 0x00aaff,
      traffic: 0xffaa00,
      service: 0x00ff88,
      data: 0xff4444,
      async: 0xaa66ff
    };

    // 🔹 Create nodes
    data.graph.nodes.forEach((node, index) => {
      const geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
      const material = new THREE.MeshBasicMaterial({
        color: layerColor[node.layer] || 0xffffff
      });

      const cube = new THREE.Mesh(geometry, material);

      cube.position.x = (index % 5) * 5 - 10;
      cube.position.y = Math.floor(index / 5) * 4 - 6;

      cube.userData = node;

      scene.add(cube);
      nodeMeshes[node.id] = cube;
    });

    // 🔹 Create edges
    data.graph.edges.forEach(([from, to]) => {
      if (!nodeMeshes[from] || !nodeMeshes[to]) return;

      const points = [
        nodeMeshes[from].position.clone(),
        nodeMeshes[to].position.clone()
      ];

      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({ color: 0xffffff });
      const line = new THREE.Line(geometry, material);

      scene.add(line);
    });

    // 🟡 Flow particle
    const particleGeo = new THREE.SphereGeometry(0.3, 16, 16);
    const particleMat = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    const particle = new THREE.Mesh(particleGeo, particleMat);
    scene.add(particle);

    // 🔥 Build simple request flow path
    function buildMainPath() {
      const nodes = data.graph.nodes;

      const get = (id) =>
        nodeMeshes[id] ? nodeMeshes[id].position.clone() : null;

      const path = [];

      if (get("client")) path.push(get("client"));
      if (get("cdn")) path.push(get("cdn"));
      if (get("gateway")) path.push(get("gateway"));
      if (get("lb")) path.push(get("lb"));

      const firstService = nodes.find((n) => n.layer === "service");
      if (firstService) path.push(get(firstService.id));

      const cache = nodes.find((n) => n.id === "cache");
      if (cache) path.push(get("cache"));

      const db = nodes.find((n) =>
        n.id.toLowerCase().includes("db")
      );
      if (db) path.push(get(db.id));

      return path.filter(Boolean);
    }

    const flowPath = buildMainPath();

    let t = 0;
    let segment = 0;

    // 🎬 Animation loop
    function animate() {
      requestAnimationFrame(animate);

      scene.rotation.y += 0.003;

      if (play && flowPath.length > 1) {
        const p1 = flowPath[segment];
        const p2 = flowPath[segment + 1];

        if (p1 && p2) {
          particle.position.lerpVectors(p1, p2, t);
          t += 0.01;

          if (t >= 1) {
            t = 0;
            segment++;
            if (segment >= flowPath.length - 1) {
              segment = 0;
            }
          }
        }
      }

      renderer.render(scene, camera);
    }

    animate();

    // 🖱️ Click handler
    function onClick(event) {
      const rect = renderer.domElement.getBoundingClientRect();

      mouse.x = ((event.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObjects(scene.children);

      if (intersects.length > 0) {
        const obj = intersects[0].object;
        const node = obj.userData;

        if (!node) return;

        setSelectedNode(node);

        const service = data.services.find(
          (s) => s.service === node.id
        );

        if (service) {
          setDetails(service.internalStructure);
        } else {
          setDetails(null);
        }
      }
    }

    renderer.domElement.addEventListener("click", onClick);

    // 🧹 Cleanup (fixed properly)
    return () => {
      renderer.domElement.removeEventListener("click", onClick);
      mountNode.removeChild(renderer.domElement);
    };
  }, [data, play]);

  return (
    <div>
      <button
        onClick={() => setPlay((p) => !p)}
        style={{ margin: "10px", padding: "8px 16px" }}
      >
        {play ? "Stop Flow" : "Play Flow"}
      </button>

      <div
        ref={mountRef}
        style={{ width: "100%", height: "500px" }}
      ></div>

      {/* 📌 Info Panel */}
      {selectedNode && (
        <div
          style={{
            position: "absolute",
            right: "20px",
            top: "80px",
            background: "#111",
            color: "#fff",
            padding: "15px",
            borderRadius: "10px",
            width: "260px"
          }}
        >
          <h3>{selectedNode.label}</h3>
          <p>
            <strong>Layer:</strong> {selectedNode.layer}
          </p>

          {details && (
            <>
              <h4>LLD Components:</h4>
              <ul>
                {details.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default Graph3D;