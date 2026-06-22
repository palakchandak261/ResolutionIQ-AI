const express = require("express");
const { listRiskAlerts, createRiskAlert, updateRiskAlert } = require("../controllers/riskController");

const router = express.Router();

router.get("/alerts", listRiskAlerts);
router.post("/alerts", createRiskAlert);
router.patch("/alerts/:id", updateRiskAlert);

module.exports = router;
