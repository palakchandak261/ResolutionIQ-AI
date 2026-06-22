const express = require("express");
const {
  overview,
  heatmap,
  wardAnalytics,
  departmentLoad,
  slaMonitor,
} = require("../controllers/analyticsController");
const { protect, authorize } = require("../middleware/auth");
const { ROLES } = require("../config/constants");

const router = express.Router();

router.use(protect, authorize(ROLES.OFFICER, ROLES.ADMIN));
router.get("/overview", overview);
router.get("/heatmap", heatmap);
router.get("/wards", wardAnalytics);
router.get("/department-load", departmentLoad);
router.get("/sla", slaMonitor);

module.exports = router;
