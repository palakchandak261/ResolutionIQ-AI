const Complaint = require("../models/Complaint");
const { distanceMeters } = require("../utils/geo");

/**
 * 5. Duplicate Complaint Detection
 * Finds existing OPEN complaints of the same issueType near the given coordinates.
 * Returns candidates sorted by distance, with a naive text-similarity score so the
 * frontend can suggest "Upvote existing issue" instead of creating a duplicate.
 */
async function findDuplicateCandidates({ issueType, coordinates, description, excludeId }) {
  const radiusMeters = Number(process.env.DUPLICATE_RADIUS_METERS) || 100;

  const nearby = await Complaint.find({
    _id: { $ne: excludeId },
    issueType,
    status: { $nin: ["resolved", "rejected"] },
    location: {
      $near: {
        $geometry: { type: "Point", coordinates },
        $maxDistance: radiusMeters,
      },
    },
  })
    .limit(10)
    .select("referenceId rawDescription location upvoteCount status");

  return nearby.map((c) => ({
    complaint: c._id,
    referenceId: c.referenceId,
    distanceMeters: Math.round(distanceMeters(coordinates, c.location.coordinates)),
    similarityScore: textSimilarity(description, c.rawDescription),
    upvoteCount: c.upvoteCount,
  }));
}

// Lightweight Jaccard similarity on word sets — good enough to rank candidates
// without an external embeddings call for the MVP.
function textSimilarity(a = "", b = "") {
  const setA = new Set(a.toLowerCase().split(/\W+/).filter(Boolean));
  const setB = new Set(b.toLowerCase().split(/\W+/).filter(Boolean));
  if (setA.size === 0 || setB.size === 0) return 0;
  let intersection = 0;
  for (const word of setA) if (setB.has(word)) intersection++;
  const union = new Set([...setA, ...setB]).size;
  return Number((intersection / union).toFixed(2));
}

module.exports = { findDuplicateCandidates };
