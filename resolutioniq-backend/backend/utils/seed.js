require("dotenv").config();
const connectDB = require("../config/db");
const Department = require("../models/Department");
const User = require("../models/User");
const { DEPARTMENT_ROUTING, ROLES } = require("../config/constants");

const DEPARTMENT_DEFS = [
  { name: "Public Works Department", code: "PWD", handledIssueTypes: ["pothole"] },
  { name: "Sanitation Department", code: "SAN", handledIssueTypes: ["garbage"] },
  { name: "Electrical Department", code: "ELE", handledIssueTypes: ["streetlight"] },
  { name: "Water Department", code: "WAT", handledIssueTypes: ["water_leakage"] },
  { name: "Town Planning Department", code: "TPD", handledIssueTypes: ["illegal_construction"] },
  { name: "General Administration", code: "GEN", handledIssueTypes: ["other"] },
];

async function seed() {
  await connectDB();

  for (const dept of DEPARTMENT_DEFS) {
    await Department.findOneAndUpdate({ code: dept.code }, dept, { upsert: true, new: true });
  }
  console.log(`Seeded ${DEPARTMENT_DEFS.length} departments.`);

  const adminEmail = "admin@resolutioniq.gov";
  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    await User.create({
      name: "Platform Admin",
      email: adminEmail,
      password: "ChangeMe123!",
      role: ROLES.ADMIN,
    });
    console.log(`Seeded default admin: ${adminEmail} / ChangeMe123! (change this immediately)`);
  } else {
    console.log("Default admin already exists, skipping.");
  }

  console.log("Seeding complete.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
