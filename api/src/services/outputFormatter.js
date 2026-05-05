// ===============================
// Output Formatter (Senior-Level Explanation)
// ===============================

// Builds system overview
function buildOverview(input, decisions) {
  return `
System Type: ${input.appType}
Users: ${input.users}
Features: ${input.features.join(", ")}

The system uses a scalable architecture with ${
    decisions.infrastructure.includes("load_balancer")
      ? "load balancing"
      : "direct routing"
  } and ${
    decisions.dataLayer.includes("cache")
      ? "caching"
      : "no caching"
  } to ensure performance.
`;
}


// Builds architecture explanation
function buildArchitectureExplanation(decisions) {
  return `
Infrastructure Layer:
- ${decisions.infrastructure.join("\n- ")}

Service Layer:
- ${decisions.services.join("\n- ")}

Data Layer:
- ${decisions.dataLayer.join("\n- ")}

Async Layer:
- ${decisions.asyncLayer.join("\n- ")}
`;
}


// Builds pipeline explanation
function buildPipelineExplanation(pipelines) {
  return `
Request Flow:
${pipelines.requestPipeline.join(" → ")}

Each service follows:
${pipelines.servicePipelines[0]?.stages.join(" → ") || ""}
`;
}


// Builds scaling explanation
function buildScalingExplanation(insights) {
  return `
Scaling Strategy:
- ${insights.scaling.join("\n- ")}

Reliability:
- ${insights.reliability.join("\n- ")}
`;
}


// Builds tradeoff explanation
function buildTradeoffExplanation(insights) {
  return insights.tradeoffs
    .map(
      (tradeoff) =>
        `Decision: ${tradeoff.decision}\nAdvantage: ${tradeoff.advantage}\nDisadvantage: ${tradeoff.disadvantage}\n`
    )
    .join("\n");
}


// MAIN FUNCTION
function formatOutput(input, decisions, pipelines, insights) {
  return {
    overview: buildOverview(input, decisions),
    architecture: buildArchitectureExplanation(decisions),
    pipeline: buildPipelineExplanation(pipelines),
    scaling: buildScalingExplanation(insights),
    tradeoffs: buildTradeoffExplanation(insights)
  };
}

module.exports = { formatOutput };