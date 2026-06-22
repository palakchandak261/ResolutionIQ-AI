const Complaint = require("../models/Complaint");
const IssueCorrelation = require("../models/IssueCorrelation");
const RiskAlert = require("../models/RiskAlert");
const { distanceMeters } = require("../utils/geo");

/**
 * 6. Root Cause Correlation Engine
 * Looks for clusters of complaints with cross-related issue types within a small radius
 * (e.g. potholes + low water pressure complaints near each other can indicate an
 * underground pipe leak). Runs after each new complaint is created, scoped to its
 * immediate vicinity (keeps it cheap enough to run inline rather than as a heavy batch job).
 */
const CORRELATION_RULES = [
  {
    name: "Possible underground pipe leakage",
    types: ["pothole", "water_leakage"],
    minCount: { pothole: 2, water_leakage: 1 },
    riskType: "infrastructure_failure",
  },
  {
    name: "Possible road subsidence / drainage failure",
    types: ["pothole", "garbage"],
    minCount: { pothole: 3 },
    riskType: "infrastructure_failure",
  },
];

async function runCorrelationCheck(newComplaint) {
  const radiusMeters = Number(process.env.CORRELATION_RADIUS_METERS) || 50;
  const [lng, lat] = newComplaint.location.coordinates;

  const nearby = await Complaint.find({
    status: { $nin: ["resolved", "rejected"] },
    location: {
      $near: {
        $geometry: { type: "Point", coordinates: [lng, lat] },
        $maxDistance: radiusMeters,
      },
    },
  }).select("issueType location severity");

  const countsByType = nearby.reduce((acc, c) => {
    acc[c.issueType] = (acc[c.issueType] || 0) + 1;
    return acc;
  }, {});

  const createdAlerts = [];

  for (const rule of CORRELATION_RULES) {
    const relevant = rule.types.filter((t) => countsByType[t]);
    if (relevant.length < 2 && rule.types.length > 1) continue; // need cross-type signal

    const meetsThreshold = Object.entries(rule.minCount).every(
      ([type, min]) => (countsByType[type] || 0) >= min
    );
    if (!meetsThreshold) continue;

    const relatedComplaints = nearby
      .filter((c) => rule.types.includes(c.issueType))
      .map((c) => c._id);

    const confidence = Math.min(
      0.95,
      0.5 + 0.1 * relatedComplaints.length
    );

    const correlation = await IssueCorrelation.create({
      title: rule.name,
      description: `Detected ${relatedComplaints.length} related complaints (${Object.entries(
        countsByType
      )
        .filter(([t]) => rule.types.includes(t))
        .map(([t, n]) => `${n} ${t}`)
        .join(", ")}) within ${radiusMeters}m.`,
      relatedComplaints,
      centroid: { type: "Point", coordinates: [lng, lat] },
      radiusMeters,
      issueTypesInvolved: rule.types,
      confidence,
      status: "open",
    });

    const riskAlert = await RiskAlert.create({
      ward: newComplaint.ward,
      location: { type: "Point", coordinates: [lng, lat] },
      riskType: rule.riskType,
      riskScore: confidence,
      basis: correlation.description,
      sourceCorrelation: correlation._id,
      status: "active",
    });

    createdAlerts.push({ correlation, riskAlert });
  }

  return createdAlerts;
}

module.exports = { runCorrelationCheck, distanceMeters };
