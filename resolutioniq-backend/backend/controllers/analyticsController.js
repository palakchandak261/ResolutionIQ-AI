const asyncHandler = require("express-async-handler");
const Complaint = require("../models/Complaint");
const Department = require("../models/Department");

// @route GET /api/analytics/overview
const overview = asyncHandler(async (req, res) => {
  const [total, resolved, byStatus, bySeverity, byIssueType] = await Promise.all([
    Complaint.countDocuments(),
    Complaint.countDocuments({ status: "resolved" }),
    Complaint.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    Complaint.aggregate([{ $group: { _id: "$severity", count: { $sum: 1 } } }]),
    Complaint.aggregate([{ $group: { _id: "$issueType", count: { $sum: 1 } } }]),
  ]);

  res.json({
    success: true,
    totalComplaints: total,
    resolvedComplaints: resolved,
    resolutionRate: total ? Number(((resolved / total) * 100).toFixed(1)) : 0,
    byStatus,
    bySeverity,
    byIssueType,
  });
});

// @route GET /api/analytics/heatmap
// Returns complaint coordinates + weight for Google Maps heatmap layer
const heatmap = asyncHandler(async (req, res) => {
  const { issueType, status } = req.query;
  const query = {};
  if (issueType) query.issueType = issueType;
  if (status) query.status = status;

  const points = await Complaint.find(query).select("location issueType severity status ward");
  const weighted = points.map((p) => ({
    lat: p.location.coordinates[1],
    lng: p.location.coordinates[0],
    weight: { low: 1, medium: 2, high: 3, critical: 4 }[p.severity] || 1,
    issueType: p.issueType,
    status: p.status,
  }));

  res.json({ success: true, points: weighted });
});

// @route GET /api/analytics/wards
const wardAnalytics = asyncHandler(async (req, res) => {
  const result = await Complaint.aggregate([
    {
      $group: {
        _id: "$ward",
        total: { $sum: 1 },
        resolved: { $sum: { $cond: [{ $eq: ["$status", "resolved"] }, 1, 0] } },
        avgSeverityScore: {
          $avg: {
            $switch: {
              branches: [
                { case: { $eq: ["$severity", "low"] }, then: 1 },
                { case: { $eq: ["$severity", "medium"] }, then: 2 },
                { case: { $eq: ["$severity", "high"] }, then: 3 },
                { case: { $eq: ["$severity", "critical"] }, then: 4 },
              ],
              default: 2,
            },
          },
        },
      },
    },
    { $sort: { total: -1 } },
  ]);

  res.json({ success: true, wards: result });
});

// @route GET /api/analytics/department-load
const departmentLoad = asyncHandler(async (req, res) => {
  const departments = await Department.find().select("name code activeComplaintsCount");
  res.json({ success: true, departments });
});

// @route GET /api/analytics/sla
// SLA monitoring: complaints that are overdue or close to breaching
const slaMonitor = asyncHandler(async (req, res) => {
  const now = new Date();
  const soon = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const [breached, atRisk] = await Promise.all([
    Complaint.find({ status: { $nin: ["resolved", "rejected"] }, slaDeadline: { $lt: now } })
      .select("referenceId slaDeadline severity department status")
      .populate("department", "name"),
    Complaint.find({
      status: { $nin: ["resolved", "rejected"] },
      slaDeadline: { $gte: now, $lte: soon },
    })
      .select("referenceId slaDeadline severity department status")
      .populate("department", "name"),
  ]);

  res.json({ success: true, breached, atRisk });
});

module.exports = { overview, heatmap, wardAnalytics, departmentLoad, slaMonitor };
