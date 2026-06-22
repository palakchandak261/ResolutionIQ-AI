const asyncHandler = require("express-async-handler");
const fs = require("fs");
const Complaint = require("../models/Complaint");
const Department = require("../models/Department");
const Vote = require("../models/Vote");
const ApiError = require("../utils/apiError");
const generateReferenceId = require("../utils/generateReferenceId");
const aiService = require("../services/aiService");
const voiceService = require("../services/voiceService");
const { findDuplicateCandidates } = require("../services/duplicateDetectionService");
const { runCorrelationCheck } = require("../services/correlationService");
const { notify } = require("../services/notificationService");
const { COMPLAINT_STATUS, SLA_HOURS_BY_SEVERITY, ROLES } = require("../config/constants");

// @route POST /api/complaints
// Accepts multipart/form-data: description (text), lat, lng, address, ward,
// optional files: image (1), voice (1)
const createComplaint = asyncHandler(async (req, res) => {
  const { description = "", lat, lng, address, ward } = req.body;
  const imageFile = req.files?.image?.[0];
  const voiceFile = req.files?.voice?.[0];

  if (!description && !voiceFile) {
    throw new ApiError(400, "Provide a description or a voice recording");
  }
  if (!lat || !lng) {
    throw new ApiError(400, "Location (lat, lng) is required");
  }

  const coordinates = [Number(lng), Number(lat)];
  let workingDescription = description;
  let voiceData = null;
  let inputMode = "text";

  // 3. Voice Complaint Processing
  if (voiceFile) {
    inputMode = imageFile ? "voice+image" : "voice";
    const { transcript, detectedLanguage } = await voiceService.transcribeAudio(voiceFile.path);
    let translatedText = transcript;
    if (detectedLanguage && detectedLanguage !== "en" && detectedLanguage !== "unknown" && transcript) {
      // Reuse the text model to translate -> formal English complaint generation step
      // will operate on this translated text.
      translatedText = transcript; // Whisper already returns English by default w/ translations endpoint;
      // for non-English verbatim transcripts, Gemini's formal-complaint step below
      // effectively also normalizes language since the prompt asks for an English output.
    }
    voiceData = {
      url: `/uploads/voice/${voiceFile.filename}`,
      transcript,
      detectedLanguage,
      translatedText,
    };
    workingDescription = workingDescription || transcript;
  } else if (imageFile) {
    inputMode = "image";
  }

  if (!workingDescription) {
    throw new ApiError(400, "Could not extract a description from the provided input");
  }

  // 1. AI Complaint Generator
  const { formalComplaint, summary } = await aiService.generateFormalComplaint(workingDescription, {
    address,
  });

  // 2. AI Department Routing (text-based)
  const routing = await aiService.classifyAndRoute(workingDescription);

  let images = [];
  let visionResult = null;

  // 4. Image Complaint Processing
  if (imageFile) {
    const base64 = fs.readFileSync(imageFile.path, { encoding: "base64" });
    visionResult = await aiService.analyzeImage(base64, imageFile.mimetype);
    images = [{ url: `/uploads/images/${imageFile.filename}`, geminiAnalysis: visionResult }];
  }

  // Prefer vision result when it has higher confidence than the text classifier
  const finalIssueType =
    visionResult && visionResult.confidence > routing.confidence ? visionResult.issueType : routing.issueType;
  const finalRoutingConfidence =
    visionResult && visionResult.confidence > routing.confidence ? visionResult.confidence : routing.confidence;
  const finalSeverity = visionResult?.severity || routing.severity;
  const finalSeverityConfidence = visionResult?.severityConfidence ?? routing.severityConfidence;

  const department = await Department.findOne({ name: routing.departmentName });

  const referenceId = await generateReferenceId(Complaint);
  const slaHours = SLA_HOURS_BY_SEVERITY[finalSeverity] || SLA_HOURS_BY_SEVERITY.medium;
  const slaDeadline = new Date(Date.now() + slaHours * 60 * 60 * 1000);

  const complaint = await Complaint.create({
    referenceId,
    citizen: req.user._id,
    rawDescription: workingDescription,
    inputMode,
    originalLanguage: voiceData?.detectedLanguage || "en",
    aiGeneratedComplaint: formalComplaint,
    aiSummary: summary,
    issueType: finalIssueType,
    routingConfidence: finalRoutingConfidence,
    severity: finalSeverity,
    severityConfidence: finalSeverityConfidence,
    images,
    voiceRecording: voiceData,
    location: { type: "Point", coordinates },
    address,
    ward,
    department: department?._id,
    status: COMPLAINT_STATUS.SUBMITTED,
    slaDeadline,
    timeline: [{ status: COMPLAINT_STATUS.SUBMITTED, note: "Complaint submitted by citizen", actor: req.user._id }],
  });

  if (department) {
    await Department.findByIdAndUpdate(department._id, { $inc: { activeComplaintsCount: 1 } });
  }

  // 5. Duplicate Complaint Detection
  const duplicates = await findDuplicateCandidates({
    issueType: finalIssueType,
    coordinates,
    description: workingDescription,
    excludeId: complaint._id,
  });

  if (duplicates.length > 0) {
    complaint.duplicateCandidates = duplicates.map((d) => ({
      complaint: d.complaint,
      distanceMeters: d.distanceMeters,
      similarityScore: d.similarityScore,
    }));
    await complaint.save();
  }

  // 6. Root Cause Correlation Engine (best-effort, non-blocking for the response shape)
  let correlations = [];
  try {
    correlations = await runCorrelationCheck(complaint);
  } catch (err) {
    console.error("Correlation check failed:", err.message);
  }

  await notify(req.user._id, {
    title: "Complaint submitted",
    message: `Your complaint ${referenceId} has been submitted and routed to ${
      department?.name || "the relevant department"
    }.`,
    type: "status_update",
    relatedComplaint: complaint._id,
  });

  res.status(201).json({
    success: true,
    complaint,
    duplicateSuggestions: duplicates,
    correlationsTriggered: correlations.length,
  });
});

// @route GET /api/complaints
// Citizens see their own; officers see their department's; admins see all. Supports filters.
const listComplaints = asyncHandler(async (req, res) => {
  const { status, issueType, severity, department, ward, page = 1, limit = 20 } = req.query;
  const query = {};

  if (req.user.role === ROLES.CITIZEN) query.citizen = req.user._id;
  if (req.user.role === ROLES.OFFICER) query.department = req.user.department;

  if (status) query.status = status;
  if (issueType) query.issueType = issueType;
  if (severity) query.severity = severity;
  if (department && req.user.role === ROLES.ADMIN) query.department = department;
  if (ward) query.ward = ward;

  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    Complaint.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate("citizen", "name email")
      .populate("department", "name code")
      .populate("assignedOfficer", "name email"),
    Complaint.countDocuments(query),
  ]);

  res.json({ success: true, items, total, page: Number(page), pages: Math.ceil(total / limit) });
});

// @route GET /api/complaints/:id
const getComplaint = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id)
    .populate("citizen", "name email")
    .populate("department", "name code")
    .populate("assignedOfficer", "name email")
    .populate("duplicateCandidates.complaint", "referenceId status");

  if (!complaint) throw new ApiError(404, "Complaint not found");

  if (
    req.user.role === ROLES.CITIZEN &&
    String(complaint.citizen._id || complaint.citizen) !== String(req.user._id)
  ) {
    throw new ApiError(403, "You cannot view this complaint");
  }

  res.json({ success: true, complaint });
});

// @route PATCH /api/complaints/:id/status   (officer/admin)
const updateStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  if (!Object.values(COMPLAINT_STATUS).includes(status)) {
    throw new ApiError(400, "Invalid status value");
  }

  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) throw new ApiError(404, "Complaint not found");

  complaint.status = status;
  complaint.timeline.push({ status, note, actor: req.user._id });
  if (status === COMPLAINT_STATUS.RESOLVED) {
    complaint.resolvedAt = new Date();
    complaint.resolutionNote = note;
  }
  await complaint.save();

  await notify(complaint.citizen, {
    title: `Complaint ${complaint.referenceId} updated`,
    message: `Status changed to "${status}".${note ? ` Note: ${note}` : ""}`,
    type: "status_update",
    relatedComplaint: complaint._id,
  });

  res.json({ success: true, complaint });
});

// @route PATCH /api/complaints/:id/assign   (officer/admin)
const assignOfficer = asyncHandler(async (req, res) => {
  const { officerId } = req.body;
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) throw new ApiError(404, "Complaint not found");

  complaint.assignedOfficer = officerId;
  complaint.status = COMPLAINT_STATUS.ASSIGNED;
  complaint.timeline.push({ status: COMPLAINT_STATUS.ASSIGNED, note: "Officer assigned", actor: req.user._id });
  await complaint.save();

  res.json({ success: true, complaint });
});

// @route POST /api/complaints/:id/vote   (citizen co-voting / upvote existing issue)
const voteComplaint = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) throw new ApiError(404, "Complaint not found");

  try {
    await Vote.create({ complaint: complaint._id, user: req.user._id });
  } catch (err) {
    if (err.code === 11000) throw new ApiError(409, "You have already upvoted this complaint");
    throw err;
  }

  complaint.upvoteCount += 1;
  await complaint.save();

  res.status(201).json({ success: true, upvoteCount: complaint.upvoteCount });
});

module.exports = {
  createComplaint,
  listComplaints,
  getComplaint,
  updateStatus,
  assignOfficer,
  voteComplaint,
};
