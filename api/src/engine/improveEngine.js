// ===============================
// Improve Existing System Engine
// ===============================

// Analyzes user-described architecture and generates findings + improvements

function analyzeArchitecture(input) {
  const issues = [];
  const improvements = [];
  const tradeoffs = [];

  const desc = (input.existingHLD || "").toLowerCase();
  const pain = (input.improvementsWanted || "").toLowerCase();
  const scale = input.currentScale || "medium";
  const stack = (input.techStack || "").toLowerCase();

  // ── Scale / DB issues ──
  if (!desc.includes("replica") && !desc.includes("read replica")) {
    issues.push({
      severity: "critical",
      area: "Database",
      title: "No Read Replicas Detected",
      description: "Your architecture has no read replica strategy. At scale, all reads and writes hit the same primary DB instance, creating a severe bottleneck.",
      fix: "Add read replicas (AWS RDS Multi-AZ, Postgres streaming replication). Route all SELECT queries to replicas using a connection proxy like RDS Proxy or PgBouncer."
    });
  }

  if (!desc.includes("cache") && !desc.includes("redis") && !desc.includes("memcache")) {
    issues.push({
      severity: "critical",
      area: "Performance",
      title: "No Caching Layer",
      description: "Every request hits the database directly. This is unsustainable even at 10,000 DAU for read-heavy endpoints like feed, user profiles, or product listings.",
      fix: "Implement a Cache-Aside pattern using Redis. Cache frequently-read objects with a TTL. Invalidate cache on writes using event-driven hooks."
    });
  }

  if (!desc.includes("queue") && !desc.includes("kafka") && !desc.includes("rabbitmq") && !desc.includes("sqs")) {
    issues.push({
      severity: "high",
      area: "Reliability",
      title: "No Async Message Queue",
      description: "All operations are synchronous. If a downstream service (email, notification, media processing) is slow or fails, it blocks the user's request and degrades latency.",
      fix: "Decouple heavy operations using a message queue (AWS SQS, Kafka, or RabbitMQ). Use workers to process tasks asynchronously with retry + DLQ."
    });
  }

  if (!desc.includes("load balancer") && !desc.includes("lb") && !desc.includes("nginx") && !desc.includes("alb")) {
    issues.push({
      severity: "high",
      area: "Scalability",
      title: "No Load Balancer",
      description: "A single server handling all traffic is a single point of failure (SPOF). One crash takes down your entire system.",
      fix: "Add a Layer-7 load balancer (AWS ALB, GCP Cloud Load Balancing, or Nginx). Distribute traffic across multiple stateless service instances behind the LB."
    });
  }

  if (!desc.includes("cdn")) {
    issues.push({
      severity: "medium",
      area: "Performance",
      title: "No CDN for Static Assets",
      description: "Serving images, JS bundles, and media from your origin server adds unnecessary load and increases global latency by 200-500ms.",
      fix: "Push all static assets to a CDN (Cloudflare, AWS CloudFront, or Fastly). Use cache-control headers. For user-generated media, use pre-signed S3 URLs served via CloudFront."
    });
  }

  if (!desc.includes("circuit breaker") && !desc.includes("retry") && !desc.includes("timeout")) {
    issues.push({
      severity: "high",
      area: "Resiliency",
      title: "No Circuit Breaker / Retry Strategy",
      description: "Cascading failures are a real risk. If Service A calls Service B which calls Service C, one slow response propagates and crashes all three.",
      fix: "Implement the Circuit Breaker pattern (Resilience4j, Istio, or AWS App Mesh). Add timeouts on all outgoing calls. Use exponential backoff with jitter for retries."
    });
  }

  if (!desc.includes("monitoring") && !desc.includes("grafana") && !desc.includes("datadog") && !desc.includes("prometheus")) {
    issues.push({
      severity: "medium",
      area: "Observability",
      title: "No Observability Stack",
      description: "Without metrics, logs, and traces, you are flying blind. When production breaks, you have no way to find the root cause quickly.",
      fix: "Implement the three pillars of observability: Metrics (Prometheus + Grafana), Logs (ELK Stack or Loki), Traces (Jaeger or OpenTelemetry). Set up alerting for p99 latency and error rate SLAs."
    });
  }

  if (!desc.includes("auth") && !desc.includes("jwt") && !desc.includes("oauth")) {
    issues.push({
      severity: "critical",
      area: "Security",
      title: "No Auth Strategy Mentioned",
      description: "Authentication and authorization are not visible in your architecture description. This is a critical security gap.",
      fix: "Implement JWT-based authentication with access + refresh token rotation. Use an API Gateway or Auth Service to centralize auth. Consider OAuth2 / OIDC for third-party logins."
    });
  }

  if (pain.includes("slow") || pain.includes("latency")) {
    improvements.push({
      area: "Latency",
      title: "Reduce p99 Latency",
      steps: [
        "Profile DB queries — add missing indexes on foreign keys and filter columns",
        "Move cache hot paths to in-process memory (LRU cache) before Redis",
        "Reduce payload size — use field projection in DB queries, avoid SELECT *",
        "Enable HTTP/2 or gRPC for internal service-to-service calls",
        "Use connection pooling (PgBouncer, HikariCP) to reduce DB connection overhead"
      ]
    });
  }

  if (pain.includes("scale") || pain.includes("traffic") || pain.includes("users")) {
    improvements.push({
      area: "Scaling",
      title: "Horizontal Scaling Strategy",
      steps: [
        "Make all services stateless — move session state to Redis",
        "Implement database connection pooling to handle more concurrent connections",
        "Add read replicas and route read traffic using a proxy",
        "Shard the database by user_id or tenant_id for large datasets",
        "Set up auto-scaling groups (AWS ASG / K8s HPA) based on CPU/RPS thresholds"
      ]
    });
  }

  if (pain.includes("cost") || pain.includes("expensive") || pain.includes("bill")) {
    improvements.push({
      area: "Cost Optimization",
      title: "Reduce Infrastructure Cost",
      steps: [
        "Move infrequent workloads (reports, batch jobs) to Spot/Preemptible instances",
        "Use S3 Intelligent-Tiering for cold media storage",
        "Right-size over-provisioned EC2/GCE instances using CloudWatch/Cloud Monitoring",
        "Cache aggressively to reduce DB instance size and query count",
        "Move to serverless functions (AWS Lambda) for low-traffic endpoints"
      ]
    });
  }

  if (pain.includes("outage") || pain.includes("downtime") || pain.includes("fail")) {
    improvements.push({
      area: "High Availability",
      title: "Eliminate Single Points of Failure",
      steps: [
        "Ensure every tier (LB, service, DB) has at least 2 instances across 2 AZs",
        "Implement health checks and automatic instance replacement",
        "Set up a DB failover strategy (RDS Multi-AZ, Postgres Patroni)",
        "Use Route53 / Cloud DNS health checks for active-passive DNS failover",
        "Define and test your Recovery Time Objective (RTO) and Recovery Point Objective (RPO)"
      ]
    });
  }

  // Architecture improvements
  improvements.push({
    area: "Data Architecture",
    title: "Recommended Data Flow Improvements",
    steps: [
      "Introduce CQRS: separate Write Model (normalized, transactional) from Read Model (denormalized, fast)",
      "Index heavily-queried columns (created_at, user_id, status)",
      "Archive old records to cold storage periodically using a background job",
      "Use soft deletes (deleted_at flag) instead of hard deletes for auditability"
    ]
  });

  return { issues, improvements };
}

function generateImprovedArchitecture(input, analysis) {
  const nodes = [];
  const edges = [];

  const desc = (input.existingHLD || "").toLowerCase();
  const pain = (input.improvementsWanted || "").toLowerCase();
  const scale = input.currentScale || "medium";
  const stack = (input.techStack || "").toLowerCase();
  const combinedText = `${desc} ${pain} ${stack}`;

  // Helper to check if any keyword exists
  const has = (...words) => words.some(w => combinedText.includes(w));

  // 1. Edge Layer (Always present for scale, but tailored)
  nodes.push({ id: "client", label: "Client Applications", layer: "client" });
  nodes.push({ id: "dns_route53", label: has("aws") ? "Route 53 (DNS)" : "Cloud DNS", layer: "edge" });
  nodes.push({ id: "cdn_cloudfront", label: has("cloudflare") ? "Cloudflare CDN" : (has("aws") ? "CloudFront CDN" : "Global CDN"), layer: "edge" });
  nodes.push({ id: "waf_security_layer", label: "WAF & DDoS Protection", layer: "edge" });

  // 2. Gateway Layer
  const lbLabel = has("kubernetes", "k8s") ? "Ingress Controller" : "Application Load Balancer";
  nodes.push({ id: "load_balancer", label: lbLabel, layer: "traffic" });
  
  if (has("graphql")) {
    nodes.push({ id: "Apollo_Federation_Gateway", label: "GraphQL Federation Gateway", layer: "traffic" });
  } else if (has("grpc")) {
    nodes.push({ id: "gRPC_API_Gateway", label: "gRPC API Gateway", layer: "traffic" });
  } else {
    nodes.push({ id: "REST_API_Gateway", label: "API Gateway (Rate Limiter)", layer: "traffic" });
  }

  // 3. Core Services Layer (Dynamic)
  const computeLabel = has("kubernetes", "k8s") ? "(K8s Pods)" : (has("serverless", "lambda") ? "(Lambdas)" : "(Microservices)");
  
  nodes.push({ id: "auth_service", label: `Identity & Auth ${computeLabel}`, layer: "service" });
  nodes.push({ id: "core_service", label: `Core Business Service ${computeLabel}`, layer: "service" });

  // Feature-based services
  if (has("feed", "timeline")) {
    nodes.push({ id: "feed_service", label: "Feed Generation Service", layer: "service" });
  }
  if (has("chat", "message", "realtime", "websocket")) {
    nodes.push({ id: "chat_service", label: "Real-time Chat Service", layer: "service" });
  }
  if (has("notification", "push", "email")) {
    nodes.push({ id: "notification_service", label: "Notification Service", layer: "service" });
  }
  if (has("search", "elastic")) {
    nodes.push({ id: "search_service", label: "Search Engine (Elasticsearch)", layer: "service" });
  }
  if (has("payment", "billing", "stripe")) {
    nodes.push({ id: "payment_service", label: "Payment & Billing Service", layer: "service" });
  }
  if (has("video", "media", "transcode", "upload")) {
    nodes.push({ id: "media_service", label: "Media Processing Service", layer: "service" });
  }
  if (has("ai", "ml", "recommendation", "model")) {
    nodes.push({ id: "ai_service", label: "AI Inference & Recommendation", layer: "service" });
  }

  // 4. Data Layer (Tailored to stack)
  const isNoSQL = has("mongodb", "dynamodb", "cassandra", "nosql");
  const dbLabel = has("postgres") ? "PostgreSQL Cluster" : (has("mysql") ? "MySQL Cluster" : (isNoSQL ? "NoSQL Database" : "Primary Database"));
  
  nodes.push({ id: "SQL_DB", label: dbLabel, layer: "data" });
  
  // High scale requires replicas
  if (scale === "large" || scale === "medium" || has("scale", "replica", "read heavy")) {
    nodes.push({ id: "read_replica", label: `${dbLabel} (Read Replicas)`, layer: "data" });
  }
  
  nodes.push({ id: "cache", label: has("redis") ? "Redis ElastiCache" : "Distributed Cache", layer: "cache" });
  
  if (has("media", "upload", "s3", "file", "image", "video")) {
    nodes.push({ id: "blob_storage_s3", label: has("aws") ? "Amazon S3 Storage" : "Object Storage", layer: "data" });
  }

  // 5. Async / Event Layer
  const queueLabel = has("kafka") ? "Kafka Event Stream" : (has("rabbitmq") ? "RabbitMQ" : (has("sqs") ? "Amazon SQS" : "Message Queue"));
  nodes.push({ id: "message_queue", label: queueLabel, layer: "async" });
  nodes.push({ id: "worker_services", label: "Background Workers", layer: "async" });

  if (has("analytics", "data warehouse", "snowflake", "bigquery", "redshift")) {
    nodes.push({ id: "data_warehouse", label: "Data Warehouse", layer: "async" });
  }

  // ── Build Edges ──
  const gwId = has("graphql") ? "Apollo_Federation_Gateway" : (has("grpc") ? "gRPC_API_Gateway" : "REST_API_Gateway");

  edges.push(["client", "dns_route53"], ["dns_route53", "cdn_cloudfront"], ["cdn_cloudfront", "waf_security_layer"], ["waf_security_layer", "load_balancer"], ["load_balancer", gwId]);

  // Gateway -> Services
  edges.push([gwId, "auth_service"], [gwId, "core_service"]);
  
  const serviceIds = ["feed", "chat", "notification", "search", "payment", "media", "ai"].map(s => s + "_service").filter(id => nodes.find(n => n.id === id));
  serviceIds.forEach(id => edges.push([gwId, id]));

  // Services -> Data
  edges.push(["auth_service", "SQL_DB"], ["auth_service", "cache"]);
  edges.push(["core_service", "SQL_DB"], ["core_service", "cache"]);
  if (nodes.find(n => n.id === "read_replica")) {
    edges.push(["core_service", "read_replica"]);
  }

  // Specific service data bindings
  if (nodes.find(n => n.id === "search_service") && nodes.find(n => n.id === "read_replica")) {
    edges.push(["read_replica", "search_service"]); // CDC sync
  }
  if (nodes.find(n => n.id === "media_service")) {
    edges.push(["media_service", "blob_storage_s3"]);
  }
  if (nodes.find(n => n.id === "feed_service")) {
    edges.push(["feed_service", "cache"]);
    if (nodes.find(n => n.id === "read_replica")) edges.push(["feed_service", "read_replica"]);
  }

  // Async flows
  edges.push(["core_service", "message_queue"], ["message_queue", "worker_services"]);
  if (nodes.find(n => n.id === "notification_service")) {
    edges.push(["message_queue", "notification_service"]);
  }
  if (nodes.find(n => n.id === "media_service")) {
    edges.push(["media_service", "message_queue"]); // async transcode
  }
  if (nodes.find(n => n.id === "data_warehouse") && nodes.find(n => n.id === "read_replica")) {
    edges.push(["read_replica", "data_warehouse"]);
  }

  return { nodes, edges };
}

module.exports = { analyzeArchitecture, generateImprovedArchitecture };
