const express = require("express");
const authRoutes = require("./authRoutes");
const complaintRoutes = require("./complaintRoutes");
const departmentRoutes = require("./departmentRoutes");
const notificationRoutes = require("./notificationRoutes");
const analyticsRoutes = require("./analyticsRoutes");
const adminRoutes = require("./adminRoutes");
const riskRoutes = require("./riskRoutes");

const router = express.Router();

router.get("/health", (req, res) => res.json({ success: true, status: "ok", timestamp: new Date() }));

router.use("/auth", authRoutes);
router.use("/complaints", complaintRoutes);
router.use("/departments", departmentRoutes);
router.use("/notifications", notificationRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/admin", adminRoutes);
router.use("/risk", riskRoutes);

module.exports = router;
