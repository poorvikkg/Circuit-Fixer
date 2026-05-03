const { processInput } = require("../services/interpreterService");

function generateSystem(req, res) {
  const result = processInput(req.body);

  if (!result.success) {
    return res.status(400).json({
      status: "error",
      errors: result.errors
    });
  }

  return res.json({
    status: "success",
    interpretedFlags: result.flags
  });
}

module.exports = { generateSystem };