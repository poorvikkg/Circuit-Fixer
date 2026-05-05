// ===============================
// Architecture Generator Service — v2 (FAANG-aware)
// ===============================

const LABELS = {
  // infra edge
  dns_route53: "Route 53 (DNS)",
  cdn_cloudfront: "CloudFront (CDN/Edge Cache)",
  waf_security_layer: "WAF & Shield",
  load_balancer: "Application Load Balancer",
  rate_limiter_redis: "Redis Rate Limiter",
  identity_provider: "Cognito / Auth0 (IdP)",

  // api
  gRPC_API_Gateway: "gRPC API Gateway",
  Apollo_Federation_Gateway: "Apollo GraphQL Gateway",
  REST_API_Gateway: "REST API Gateway",
  Service_Mesh_Istio: "Istio Service Mesh",
  service_discovery_consul: "Consul (Service Discovery)",
  centralized_config_server: "Spring Cloud Config",
  auto_scaling: "Auto Scaling Group",

  // services
  auth_service: "Auth Service",
  user_service: "User Service",
  audit_logging_service: "Audit Log Service",
  feed_service: "Feed Service",
  chat_service: "Chat Service",
  media_service: "Media Service",
  notification_service: "Notification Service",

  // observability
  OpenTelemetry_Collector: "OpenTelemetry Collector",
  distributed_tracing_jaeger: "Jaeger (Tracing)",
  metrics_prometheus: "Prometheus & Grafana",
  log_aggregator_elk: "ELK Stack (Logging)",
  Chaos_Mesh_Agent: "Chaos Mesh Agent",

  // data
  Write_Model_DB: "Write Model DB (CQRS)",
  Read_Model_DB: "Read Model DB (CQRS)",
  NewSQL_Distributed_DB: "NewSQL Distributed DB",
  SQL_DB_Strict: "SQL DB (Strict)",
  NoSQL_DB: "NoSQL DB",
  SQL_DB: "SQL DB",
  Redis_Cluster_Ultra_Fast: "Redis Cluster (Ultra-Fast)",
  cache: "Cache (Redis)",
  read_replica: "Read Replica",
  sharding: "DB Sharding",
  Cross_Region_Active_Replication: "Cross-Region Replication",
  KMS_Encryption_Service: "KMS Encryption",
  blob_storage_s3: "S3 Object Storage",

  // async
  Event_Store_Kafka: "Event Store (Kafka)",
  message_queue: "Message Queue",
  worker_services: "Worker Services",
  event_streaming: "Event Streaming",
};

function label(id) {
  return LABELS[id] || id.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

function generateArchitecture(decisions) {
  const nodes = [];
  const edges = [];
  const infra = decisions.infrastructure;

  // ── Client ──
  nodes.push({ id: "client", label: "Client", layer: "client" });

  let lastNodeId = "client";

  // 1. DNS
  if (infra.includes("dns_route53")) {
    nodes.push({ id: "dns_route53", label: label("dns_route53"), layer: "edge" });
    edges.push([lastNodeId, "dns_route53"]);
    lastNodeId = "dns_route53";
  }

  // 2. CDN / Edge Compute
  if (infra.includes("cdn_cloudfront")) {
    nodes.push({ id: "cdn_cloudfront", label: label("cdn_cloudfront"), layer: "edge" });
    edges.push([lastNodeId, "cdn_cloudfront"]);
    lastNodeId = "cdn_cloudfront";
  }

  if (infra.includes("edge_compute")) {
    nodes.push({ id: "edge_compute", label: label("edge_compute"), layer: "edge" });
    edges.push([lastNodeId, "edge_compute"]);
    lastNodeId = "edge_compute";
  }

  // 3. WAF
  if (infra.includes("waf_security_layer")) {
    nodes.push({ id: "waf_security_layer", label: label("waf_security_layer"), layer: "edge" });
    edges.push([lastNodeId, "waf_security_layer"]);
    lastNodeId = "waf_security_layer";
  }

  // 4. Load Balancer
  if (infra.includes("load_balancer")) {
    nodes.push({ id: "lb", label: label("load_balancer"), layer: "traffic" });
    edges.push([lastNodeId, "lb"]);
    lastNodeId = "lb";
  }

  // 5. Rate Limiter (Connects to API Gateway)
  let gatewayPrev = lastNodeId;
  if (infra.includes("rate_limiter_redis")) {
    nodes.push({ id: "rate_limiter_redis", label: label("rate_limiter_redis"), layer: "traffic" });
    edges.push([lastNodeId, "rate_limiter_redis"]);
    gatewayPrev = "rate_limiter_redis";
  }

  // 6. API Gateway
  const gatewayId = infra.find(i =>
    ["gRPC_API_Gateway", "Apollo_Federation_Gateway", "REST_API_Gateway"].includes(i)
  ) || "REST_API_Gateway";
  
  nodes.push({ id: gatewayId, label: label(gatewayId), layer: "traffic" });
  edges.push([gatewayPrev, gatewayId]);
  
  // 7. Identity Provider (IdP) connects to API Gateway
  if (infra.includes("identity_provider")) {
    nodes.push({ id: "identity_provider", label: label("identity_provider"), layer: "traffic" });
    edges.push([gatewayId, "identity_provider"]); // Gateway checks Auth against IdP
  }

  let servicePrev = gatewayId;

  // 8. Service Mesh
  if (infra.includes("Service_Mesh_Istio")) {
    nodes.push({ id: "Service_Mesh_Istio", label: label("Service_Mesh_Istio"), layer: "traffic" });
    edges.push([gatewayId, "Service_Mesh_Istio"]);
    servicePrev = "Service_Mesh_Istio";
  }

  // 9. Core Services
  const coreServices = decisions.services.filter(s => !["OpenTelemetry_Collector", "distributed_tracing_jaeger", "metrics_prometheus", "log_aggregator_elk", "Chaos_Mesh_Agent", "centralized_config_server"].includes(s));
  
  coreServices.forEach(svc => {
    nodes.push({ id: svc, label: label(svc), layer: "service" });
    edges.push([servicePrev, svc]);
  });

  // 10. Service Discovery & Config (Services connect to them)
  if (infra.includes("service_discovery_consul")) {
    nodes.push({ id: "service_discovery_consul", label: label("service_discovery_consul"), layer: "infra" });
    coreServices.forEach(svc => edges.push([svc, "service_discovery_consul"]));
  }
  
  if (decisions.services.includes("centralized_config_server")) {
    nodes.push({ id: "centralized_config_server", label: label("centralized_config_server"), layer: "infra" });
    coreServices.forEach(svc => edges.push([svc, "centralized_config_server"]));
  }

  // 11. Observability Sidecars (Every service pushes telemetry to collector)
  if (decisions.services.includes("OpenTelemetry_Collector")) {
    nodes.push({ id: "OpenTelemetry_Collector", label: label("OpenTelemetry_Collector"), layer: "infra" });
    coreServices.forEach(svc => edges.push([svc, "OpenTelemetry_Collector"]));
    
    if (decisions.services.includes("distributed_tracing_jaeger")) {
      nodes.push({ id: "distributed_tracing_jaeger", label: label("distributed_tracing_jaeger"), layer: "infra" });
      edges.push(["OpenTelemetry_Collector", "distributed_tracing_jaeger"]);
    }
    if (decisions.services.includes("metrics_prometheus")) {
      nodes.push({ id: "metrics_prometheus", label: label("metrics_prometheus"), layer: "infra" });
      edges.push(["OpenTelemetry_Collector", "metrics_prometheus"]);
    }
  }

  if (decisions.services.includes("log_aggregator_elk")) {
    nodes.push({ id: "log_aggregator_elk", label: label("log_aggregator_elk"), layer: "infra" });
    coreServices.forEach(svc => edges.push([svc, "log_aggregator_elk"]));
  }

  // ── Data Layer ──
  decisions.dataLayer.forEach(db => {
    nodes.push({ id: db, label: label(db), layer: "data" });
    coreServices.forEach(svc => edges.push([svc, db]));
  });

  // ── Async Layer ──
  decisions.asyncLayer.forEach(asyncItem => {
    nodes.push({ id: asyncItem, label: label(asyncItem), layer: "async" });
    coreServices.forEach(svc => edges.push([svc, asyncItem]));
  });

  return { nodes, edges };
}

module.exports = { generateArchitecture };