const asyncHandler = require("express-async-handler");
const Department = require("../models/Department");
const Complaint = require("../models/Complaint");
const ApiError = require("../utils/apiError");

function formatDept(d) {
  const obj = d.toObject ? d.toObject() : d;
  return {
    id: obj._id.toString(),
    name: obj.name,
    code: obj.code,
    head: obj.head || "",
    email: obj.contactEmail || obj.email || "",
    slaHours: obj.slaHours || 72,
    activeComplaints: obj.activeComplaints || 0,
    totalResolved: obj.totalResolved || 0,
    avgResolutionHours: obj.avgResolutionHours || 0,
  };
}

// @route GET /api/departments/stats/workload
const getDepartmentWorkload = asyncHandler(async (_req, res) => {
  const [depts, complaints] = await Promise.all([
    Department.find({}),
    Complaint.find({}),
  ]);

  const workload = depts.map(d => {
    const dc = complaints.filter(c => c.department === d.name);
    const resolved = dc.filter(c => c.status === "Resolved").length;
    const pending = dc.filter(c => c.status === "Pending").length;
    const active = dc.filter(c => c.status !== "Resolved").length;
    const breached = dc.filter(c => {
      if (c.status === "Resolved") return false;
      const hours = (Date.now() - new Date(c.createdAt).getTime()) / (1000 * 60 * 60);
      return hours > (d.slaHours || 72);
    }).length;
    return {
      departmentName: d.name,
      activeComplaints: active,
      resolved,
      pending,
      breachedSla: breached,
    };
  });

  res.json(workload);
});

// @route GET /api/departments
const listDepartments = asyncHandler(async (_req, res) => {
  const departments = await Department.find({ isActive: true });
  res.json(departments.map(formatDept));
});

// @route POST /api/departments
const createDepartment = asyncHandler(async (req, res) => {
  const { name, code, head, email, slaHours } = req.body;
  if (!name || !code) throw new ApiError(400, "name and code are required");

  const exists = await Department.findOne({ $or: [{ name }, { code }] });
  if (exists) throw new ApiError(409, "Department with this name or code already exists");

  const dept = await Department.create({
    name,
    code,
    head: head || "",
    contactEmail: email || "",
    slaHours: slaHours || 72,
  });

  res.status(201).json(formatDept(dept));
});

// @route PATCH /api/departments/:id
const updateDepartment = asyncHandler(async (req, res) => {
  const { name, head, email, slaHours } = req.body;
  const update = {};
  if (name) update.name = name;
  if (head !== undefined) update.head = head;
  if (email !== undefined) update.contactEmail = email;
  if (slaHours !== undefined) update.slaHours = slaHours;

  const dept = await Department.findByIdAndUpdate(req.params.id, update, { new: true });
  if (!dept) throw new ApiError(404, "Department not found");
  res.json(formatDept(dept));
});

module.exports = { getDepartmentWorkload, listDepartments, createDepartment, updateDepartment };
