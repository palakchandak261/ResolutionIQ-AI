const asyncHandler = require("express-async-handler");
const RiskAlert = require("../models/RiskAlert");
const IssueCorrelation = require("../models/IssueCorrelation");

const listRiskAlerts = asyncHandler(async (req, res) => {
  const { status = "active" } = req.query;
  const alerts = await RiskAlert.find({ status }).sort({ riskScore: -1 }).populate("sourceCorrelation");
  res.json({ success: true, alerts });
});

const listCorrelations = asyncHandler(async (req, res) => {
  const correlations = await IssueCorrelation.find()
    .sort({ createdAt: -1 })
    .populate("relatedComplaints", "referenceId issueType status");
  res.json({ success: true, correlations });
});

const updateRiskAlertStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const alert = await RiskAlert.findByIdAndUpdate(req.params.id, { status }, { new: true });
  res.json({ success: true, alert });
});

module.exports = { listRiskAlerts, listCorrelations, updateRiskAlertStatus };
