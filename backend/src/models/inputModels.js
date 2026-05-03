class InputModel {
  constructor(data) {
    this.appType = data.appType || "";
    this.users = data.users || 0;
    this.features = data.features || [];
    this.realTime = data.realTime || false;
    this.readWriteRatio = data.readWriteRatio || "balanced";
    this.region = data.region || "local";
    this.availability = data.availability || "medium";
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