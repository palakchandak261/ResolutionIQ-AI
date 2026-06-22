const express = require("express");
const {
  listUsers,
  createStaffUser,
  updateUserStatus,
  listAuditLogs,
} = require("../controllers/adminController");
const { protect, authorize } = require("../middleware/auth");
const { ROLES } = require("../config/constants");

const router = express.Router();

router.use(protect, authorize(ROLES.ADMIN));
router.get("/users", listUsers);
router.post("/users", createStaffUser);
router.patch("/users/:id/status", updateUserStatus);
router.get("/audit-logs", listAuditLogs);

module.exports = router;
