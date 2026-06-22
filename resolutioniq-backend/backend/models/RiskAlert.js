const mongoose = require("mongoose");

const riskAlertSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    riskType: { type: String, default: "Infrastructure" },
    location: { type: String, default: "" },
    ward: { type: String, default: "" },
    severity: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium",
    },
    status: { type: String, enum: ["Active", "Acknowledged", "Resolved"], default: "Active" },
    confidence: { type: Number, min: 0, max: 1, default: 0.8 },
    relatedComplaintIds: [{ type: Number }],
    resolvedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("RiskAlert", riskAlertSchema);
