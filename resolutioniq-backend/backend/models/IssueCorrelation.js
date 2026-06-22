const mongoose = require("mongoose");

// Stores root-cause correlation findings, e.g. potholes + low water pressure
// complaints clustered near each other suggesting a pipe leak.
const issueCorrelationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    relatedComplaints: [{ type: mongoose.Schema.Types.ObjectId, ref: "Complaint" }],
    centroid: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number] },
    },
    radiusMeters: { type: Number },
    issueTypesInvolved: [{ type: String }],
    confidence: { type: Number, min: 0, max: 1 },
    status: {
      type: String,
      enum: ["open", "investigating", "resolved", "dismissed"],
      default: "open",
    },
  },
  { timestamps: true }
);

issueCorrelationSchema.index({ centroid: "2dsphere" });

module.exports = mongoose.model("IssueCorrelation", issueCorrelationSchema);
