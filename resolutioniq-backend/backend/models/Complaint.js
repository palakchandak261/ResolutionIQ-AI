const mongoose = require("mongoose");

const timelineEventSchema = new mongoose.Schema(
  {
    eventType: { type: String, default: "status_changed" },
    description: { type: String },
    actor: { type: String, default: "System" },
    at: { type: Date, default: Date.now },
  },
  { _id: true }
);

const complaintSchema = new mongoose.Schema(
  {
    // Frontend-facing flat fields
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true, default: "Other" },
    department: { type: String, default: "General Administration" },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Resolved", "Escalated", "Rejected"],
      default: "Pending",
    },
    severity: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium",
    },
    priority: { type: String, default: "Normal" },
    ward: { type: String, default: "" },
    location: { type: String, default: "" },
    citizenName: { type: String, default: "Anonymous" },
    citizenEmail: { type: String, default: "" },
    assignedTo: { type: String, default: null },
    imageUrl: { type: String, default: null },
    votes: { type: Number, default: 0 },
    aiConfidence: { type: Number, default: 0.9 },
    aiSummary: { type: String, default: "" },
    isDuplicate: { type: Boolean, default: false },
    duplicateOf: { type: Number, default: null },
    estimatedResolutionDays: { type: Number, default: 7 },
    resolvedAt: { type: Date, default: null },

    // Timeline
    timeline: [timelineEventSchema],
  },
  { timestamps: true }
);

complaintSchema.index({ status: 1 });
complaintSchema.index({ category: 1 });
complaintSchema.index({ severity: 1 });
complaintSchema.index({ department: 1 });
complaintSchema.index({ ward: 1 });
complaintSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Complaint", complaintSchema);
