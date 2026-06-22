const mongoose = require("mongoose");

// Daily rollup snapshot, computed by a scheduled job, backs dashboard charts
// without recomputing aggregates on every request.
const analyticsSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    scope: { type: String, enum: ["global", "department", "ward"], default: "global" },
    scopeRef: { type: String }, // department id or ward name, if scope != global
    totalComplaints: { type: Number, default: 0 },
    resolvedComplaints: { type: Number, default: 0 },
    avgResolutionHours: { type: Number, default: 0 },
    slaBreaches: { type: Number, default: 0 },
    byIssueType: { type: mongoose.Schema.Types.Mixed, default: {} },
    bySeverity: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

analyticsSchema.index({ date: 1, scope: 1, scopeRef: 1 }, { unique: true });

module.exports = mongoose.model("Analytics", analyticsSchema);
