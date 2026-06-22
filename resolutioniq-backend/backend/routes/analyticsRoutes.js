const express = require("express");
const {
  overview,
  categoryBreakdown,
  severityBreakdown,
  wardHeatmap,
  resolutionTrends,
  slaBreachRisk,
  departmentWorkload,
  exportComplaintsCSV,
} = require("../controllers/analyticsController");

const router = express.Router();

router.get("/overview", overview);
router.get("/category-breakdown", categoryBreakdown);
router.get("/severity-breakdown", severityBreakdown);
router.get("/ward-heatmap", wardHeatmap);
router.get("/resolution-trends", resolutionTrends);
router.get("/sla-breach-risk", slaBreachRisk);
router.get("/department-workload", departmentWorkload);
router.get("/export", exportComplaintsCSV);

module.exports = router;
