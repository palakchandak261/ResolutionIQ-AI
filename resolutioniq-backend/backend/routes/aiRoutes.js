const express = require("express");
const { analyzeComplaint } = require("../controllers/complaintController");

const router = express.Router();

// POST /api/ai/analyze
// Live analysis while citizen types — returns classification, department, severity, AI draft
router.post("/analyze", analyzeComplaint);

module.exports = router;
