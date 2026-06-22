const asyncHandler = require("express-async-handler");
const RiskAlert = require("../models/RiskAlert");
const ApiError = require("../utils/apiError");

function formatAlert(a) {
  const obj = a.toObject ? a.toObject() : a;
  return {
    id: obj._id.toString(),
    title: obj.title,
    description: obj.description || "",
    riskType: obj.riskType || "Infrastructure",
    location: obj.location || "",
    ward: obj.ward || "",
    severity: obj.severity || "Medium",
    status: obj.status || "Active",
    confidence: obj.confidence || 0.8,
    relatedComplaintIds: obj.relatedComplaintIds || [],
    createdAt: obj.createdAt ? obj.createdAt.toISOString() : new Date().toISOString(),
    resolvedAt: obj.resolvedAt ? obj.resolvedAt.toISOString() : null,
  };
}

// @route GET /api/risk/alerts
const listRiskAlerts = asyncHandler(async (_req, res) => {
  const alerts = await RiskAlert.find({}).sort({ createdAt: -1 });
  res.json(alerts.map(formatAlert));
});

// @route POST /api/risk/alerts
const createRiskAlert = asyncHandler(async (req, res) => {
  const { title, description, riskType, location, ward, severity, confidence, relatedComplaintIds } =
    req.body;
  if (!title) throw new ApiError(400, "title is required");

  const alert = await RiskAlert.create({
    title,
    description: description || "",
    riskType: riskType || "Infrastructure",
    location: location || "",
    ward: ward || "",
    severity: severity || "Medium",
    confidence: confidence || 0.8,
    relatedComplaintIds: relatedComplaintIds || [],
  });

  res.status(201).json(formatAlert(alert));
});

// @route PATCH /api/risk/alerts/:id
const updateRiskAlert = asyncHandler(async (req, res) => {
  const { status, notes } = req.body;
  const update = {};
  if (status) update.status = status;
  if (status === "Resolved") update.resolvedAt = new Date();

  const alert = await RiskAlert.findByIdAndUpdate(req.params.id, update, { new: true });
  if (!alert) throw new ApiError(404, "Risk alert not found");
  res.json(formatAlert(alert));
});

module.exports = { listRiskAlerts, createRiskAlert, updateRiskAlert };
