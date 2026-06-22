const express = require("express");
const {
  getDepartmentWorkload,
  listDepartments,
  createDepartment,
  updateDepartment,
} = require("../controllers/departmentController");

const router = express.Router();

// Stats — must be before /:id
router.get("/stats/workload", getDepartmentWorkload);

// CRUD
router.get("/", listDepartments);
router.post("/", createDepartment);
router.patch("/:id", updateDepartment);

module.exports = router;
