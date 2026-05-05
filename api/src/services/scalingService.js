// ===============================
// Scaling + Tradeoffs Engine
// ===============================

// Defines scaling strategy
function generateScaling(decisions, flags) {
  const scaling = [];

  // Horizontal scaling
  if (flags.isMediumScale || flags.isLargeScale) {
    scaling.push("horizontal_scaling");
  }

  // Auto scaling
  if (flags.isLargeScale) {
    scaling.push("auto_scaling");
  }

  // DB scaling
  if (decisions.dataLayer.includes("read_replica")) {
    scaling.push("read_replication");
  }

  if (decisions.dataLayer.includes("sharding")) {
    scaling.push("database_sharding");
  }

  // Cache scaling
  if (decisions.dataLayer.includes("cache")) {
    scaling.push("distributed_caching");
  }

  return scaling;
}


// Defines reliability strategies
function generateReliability(decisions, flags) {
  const reliability = [];

  // High availability
  if (flags.isHighlyAvailable) {
    reliability.push("multi_region_deployment");
    reliability.push("failover_strategy");
  }

  // Retry mechanisms
  if (decisions.asyncLayer.includes("message_queue")) {
    reliability.push("retry_mechanism");
    reliability.push("dead_letter_queue");
  }

  // Health checks
  reliability.push("health_checks");
  reliability.push("service_monitoring");

  return reliability;
}


// Defines tradeoffs
function generateTradeoffs(decisions, flags) {
  const tradeoffs = [];

  // DB tradeoff
  if (decisions.dataLayer.includes("NoSQL_DB")) {
    tradeoffs.push({
      decision: "NoSQL",
      advantage: "High scalability and flexibility",
      disadvantage: "Eventual consistency"
    });
  }

  if (decisions.dataLayer.includes("SQL_DB")) {
    tradeoffs.push({
      decision: "SQL",
      advantage: "Strong consistency",
      disadvantage: "Limited horizontal scalability"
    });
  }

  // Cache tradeoff
  if (decisions.dataLayer.includes("cache")) {
    tradeoffs.push({
      decision: "Caching",
      advantage: "Low latency and reduced DB load",
      disadvantage: "Cache invalidation complexity"
    });
  }

  // Microservices tradeoff
  if (decisions.infrastructure.includes("auto_scaling")) {
    tradeoffs.push({
      decision: "Microservices + Scaling",
      advantage: "Independent scaling and flexibility",
      disadvantage: "Operational complexity"
    });
  }

  return tradeoffs;
}


// MAIN FUNCTION
function generateSystemInsights(decisions, flags) {
  return {
    scaling: generateScaling(decisions, flags),
    reliability: generateReliability(decisions, flags),
    tradeoffs: generateTradeoffs(decisions, flags)
  };
}

module.exports = { generateSystemInsights };