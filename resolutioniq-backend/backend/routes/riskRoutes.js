const express = require("express");
const { listRiskAlerts, listCorrelations, updateRiskAlertStatus } = require("../controllers/riskController");
const { protect, authorize } = require("../middleware/auth");
const { ROLES } = require("../config/constants");

const router = express.Router();

router.use(protect, authorize(ROLES.OFFICER, ROLES.ADMIN));
router.get("/alerts", listRiskAlerts);
router.get("/correlations", listCorrelations);
router.patch("/alerts/:id/status", updateRiskAlertStatus);

module.exports = router;
