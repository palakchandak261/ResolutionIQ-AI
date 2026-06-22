const asyncHandler = require("express-async-handler");
const Department = require("../models/Department");
const ApiError = require("../utils/apiError");

const listDepartments = asyncHandler(async (req, res) => {
  const departments = await Department.find({ isActive: true }).populate("headOfficer", "name email");
  res.json({ success: true, departments });
});

const createDepartment = asyncHandler(async (req, res) => {
  const { name, code, description, handledIssueTypes, contactEmail, contactPhone } = req.body;
  const exists = await Department.findOne({ $or: [{ name }, { code }] });
  if (exists) throw new ApiError(409, "Department with this name or code already exists");

  const department = await Department.create({
    name,
    code,
    description,
    handledIssueTypes,
    contactEmail,
    contactPhone,
  });
  res.status(201).json({ success: true, department });
});

const updateDepartment = asyncHandler(async (req, res) => {
  const department = await Department.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!department) throw new ApiError(404, "Department not found");
  res.json({ success: true, department });
});

module.exports = { listDepartments, createDepartment, updateDepartment };
