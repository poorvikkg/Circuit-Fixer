const InputModel = require("../models/inputModel");
const { interpret } = require("../engine/interpreter");

function processInput(data) {
  // Normalize input
  const input = new InputModel(data);

  //  Validate
  const errors = input.validate();
  if (errors.length > 0) {
    return {
      success: false,
      errors
    };
  }

  // Interpret into flags
  const flags = interpret(input);

  return {
    success: true,
    input,
    flags
  };
}

module.exports = { processInput };