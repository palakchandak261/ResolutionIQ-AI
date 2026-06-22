const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const AuditLog = require("../models/AuditLog");
const ApiError = require("../utils/apiError");
const { ROLES } = require("../config/constants");

const listUsers = asyncHandler(async (req, res) => {
  const { role, q, page = 1, limit = 20 } = req.query;
  const query = {};
  if (role) query.role = role;
  if (q) query.$or = [{ name: new RegExp(q, "i") }, { email: new RegExp(q, "i") }];

  const skip = (Number(page) - 1) * Number(limit);
  const [users, total] = await Promise.all([
    User.find(query).skip(skip).limit(Number(limit)).sort({ createdAt: -1 }),
    User.countDocuments(query),
  ]);
  res.json({ success: true, users, total, page: Number(page), pages: Math.ceil(total / limit) });
});

// Creates officer/admin accounts (only admins can do this)
const createStaffUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, department, phone } = req.body;
  if (!Object.values(ROLES).includes(role)) throw new ApiError(400, "Invalid role");

  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) throw new ApiError(409, "Email already registered");

  const user = await User.create({ name, email, password, role, department, phone });

  await AuditLog.create({
    actor: req.user._id,
    action: "user.create_staff",
    targetType: "User",
    targetId: user._id,
    metadata: { role },
    ipAddress: req.ip,
  });

  res.status(201).json({ success: true, user: user.toSafeObject() });
});

const updateUserStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body;
  const user = await User.findByIdAndUpdate(req.params.id, { isActive }, { new: true });
  if (!user) throw new ApiError(404, "User not found");

  await AuditLog.create({
    actor: req.user._id,
    action: "user.set_active_status",
    targetType: "User",
    targetId: user._id,
    metadata: { isActive },
    ipAddress: req.ip,
  });

  res.json({ success: true, user: user.toSafeObject() });
});

const listAuditLogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);
  const [logs, total] = await Promise.all([
    AuditLog.find().sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).populate("actor", "name email"),
    AuditLog.countDocuments(),
  ]);
  res.json({ success: true, logs, total, page: Number(page), pages: Math.ceil(total / limit) });
});

module.exports = { listUsers, createStaffUser, updateUserStatus, listAuditLogs };
