const { analyzeArchitecture, generateImprovedArchitecture } = require("../engine/improveEngine");
const { processInput } = require("../services/interpreterService");
const { buildDecision } = require("../engine/decisionEngine");
const { generatePipelines } = require("../services/pipelineService");
const { generateServiceExpansion } = require("../services/serviceExpansionService");
const { generateDataModels } = require("../services/dataModelService");
const { generateSystemInsights } = require("../services/scalingService");

function improveSystem(req, res) {
  try {
    const input = req.body;

    if (!input.existingHLD || input.existingHLD.trim().length < 10) {
      return res.status(400).json({
        status: "error",
        message: "Please provide a more detailed description of your existing HLD."
      });
    }

    const analysis = analyzeArchitecture(input);
    const improvedGraph = generateImprovedArchitecture(input, analysis);

    // Map scale to users
    let users = 500000;
    if (input.currentScale === "startup") users = 5000;
    if (input.currentScale === "small") users = 50000;
    if (input.currentScale === "medium") users = 500000;
    if (input.currentScale === "large") users = 5000000;

    // Build mock body for full system generation
    const mockBody = {
      appType: "custom",
      users,
      features: input.features || ["auth", "core"],
      readWriteRatio: "balanced",
      region: "global",
      realTime: (input.improvementsWanted || "").toLowerCase().includes("real-time"),
      cloudProvider: "aws",
      compliance: "none",
      consistency: "eventual",
      latency: "standard",
      budget: "medium",
      drStrategy: "active-passive",
      observability: "distributed",
      resiliency: "circuit-breaker",
      apiProtocol: "rest",
      dataArchitecture: "cqrs"
    };

    const processResult = processInput(mockBody);
    let raw = {};

    if (processResult.success) {
      const decisions = buildDecision(processResult.flags);
      raw = {
        decisions,
        architecture: improvedGraph,
        pipelines: generatePipelines(decisions),
        serviceExpansion: generateServiceExpansion(decisions, processResult.flags),
        dataModels: generateDataModels(decisions, processResult.flags),
        insights: generateSystemInsights(decisions, processResult.flags)
      };
    }

    return res.json({
      status: "success",
      analysis,
      improvedGraph,
      raw
    });

  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
}

module.exports = { improveSystem };
