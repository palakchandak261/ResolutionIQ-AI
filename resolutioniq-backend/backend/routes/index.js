const express = require("express");
const complaintRoutes = require("./complaintRoutes");
const departmentRoutes = require("./departmentRoutes");
const analyticsRoutes = require("./analyticsRoutes");
const riskRoutes = require("./riskRoutes");
const userRoutes = require("./userRoutes");
const aiRoutes = require("./aiRoutes");

const router = express.Router();

router.get("/health", (_req, res) =>
  res.json({ success: true, status: "ok", timestamp: new Date() })
);

router.use("/complaints", complaintRoutes);
router.use("/departments", departmentRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/risk", riskRoutes);
router.use("/users", userRoutes);
router.use("/ai", aiRoutes);

module.exports = router;
