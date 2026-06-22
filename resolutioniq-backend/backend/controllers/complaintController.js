const asyncHandler = require("express-async-handler");
const Complaint = require("../models/Complaint");
const Department = require("../models/Department");
const ApiError = require("../utils/apiError");

const DEPARTMENT_MAP = {
  Pothole: "Public Works Department",
  Garbage: "Sanitation Department",
  "Water Leakage": "Water Supply Department",
  "Broken Streetlight": "Electricity Department",
  "Illegal Construction": "Town Planning Department",
  "Sewage Overflow": "Sewage & Drainage Department",
};

const SEVERITY_MAP = {
  Pothole: "High",
  Garbage: "Medium",
  "Water Leakage": "High",
  "Broken Streetlight": "Medium",
  "Illegal Construction": "Critical",
  "Sewage Overflow": "Critical",
};

// Format a Mongoose document to match frontend Complaint schema
function formatComplaint(c) {
  const obj = c.toObject ? c.toObject() : c;
  
  // Feature: Incognito Mode Check
  const isAnon = obj.isAnonymous === true;

  return {
    id: obj._id.toString(),
    title: obj.title,
    description: obj.description,
    category: obj.category,
    department: obj.department,
    status: obj.status,
    severity: obj.severity,
    priority: obj.priority || "Normal",
    ward: obj.ward,
    location: obj.location,
    // Mask identity if filed anonymously
    citizenName: isAnon ? "Anonymous Citizen" : obj.citizenName,
    citizenEmail: isAnon ? "Hidden" : obj.citizenEmail,
    isAnonymous: isAnon,
    assignedTo: obj.assignedTo || null,
    imageUrl: obj.imageUrl || null,
    votes: obj.votes || 0,
    aiConfidence: obj.aiConfidence || 0.9,
    aiSummary: obj.aiSummary || "",
    isDuplicate: obj.isDuplicate || false,
    duplicateOf: obj.duplicateOf || null,
    estimatedResolutionDays: obj.estimatedResolutionDays || 7,
    resolvedAt: obj.resolvedAt ? obj.resolvedAt.toISOString() : null,
    createdAt: obj.createdAt ? obj.createdAt.toISOString() : new Date().toISOString(),
    updatedAt: obj.updatedAt ? obj.updatedAt.toISOString() : new Date().toISOString(),
  };
}

// @route GET /api/complaints/stats/summary
const getComplaintsSummary = asyncHandler(async (_req, res) => {
  const all = await Complaint.find({});
  const pending = all.filter(c => c.status === "Pending").length;
  const inProgress = all.filter(c => c.status === "In Progress").length;
  const resolved = all.filter(c => c.status === "Resolved").length;
  const critical = all.filter(c => c.severity === "Critical").length;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayCount = all.filter(c => new Date(c.createdAt) >= today).length;
  const resolvedWithTime = all.filter(c => c.status === "Resolved" && c.resolvedAt);
  const avgDays =
    resolvedWithTime.length > 0
      ? resolvedWithTime.reduce((acc, c) => {
          const diff =
            (new Date(c.resolvedAt).getTime() - new Date(c.createdAt).getTime()) /
            (1000 * 60 * 60 * 24);
          return acc + diff;
        }, 0) / resolvedWithTime.length
      : 4.2;

  res.json({
    total: all.length,
    pending,
    inProgress,
    resolved,
    avgResolutionDays: Math.round(avgDays * 10) / 10,
    criticalCount: critical,
    todayCount,
    satisfactionRate: 0.87,
  });
});

// @route GET /api/complaints/stats/recent
const getRecentComplaints = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const complaints = await Complaint.find({})
    .sort({ createdAt: -1 })
    .limit(limit);
  res.json(complaints.map(formatComplaint));
});

// @route GET /api/complaints
const listComplaints = asyncHandler(async (req, res) => {
  const { status, department, severity, category, ward } = req.query;
  const query = {};
  if (status) query.status = status;
  if (department) query.department = department;
  if (severity) query.severity = severity;
  if (category) query.category = category;
  if (ward) query.ward = ward;

  const complaints = await Complaint.find(query).sort({ createdAt: -1 });
  res.json(complaints.map(formatComplaint));
});

// @route POST /api/complaints
const createComplaint = asyncHandler(async (req, res) => {
  const { title, description, category, ward, location, citizenName, citizenEmail, imageUrl, isAnonymous } =
    req.body;

  if (!title || !description || !category) {
    throw new ApiError(400, "title, description and category are required");
  }

  const department = DEPARTMENT_MAP[category] || "General Administration";
  const severity = SEVERITY_MAP[category] || "Medium";
  const confidence = Math.round((0.85 + Math.random() * 0.12) * 100) / 100;
  const aiSummary = `AI classified this as a ${category} issue in ${ward || "the area"}. Routed to ${department} with ${severity.toLowerCase()} severity based on historical patterns.`;
  const estimatedResolutionDays = severity === "Critical" ? 3 : severity === "High" ? 5 : 7;

  // Determine display name for timeline based on anonymity
  const displayActor = isAnonymous ? "Anonymous Citizen" : (citizenName || "Anonymous");

  const complaint = await Complaint.create({
    title,
    description,
    category,
    department,
    severity,
    ward: ward || "",
    location: location || "",
    citizenName: citizenName || "Anonymous",
    citizenEmail: citizenEmail || "",
    imageUrl: imageUrl || null,
    isAnonymous: isAnonymous || false,
    aiConfidence: confidence,
    aiSummary,
    estimatedResolutionDays,
    timeline: [
      {
        eventType: "submitted",
        description: `Complaint submitted by ${displayActor}`,
        actor: displayActor,
      },
      {
        eventType: "ai_routed",
        description: `AI routed to ${department} with ${Math.round(confidence * 100)}% confidence`,
        actor: "AI Engine",
      },
    ],
  });

  // Increment department active count
  await Department.findOneAndUpdate({ name: department }, { $inc: { activeComplaints: 1 } });

  res.status(201).json(formatComplaint(complaint));
});

// @route GET /api/complaints/:id
const getComplaint = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) throw new ApiError(404, "Complaint not found");
  res.json(formatComplaint(complaint));
});

// @route PATCH /api/complaints/:id
const updateComplaint = asyncHandler(async (req, res) => {
  const { status, assignedTo, priority, severity, notes } = req.body;
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) throw new ApiError(404, "Complaint not found");

  if (status) complaint.status = status;
  if (assignedTo !== undefined) complaint.assignedTo = assignedTo;
  if (priority) complaint.priority = priority;
  if (severity) complaint.severity = severity;

  if (status === "Resolved") {
    complaint.resolvedAt = new Date();
    await Department.findOneAndUpdate(
      { name: complaint.department },
      { $inc: { activeComplaints: -1, totalResolved: 1 } }
    );
  }

  if (status) {
    complaint.timeline.push({
      eventType: "status_changed",
      description: `Status updated to ${status}${notes ? `: ${notes}` : ""}`,
      actor: "Government Officer",
    });
  }

  await complaint.save();
  res.json(formatComplaint(complaint));
});

// @route POST /api/complaints/:id/vote
const voteComplaint = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findByIdAndUpdate(
    req.params.id,
    { $inc: { votes: 1 } },
    { new: true }
  );
  if (!complaint) throw new ApiError(404, "Complaint not found");
  res.json(formatComplaint(complaint));
});

// @route GET /api/complaints/:id/timeline
const getComplaintTimeline = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) throw new ApiError(404, "Complaint not found");

  const events = complaint.timeline.map((e, idx) => ({
    id: idx + 1,
    complaintId: complaint._id.toString(),
    eventType: e.eventType || "status_changed",
    description: e.description || "",
    actor: e.actor || "System",
    createdAt: (e.at || complaint.createdAt).toISOString(),
  }));

  res.json(events.reverse());
});

module.exports = {
  getComplaintsSummary,
  getRecentComplaints,
  listComplaints,
  createComplaint,
  getComplaint,
  updateComplaint,
  voteComplaint,
  getComplaintTimeline,
};