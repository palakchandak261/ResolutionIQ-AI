const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    code: { type: String, required: true, unique: true, trim: true }, // e.g. PWD, SAN
    description: { type: String, trim: true },
    handledIssueTypes: [{ type: String }],
    headOfficer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    contactEmail: { type: String, trim: true },
    contactPhone: { type: String, trim: true },
    activeComplaintsCount: { type: Number, default: 0 }, // denormalized load counter
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Department", departmentSchema);
