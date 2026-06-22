const ROLES = Object.freeze({
  CITIZEN: "citizen",
  OFFICER: "officer",
  ADMIN: "admin",
});

const ISSUE_TYPES = Object.freeze({
  POTHOLE: "pothole",
  GARBAGE: "garbage",
  STREETLIGHT: "streetlight",
  WATER_LEAKAGE: "water_leakage",
  ILLEGAL_CONSTRUCTION: "illegal_construction",
  OTHER: "other",
});

// Maps issue type -> default department name. Seeded into Departments collection.
const DEPARTMENT_ROUTING = Object.freeze({
  [ISSUE_TYPES.POTHOLE]: "Public Works Department",
  [ISSUE_TYPES.GARBAGE]: "Sanitation Department",
  [ISSUE_TYPES.STREETLIGHT]: "Electrical Department",
  [ISSUE_TYPES.WATER_LEAKAGE]: "Water Department",
  [ISSUE_TYPES.ILLEGAL_CONSTRUCTION]: "Town Planning Department",
  [ISSUE_TYPES.OTHER]: "General Administration",
});

const SEVERITY = Object.freeze({
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical",
});

const COMPLAINT_STATUS = Object.freeze({
  SUBMITTED: "submitted",
  ACKNOWLEDGED: "acknowledged",
  ASSIGNED: "assigned",
  IN_PROGRESS: "in_progress",
  RESOLVED: "resolved",
  REJECTED: "rejected",
  REOPENED: "reopened",
});

// SLA hours per severity, used by the SLA monitoring job
const SLA_HOURS_BY_SEVERITY = Object.freeze({
  [SEVERITY.CRITICAL]: 24,
  [SEVERITY.HIGH]: 72,
  [SEVERITY.MEDIUM]: 168,
  [SEVERITY.LOW]: 336,
});

module.exports = {
  ROLES,
  ISSUE_TYPES,
  DEPARTMENT_ROUTING,
  SEVERITY,
  COMPLAINT_STATUS,
  SLA_HOURS_BY_SEVERITY,
};
