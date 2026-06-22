const mongoose = require("mongoose");
const {
  ISSUE_TYPES,
  SEVERITY,
  COMPLAINT_STATUS,
} = require("../config/constants");

const timelineEventSchema = new mongoose.Schema(
  {
    status: { type: String, enum: Object.values(COMPLAINT_STATUS) },
    note: { type: String },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const complaintSchema = new mongoose.Schema(
  {
    referenceId: { type: String, required: true, unique: true }, // e.g. RIQ-2026-000123
    citizen: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // Raw input
    rawDescription: { type: String, required: true },
    inputMode: {
      type: String,
      enum: ["text", "voice", "image", "voice+image"],
      default: "text",
    },
    originalLanguage: { type: String, default: "en" },

    // AI generated formal complaint
    aiGeneratedComplaint: { type: String },
    aiSummary: { type: String },

    // Classification
    issueType: {
      type: String,
      enum: Object.values(ISSUE_TYPES),
      default: ISSUE_TYPES.OTHER,
    },
    routingConfidence: { type: Number, min: 0, max: 1 },
    severity: {
      type: String,
      enum: Object.values(SEVERITY),
      default: SEVERITY.MEDIUM,
    },
    severityConfidence: { type: Number, min: 0, max: 1 },

    // Media
    images: [{ url: String, geminiAnalysis: mongoose.Schema.Types.Mixed }],
    voiceRecording: {
      url: String,
      transcript: String,
      detectedLanguage: String,
      translatedText: String,
    },

    // Location
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true }, // [lng, lat]
    },
    address: { type: String },
    ward: { type: String },

    // Routing / assignment
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
    assignedOfficer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    status: {
      type: String,
      enum: Object.values(COMPLAINT_STATUS),
      default: COMPLAINT_STATUS.SUBMITTED,
    },
    slaDeadline: { type: Date },

    // Co-voting / duplicate handling
    upvoteCount: { type: Number, default: 0 },
    isDuplicateOf: { type: mongoose.Schema.Types.ObjectId, ref: "Complaint", default: null },
    duplicateCandidates: [
      {
        complaint: { type: mongoose.Schema.Types.ObjectId, ref: "Complaint" },
        distanceMeters: Number,
        similarityScore: Number,
      },
    ],

    timeline: [timelineEventSchema],

    resolvedAt: { type: Date },
    resolutionNote: { type: String },
    citizenRating: { type: Number, min: 1, max: 5 },
  },
  { timestamps: true }
);

complaintSchema.index({ location: "2dsphere" });
complaintSchema.index({ issueType: 1, status: 1 });
complaintSchema.index({ department: 1, status: 1 });
complaintSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Complaint", complaintSchema);
