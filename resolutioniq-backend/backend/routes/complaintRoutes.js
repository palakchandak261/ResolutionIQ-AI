const express = require("express");
const {
  getComplaintsSummary,
  getRecentComplaints,
  listComplaints,
  createComplaint,
  getComplaint,
  updateComplaint,
  voteComplaint,
  getComplaintTimeline,
} = require("../controllers/complaintController");

const router = express.Router();

// Stats routes — must be before /:id
router.get("/stats/summary", getComplaintsSummary);
router.get("/stats/recent", getRecentComplaints);

// CRUD
router.get("/", listComplaints);
router.post("/", createComplaint);
router.get("/:id", getComplaint);
router.patch("/:id", updateComplaint);

// Actions
router.post("/:id/vote", voteComplaint);
router.get("/:id/timeline", getComplaintTimeline);

module.exports = router;
