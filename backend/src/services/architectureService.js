// ===============================
// Architecture Generator Service
// ===============================

function generateArchitecture(decisions) {
  const nodes = [];
  const edges = [];

  // -------- Client Layer --------
  nodes.push({ id: "client", label: "Client", layer: "client" });

  // -------- Edge Layer --------
  if (decisions.infrastructure.includes("cdn")) {
    nodes.push({ id: "cdn", label: "CDN", layer: "edge" });
    edges.push(["client", "cdn"]);
  }

  nodes.push({ id: "gateway", label: "API Gateway", layer: "edge" });

  if (nodes.find(n => n.id === "cdn")) {
    edges.push(["cdn", "gateway"]);
  } else {
    edges.push(["client", "gateway"]);
  }

  // -------- Traffic Layer --------
  if (decisions.infrastructure.includes("load_balancer")) {
    nodes.push({ id: "lb", label: "Load Balancer", layer: "traffic" });
    edges.push(["gateway", "lb"]);
  }

  // -------- Service Layer --------
  decisions.services.forEach((service, index) => {
    const id = service;
    nodes.push({ id, label: service, layer: "service" });

    if (nodes.find(n => n.id === "lb")) {
      edges.push(["lb", id]);
    } else {
      edges.push(["gateway", id]);
    }
  });

  // -------- Data Layer --------
  decisions.dataLayer.forEach((dataComp) => {
    const id = dataComp;
    nodes.push({ id, label: dataComp, layer: "data" });

    // connect services → data
    decisions.services.forEach((service) => {
      edges.push([service, id]);
    });
  });

  // -------- Async Layer --------
  decisions.asyncLayer.forEach((asyncComp) => {
    const id = asyncComp;
    nodes.push({ id, label: asyncComp, layer: "async" });

    // connect services → async
    decisions.services.forEach((service) => {
      edges.push([service, id]);
    });
  });

  return {
    nodes,
    edges
  };
}

module.exports = { generateArchitecture };