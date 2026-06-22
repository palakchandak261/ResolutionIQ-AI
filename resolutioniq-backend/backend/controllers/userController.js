const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const ApiError = require("../utils/apiError");

function formatUser(u) {
  const obj = u.toObject ? u.toObject() : u;
  return {
    id: obj._id.toString(),
    name: obj.name,
    email: obj.email,
    role: obj.role,
    department: obj.department || "",
    status: obj.status || "active",
    complaintsHandled: obj.complaintsHandled || 0,
    createdAt: obj.createdAt ? obj.createdAt.toISOString() : new Date().toISOString(),
  };
}

// @route GET /api/users
const listUsers = asyncHandler(async (_req, res) => {
  const users = await User.find({});
  res.json(users.map(formatUser));
});

// @route POST /api/users
const createUser = asyncHandler(async (req, res) => {
  const { name, email, role, department } = req.body;
  if (!name || !email || !role) throw new ApiError(400, "name, email and role are required");

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) throw new ApiError(409, "Email already registered");

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    role,
    department: department || "",
  });

  res.status(201).json(formatUser(user));
});

// @route PATCH /api/users/:id
const updateUser = asyncHandler(async (req, res) => {
  const { name, role, department, status } = req.body;
  const update = {};
  if (name) update.name = name;
  if (role) update.role = role;
  if (department !== undefined) update.department = department;
  if (status) update.status = status;

  const user = await User.findByIdAndUpdate(req.params.id, update, { new: true });
  if (!user) throw new ApiError(404, "User not found");
  res.json(formatUser(user));
});

// @route DELETE /api/users/:id
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw new ApiError(404, "User not found");
  res.sendStatus(204);
});

module.exports = { listUsers, createUser, updateUser, deleteUser };
