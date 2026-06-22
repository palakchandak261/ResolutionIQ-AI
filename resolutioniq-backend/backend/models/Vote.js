const mongoose = require("mongoose");

const voteSchema = new mongoose.Schema(
  {
    complaint: { type: mongoose.Schema.Types.ObjectId, ref: "Complaint", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// One vote per user per complaint
voteSchema.index({ complaint: 1, user: 1 }, { unique: true });

module.exports = mongoose.model("Vote", voteSchema);
