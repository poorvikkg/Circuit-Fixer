// ===============================
// Pipeline & Internal Flow Engine
// ===============================

// Builds the global request pipeline (edge → service → data/async → response)
function buildRequestPipeline(decisions) {
  const pipeline = [
    "client_request",
    "dns_resolution",
    "cdn_check",
    "api_gateway",
    "auth_middleware",
    "rate_limiter",
    "load_balancer"
  ];

  // Route to services
  decisions.services.forEach((service) => {
    pipeline.push(`route_to_${service}`);
  });

  // Core processing stage
  pipeline.push("service_execution");

  // Data/cache interaction
  if (decisions.dataLayer.includes("cache")) {
    pipeline.push("cache_lookup");
  }
  pipeline.push("db_read_write");

  // Async triggers
  if (decisions.asyncLayer.includes("message_queue")) {
    pipeline.push("enqueue_async_tasks");
  }

  pipeline.push("response_build");
  pipeline.push("response_send");

  return pipeline;
}


// Builds internal pipeline for a given service
function buildServicePipeline(serviceName, decisions) {
  const stages = [
    "inbound_filter",
    "validation",
    "routing",
    "controller",
    "service_logic"
  ];

  // Data interactions
  if (decisions.dataLayer.includes("cache")) {
    stages.push("cache_interaction");
  }

  stages.push("repository_db_interaction");

  // Async interactions
  if (decisions.asyncLayer.includes("message_queue")) {
    stages.push("queue_producer");
  }

  stages.push("outbound_filter");

  return {
    service: serviceName,
    stages
  };
}


// Builds pipelines for all services
function buildAllServicePipelines(decisions) {
  return decisions.services.map((service) =>
    buildServicePipeline(service, decisions)
  );
}


// MAIN function — returns all pipeline data
function generatePipelines(decisions) {
  return {
    requestPipeline: buildRequestPipeline(decisions),
    servicePipelines: buildAllServicePipelines(decisions)
  };
}

module.exports = { generatePipelines };