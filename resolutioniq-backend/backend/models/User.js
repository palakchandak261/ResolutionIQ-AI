const mongoose = require("mongoose");

const ROLES = ["citizen", "officer", "admin"];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    role: { type: String, enum: ROLES, default: "citizen" },
    department: { type: String, default: "" },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    complaintsHandled: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
