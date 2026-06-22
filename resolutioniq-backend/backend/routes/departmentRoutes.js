const express = require("express");
const {
  listDepartments,
  createDepartment,
  updateDepartment,
} = require("../controllers/departmentController");
const { protect, authorize } = require("../middleware/auth");
const { ROLES } = require("../config/constants");

const router = express.Router();

router.get("/", protect, listDepartments);
router.post("/", protect, authorize(ROLES.ADMIN), createDepartment);
router.put("/:id", protect, authorize(ROLES.ADMIN), updateDepartment);

module.exports = router;
