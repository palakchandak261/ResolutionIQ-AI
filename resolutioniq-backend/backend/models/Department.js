const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    code: { type: String, required: true, unique: true, trim: true },
    description: { type: String, trim: true },
    head: { type: String, trim: true, default: "" },
    handledIssueTypes: [{ type: String }],
    contactEmail: { type: String, trim: true, default: "" },
    contactPhone: { type: String, trim: true },
    slaHours: { type: Number, default: 72 },
    activeComplaints: { type: Number, default: 0 },
    totalResolved: { type: Number, default: 0 },
    avgResolutionHours: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Department", departmentSchema);
