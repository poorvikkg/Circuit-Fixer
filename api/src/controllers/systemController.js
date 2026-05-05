const { processInput } = require("../services/interpreterService");
const { buildDecision } = require("../engine/decisionEngine");
const { generateArchitecture } = require("../services/architectureService");
const { generatePipelines } = require("../services/pipelineService");
const { generateServiceExpansion } = require("../services/serviceExpansionService");
const { generateDataModels } = require("../services/dataModelService");
const { generateSystemInsights } = require("../services/scalingService");
const { generateIaC } = require("../services/iacService");
const { formatOutput } = require("../services/outputFormatter");

function generateSystem(req, res) {
  try {
    const result = processInput(req.body);

    if (!result.success) {
      return res.status(400).json({
        status: "error",
        errors: result.errors
      });
    }

    const decisions = buildDecision(result.flags);

    const architecture = generateArchitecture(decisions);
    const pipelines = generatePipelines(decisions);
    const serviceExpansion = generateServiceExpansion(decisions, result.flags);
    const dataModels = generateDataModels(decisions, result.flags);
    const insights = generateSystemInsights(decisions, result.flags);
    const iac = generateIaC(decisions);

    // FINAL STEP
    const explanation = formatOutput(
      req.body,
      decisions,
      pipelines,
      insights
    );

    return res.json({
      status: "success",
      raw: {
        decisions,
        architecture,
        pipelines,
        serviceExpansion,
        dataModels,
        insights,
        iac
      },
      explanation
    });

  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message
    });
  }
}

module.exports = { generateSystem };