const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const ApiError = require("../utils/apiError");
const { generateAccessToken, generateRefreshToken } = require("../utils/generateToken");
const { ROLES } = require("../config/constants");

// @route POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, ward, preferredLanguage } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, "Name, email and password are required");
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) throw new ApiError(409, "An account with this email already exists");

  // Public registration is always 'citizen'. Officer/admin accounts are created by admins.
  const user = await User.create({
    name,
    email,
    password,
    phone,
    ward,
    preferredLanguage,
    role: ROLES.CITIZEN,
  });

  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);

  res.status(201).json({
    success: true,
    user: user.toSafeObject(),
    accessToken,
    refreshToken,
  });
});

// @route POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new ApiError(400, "Email and password are required");

  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
  if (!user || !user.isActive) throw new ApiError(401, "Invalid credentials");

  const match = await user.comparePassword(password);
  if (!match) throw new ApiError(401, "Invalid credentials");

  user.lastLoginAt = new Date();
  await user.save();

  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);

  res.json({ success: true, user: user.toSafeObject(), accessToken, refreshToken });
});

// @route GET /api/auth/me
const getProfile = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user.toSafeObject() });
});

// @route PUT /api/auth/me
const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, ward, preferredLanguage } = req.body;
  const user = await User.findById(req.user._id);
  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (ward) user.ward = ward;
  if (preferredLanguage) user.preferredLanguage = preferredLanguage;
  await user.save();
  res.json({ success: true, user: user.toSafeObject() });
});

module.exports = { register, login, getProfile, updateProfile };
