class InputModel {
  constructor(data) {
    this.appType = data.appType || "";
    this.users = data.users || 0;
    this.features = data.features || [];
    this.realTime = data.realTime || false;
    this.readWriteRatio = data.readWriteRatio || "balanced";
    this.region = data.region || "local";
    this.availability = data.availability || "medium";
    
    // Advanced fields
    this.cloudProvider = data.cloudProvider || "aws";
    this.compliance = data.compliance || "none";
    this.consistency = data.consistency || "eventual";
    this.latency = data.latency || "standard";
    this.budget = data.budget || "medium";

    // Staff/Principal Engineer (FAANG) fields
    this.drStrategy = data.drStrategy || "single-region";
    this.observability = data.observability || "basic";
    this.resiliency = data.resiliency || "standard";
    this.apiProtocol = data.apiProtocol || "rest";
    this.dataArchitecture = data.dataArchitecture || "crud";
  }

  validate() {
    const errors = [];

    if (!this.appType) errors.push("appType is required");

    if (typeof this.users !== "number" || this.users <= 0) {
      errors.push("users must be a positive number");
    }

    if (!Array.isArray(this.features)) {
      errors.push("features must be an array");
    }

    return errors;
  }
}

module.exports = InputModel;