const { processInput } = require("../services/interpreterService");
const { buildDecision } = require("../engine/decisionEngine");
const { generateArchitecture } = require("../services/architectureService");
const { generatePipelines } = require("../services/pipelineService");

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

    // NEW STEP
    const pipelines = generatePipelines(decisions);

    return res.json({
      status: "success",
      flags: result.flags,
      decisions,
      architecture,
      pipelines
    });

  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message
    });
  }
}

module.exports = { generateSystem };