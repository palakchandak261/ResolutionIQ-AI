const express = require("express");
const {
  createComplaint,
  listComplaints,
  getComplaint,
  updateStatus,
  assignOfficer,
  voteComplaint,
} = require("../controllers/complaintController");
const { protect, authorize } = require("../middleware/auth");
const upload = require("../middleware/upload");
const { ROLES } = require("../config/constants");

const router = express.Router();

router.use(protect);

router.post(
  "/",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "voice", maxCount: 1 },
  ]),
  createComplaint
);
router.get("/", listComplaints);
router.get("/:id", getComplaint);
router.patch("/:id/status", authorize(ROLES.OFFICER, ROLES.ADMIN), updateStatus);
router.patch("/:id/assign", authorize(ROLES.OFFICER, ROLES.ADMIN), assignOfficer);
router.post("/:id/vote", voteComplaint);

module.exports = router;
