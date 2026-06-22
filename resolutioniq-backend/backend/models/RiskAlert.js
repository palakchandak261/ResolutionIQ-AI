const mongoose = require("mongoose");

// Predicted/forecasted risk zones for the heatmap analytics module.
const riskAlertSchema = new mongoose.Schema(
  {
    ward: { type: String },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number] },
    },
    riskType: { type: String }, // e.g. "infrastructure_failure", "flooding"
    riskScore: { type: Number, min: 0, max: 1 },
    basis: { type: String }, // human readable explanation
    sourceCorrelation: { type: mongoose.Schema.Types.ObjectId, ref: "IssueCorrelation" },
    status: { type: String, enum: ["active", "acknowledged", "resolved"], default: "active" },
  },
  { timestamps: true }
);

riskAlertSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("RiskAlert", riskAlertSchema);
