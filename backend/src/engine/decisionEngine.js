// ===============================
// Decision Engine for Fixy
// ===============================

// Decides infrastructure components like CDN, LB, scaling
function decideInfrastructure(flags) {
  const infra = [];

  infra.push("api_gateway");

  if (flags.isGlobal || flags.needsMedia) {
    infra.push("cdn");
  }

  if (flags.isMediumScale || flags.isLargeScale) {
    infra.push("load_balancer");
  }

  if (flags.isLargeScale) {
    infra.push("auto_scaling");
  }

  return infra;
}


// Decides which services are required
function decideServices(flags) {
  const services = [];

  services.push("auth_service", "user_service");

  if (flags.needsFeed) services.push("feed_service");
  if (flags.needsChat) services.push("chat_service");
  if (flags.needsMedia) services.push("media_service");
  if (flags.needsNotifications) services.push("notification_service");

  return services;
}


// Decides database, caching, and scaling strategy
function decideDataLayer(flags) {
  const data = [];

  if (flags.isSocialApp || flags.needsChat) {
    data.push("NoSQL_DB");
  } else {
    data.push("SQL_DB");
  }

  if (flags.isReadHeavy) {
    data.push("cache");
  }

  if (flags.isMediumScale || flags.isLargeScale) {
    data.push("read_replica");
  }

  if (flags.isLargeScale) {
    data.push("sharding");
  }

  return data;
}


// Decides async processing like queues and workers
function decideAsyncLayer(flags) {
  const asyncLayer = [];

  if (flags.isLargeScale || flags.needsChat || flags.needsMedia) {
    asyncLayer.push("message_queue", "worker_services");
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