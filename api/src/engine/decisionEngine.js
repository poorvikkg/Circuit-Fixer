// ===============================
// Decision Engine for Fixy
// ===============================

// Decides infrastructure components like CDN, LB, scaling
function decideInfrastructure(flags) {
  const infra = [];

  // Granular DNS & Edge
  infra.push("dns_route53");
  
  if (flags.requiresCompliance) {
    infra.push("waf_security_layer");
  }

  if (flags.isGlobal || flags.needsMedia || flags.requiresLowLatency) {
    infra.push("cdn_cloudfront");
    if (flags.requiresLowLatency) infra.push("edge_compute");
  }

  // API Gateway & IdP
  infra.push("identity_provider");
  
  if (flags.useGrpc) {
    infra.push("gRPC_API_Gateway");
  } else if (flags.useGraphql) {
    infra.push("Apollo_Federation_Gateway");
  } else {
    infra.push("REST_API_Gateway");
  }

  // Traffic Management
  infra.push("rate_limiter_redis");

  if (flags.needsCircuitBreaker || flags.isMediumScale || flags.isLargeScale) {
    infra.push("Service_Mesh_Istio");
  } else if (flags.isMediumScale || flags.isLargeScale) {
    infra.push("load_balancer");
  }

  if (flags.isLargeScale) {
    infra.push("auto_scaling");
    infra.push("service_discovery_consul");
  }

  return infra;
}


// Decides which services are required
function decideServices(flags) {
  const services = [];

  services.push("auth_service", "user_service");

  if (flags.requiresCompliance) services.push("audit_logging_service");
  
  // Advanced Observability Sidecars/Agents
  if (flags.needsDistributedTracing || flags.isLargeScale) {
    services.push("OpenTelemetry_Collector");
    services.push("distributed_tracing_jaeger");
    services.push("metrics_prometheus");
  }
  
  services.push("log_aggregator_elk");

  if (flags.needsChaosEngineering) services.push("Chaos_Mesh_Agent");
  
  if (flags.needsFeed) services.push("feed_service");
  if (flags.needsChat) services.push("chat_service");
  if (flags.needsMedia) services.push("media_service");
  if (flags.needsNotifications) services.push("notification_service");

  // Configuration Management
  if (flags.isLargeScale) {
    services.push("centralized_config_server");
  }

  return services;
}


// Decides database, caching, and scaling strategy
function decideDataLayer(flags) {
  const data = [];

  if (flags.isCqrs) {
    data.push("Write_Model_DB");
    data.push("Read_Model_DB");
  } else if (flags.isStrongConsistency) {
    data.push(flags.isGlobal ? "NewSQL_Distributed_DB" : "SQL_DB_Strict");
  } else if (flags.isSocialApp || flags.needsChat) {
    data.push("NoSQL_DB");
  } else {
    data.push("SQL_DB");
  }

  if (flags.isActiveActive) {
    data.push("Cross_Region_Active_Replication");
  }

  if (flags.isReadHeavy || flags.requiresLowLatency) {
    data.push(flags.requiresLowLatency ? "Redis_Cluster_Ultra_Fast" : "cache");
  }

  if (flags.isMediumScale || flags.isLargeScale) {
    if (!flags.isStrongConsistency) data.push("read_replica");
  }

  if (flags.isLargeScale && !flags.isStrongConsistency) {
    data.push("sharding");
  }
  
  if (flags.requiresCompliance) {
    data.push("KMS_Encryption_Service");
  }
  
  if (flags.needsMedia) {
    data.push("blob_storage_s3");
  }

  return data;
}


// Decides async processing like queues and workers
function decideAsyncLayer(flags) {
  const asyncLayer = [];

  if (flags.isEventSourced) {
    asyncLayer.push("Event_Store_Kafka");
  } else if (flags.isLargeScale || flags.needsChat || flags.needsMedia) {
    asyncLayer.push("message_queue");
  }
  
  if (flags.isLargeScale || flags.needsChat || flags.needsMedia) {
    asyncLayer.push("worker_services");
  }

  if (flags.isLargeScale && flags.needsFeed) {
    asyncLayer.push("event_streaming");
  }

  return asyncLayer;
}


// Combines all decisions into one structure
function buildDecision(flags) {
  return {
    infrastructure: decideInfrastructure(flags),
    services: decideServices(flags),
    dataLayer: decideDataLayer(flags),
    asyncLayer: decideAsyncLayer(flags)
  };
}

module.exports = { buildDecision };