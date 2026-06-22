require("dotenv").config();
const connectDB = require("../config/db");
const Department = require("../models/Department");
const User = require("../models/User");
const Complaint = require("../models/Complaint");
const RiskAlert = require("../models/RiskAlert");

const DEPARTMENTS = [
  { name: "Public Works Department", code: "PWD", head: "Rajesh Kumar", contactEmail: "pwd@city.gov", slaHours: 72, handledIssueTypes: ["Pothole"] },
  { name: "Sanitation Department", code: "SAN", head: "Priya Sharma", contactEmail: "san@city.gov", slaHours: 48, handledIssueTypes: ["Garbage"] },
  { name: "Water Supply Department", code: "WAT", head: "Amit Patel", contactEmail: "water@city.gov", slaHours: 24, handledIssueTypes: ["Water Leakage"] },
  { name: "Electricity Department", code: "ELE", head: "Sunita Singh", contactEmail: "electric@city.gov", slaHours: 48, handledIssueTypes: ["Broken Streetlight"] },
  { name: "Town Planning Department", code: "TPD", head: "Vikram Mehta", contactEmail: "planning@city.gov", slaHours: 168, handledIssueTypes: ["Illegal Construction"] },
  { name: "Sewage & Drainage Department", code: "SDD", head: "Neha Verma", contactEmail: "sewage@city.gov", slaHours: 24, handledIssueTypes: ["Sewage Overflow"] },
  { name: "General Administration", code: "GEN", head: "Arun Gupta", contactEmail: "admin@city.gov", slaHours: 120, handledIssueTypes: ["Other"] },
];

const USERS = [
  { name: "Platform Admin", email: "admin@resolutioniq.gov", role: "admin", department: "General Administration", status: "active" },
  { name: "Officer Rahul Desai", email: "rahul.desai@city.gov", role: "officer", department: "Public Works Department", status: "active", complaintsHandled: 42 },
  { name: "Officer Meena Iyer", email: "meena.iyer@city.gov", role: "officer", department: "Sanitation Department", status: "active", complaintsHandled: 35 },
  { name: "Citizen Arjun Nair", email: "arjun.nair@gmail.com", role: "citizen", status: "active" },
  { name: "Citizen Kavya Reddy", email: "kavya.reddy@gmail.com", role: "citizen", status: "active" },
];

const COMPLAINTS = [
  {
    title: "Large Pothole on MG Road Causing Accidents",
    description: "There is a huge pothole outside City College on MG Road causing accidents every morning. The hole is about 2 feet wide and cars are swerving dangerously.",
    category: "Pothole", department: "Public Works Department", status: "In Progress",
    severity: "High", priority: "High", ward: "Ward 3", location: "MG Road, near City College",
    citizenName: "Arjun Nair", citizenEmail: "arjun.nair@gmail.com",
    votes: 24, aiConfidence: 0.94, estimatedResolutionDays: 5,
    aiSummary: "AI classified this as a High severity Pothole issue in Ward 3. Routed to Public Works Department based on location and description analysis.",
  },
  {
    title: "Garbage Not Collected for 5 Days in Ward 7",
    description: "The garbage bins on Laxmi Nagar street have not been emptied for 5 days. The smell is unbearable and flies are everywhere. Health hazard for residents.",
    category: "Garbage", department: "Sanitation Department", status: "Pending",
    severity: "Medium", priority: "Normal", ward: "Ward 7", location: "Laxmi Nagar, near Bus Stand",
    citizenName: "Kavya Reddy", citizenEmail: "kavya.reddy@gmail.com",
    votes: 18, aiConfidence: 0.91, estimatedResolutionDays: 7,
    aiSummary: "AI detected recurring garbage collection failure in Ward 7. Pattern suggests route scheduling issue affecting 3 streets.",
  },
  {
    title: "Sewage Overflow on Patel Street",
    description: "Sewage is overflowing from the manhole at Patel Street intersection. The road is flooded with wastewater. Multiple complaints from residents.",
    category: "Sewage Overflow", department: "Sewage & Drainage Department", status: "Escalated",
    severity: "Critical", priority: "Critical", ward: "Ward 2", location: "Patel Street Intersection",
    citizenName: "Arjun Nair", citizenEmail: "arjun.nair@gmail.com",
    votes: 47, aiConfidence: 0.97, estimatedResolutionDays: 3,
    aiSummary: "Critical sewage overflow detected. AI cross-correlated with 3 similar complaints in adjacent wards indicating possible main line blockage.",
  },
  {
    title: "Broken Streetlight — Safety Risk at Night",
    description: "The streetlight on Nehru Road near the hospital has been broken for 2 weeks. Very dark at night and unsafe for pedestrians and two-wheelers.",
    category: "Broken Streetlight", department: "Electricity Department", status: "Resolved",
    severity: "Medium", priority: "Normal", ward: "Ward 5", location: "Nehru Road, near General Hospital",
    citizenName: "Kavya Reddy", citizenEmail: "kavya.reddy@gmail.com",
    votes: 12, aiConfidence: 0.89, estimatedResolutionDays: 5,
    aiSummary: "Streetlight failure in high pedestrian traffic zone. Resolved by Electricity Department within SLA.",
    resolvedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    title: "Water Supply Contamination — Brown Water",
    description: "Water supply in our area has turned brown and smells bad since yesterday morning. We cannot drink or use this water. Multiple households affected.",
    category: "Water Leakage", department: "Water Supply Department", status: "In Progress",
    severity: "High", priority: "High", ward: "Ward 9", location: "Shivaji Colony, Block B",
    citizenName: "Arjun Nair", citizenEmail: "arjun.nair@gmail.com",
    votes: 33, aiConfidence: 0.96, estimatedResolutionDays: 5,
    aiSummary: "Water contamination detected affecting approximately 200 households. AI flagged as high priority due to public health risk.",
  },
  {
    title: "Illegal Construction Blocking Road Access",
    description: "A builder has started unauthorized construction work on the empty plot at Ganesh Nagar Road, blocking half the road and endangering pedestrians.",
    category: "Illegal Construction", department: "Town Planning Department", status: "Pending",
    severity: "Critical", priority: "Critical", ward: "Ward 4", location: "Ganesh Nagar Road, Plot 45",
    citizenName: "Kavya Reddy", citizenEmail: "kavya.reddy@gmail.com",
    votes: 29, aiConfidence: 0.93, estimatedResolutionDays: 3,
    aiSummary: "Unauthorized construction blocking public road. Immediate action required per town planning regulations.",
  },
  {
    title: "Pothole Cluster on Ring Road",
    description: "Multiple potholes have formed on the ring road stretch from Sector 12 to Sector 15. Heavy rain has worsened the situation and several vehicles have been damaged.",
    category: "Pothole", department: "Public Works Department", status: "Pending",
    severity: "High", priority: "High", ward: "Ward 11", location: "Ring Road, Sector 12-15",
    citizenName: "Arjun Nair", citizenEmail: "arjun.nair@gmail.com",
    votes: 56, aiConfidence: 0.92, estimatedResolutionDays: 5,
    aiSummary: "Cluster of 8 potholes detected on high-traffic ring road. AI recommends batch repair to maximize efficiency.",
  },
  {
    title: "Overflowing Drainage Canal Flood Risk",
    description: "The drainage canal near Ward 1 market area is almost overflowing after recent rains. Businesses and homes nearby are at risk of flooding if not addressed.",
    category: "Sewage Overflow", department: "Sewage & Drainage Department", status: "Pending",
    severity: "Critical", priority: "Critical", ward: "Ward 1", location: "Market Road Canal, Ward 1",
    citizenName: "Kavya Reddy", citizenEmail: "kavya.reddy@gmail.com",
    votes: 38, aiConfidence: 0.95, estimatedResolutionDays: 3,
    aiSummary: "Critical flood risk identified. AI predicts 80% probability of overflow within 24 hours without intervention.",
  },
];

const RISK_ALERTS = [
  {
    title: "High Pothole Density — Infrastructure Failure Risk",
    description: "AI analysis of 12 pothole complaints in Ward 3 and Ward 11 over the past 30 days indicates systemic road deterioration likely caused by subsurface water damage.",
    riskType: "Road Failure", location: "Ward 3 & Ward 11 main roads", ward: "Ward 3",
    severity: "High", status: "Active", confidence: 0.91, relatedComplaintIds: [],
  },
  {
    title: "Sewage Main Line Blockage Predicted",
    description: "Correlation engine detected 5 sewage overflow reports within 500m radius in Wards 2 and 4. Pattern suggests main sewer line failure within 48-72 hours.",
    riskType: "Sewage System", location: "Ward 2-4 sewer corridor", ward: "Ward 2",
    severity: "Critical", status: "Active", confidence: 0.87, relatedComplaintIds: [],
  },
  {
    title: "Water Contamination Spread Risk",
    description: "Brown water reports in Ward 9 may indicate pipe corrosion affecting the main distribution line serving Wards 8-10.",
    riskType: "Water Infrastructure", location: "Shivaji Colony distribution zone", ward: "Ward 9",
    severity: "High", status: "Active", confidence: 0.83, relatedComplaintIds: [],
  },
];

async function seed() {
  await connectDB();

  console.log("🌱 Seeding database...");

  // Departments
  for (const d of DEPARTMENTS) {
    await Department.findOneAndUpdate(
      { code: d.code },
      { ...d, contactEmail: d.contactEmail },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }
  console.log(`✅ Seeded ${DEPARTMENTS.length} departments`);

  // Users
  await User.deleteMany({});
  for (const u of USERS) {
    await User.create(u);
  }
  console.log(`✅ Seeded ${USERS.length} users`);

  // Complaints — only seed if collection is empty
  const existingCount = await Complaint.countDocuments();
  if (existingCount === 0) {
    for (const c of COMPLAINTS) {
      const complaint = await Complaint.create({
        ...c,
        timeline: [
          {
            eventType: "submitted",
            description: `Complaint submitted by ${c.citizenName}`,
            actor: c.citizenName,
            at: new Date(),
          },
          {
            eventType: "ai_routed",
            description: `AI routed to ${c.department} with ${Math.round(c.aiConfidence * 100)}% confidence`,
            actor: "AI Engine",
            at: new Date(),
          },
        ],
      });
      console.log(`  📝 Created complaint: ${complaint.title.slice(0, 50)}...`);
    }
    console.log(`✅ Seeded ${COMPLAINTS.length} complaints`);
  } else {
    console.log(`ℹ️  Complaints already exist (${existingCount} records), skipping complaint seed`);
  }

  // Risk Alerts — only seed if collection is empty
  const existingAlerts = await RiskAlert.countDocuments();
  if (existingAlerts === 0) {
    await RiskAlert.insertMany(RISK_ALERTS);
    console.log(`✅ Seeded ${RISK_ALERTS.length} risk alerts`);
  } else {
    console.log(`ℹ️  Risk alerts already exist, skipping`);
  }

  // Update department active complaint counts
  const allComplaints = await Complaint.find({});
  for (const dept of DEPARTMENTS) {
    const active = allComplaints.filter(
      c => c.department === dept.name && c.status !== "Resolved"
    ).length;
    const resolved = allComplaints.filter(
      c => c.department === dept.name && c.status === "Resolved"
    ).length;
    await Department.findOneAndUpdate(
      { code: dept.code },
      { activeComplaints: active, totalResolved: resolved }
    );
  }
  console.log("✅ Updated department complaint counts");

  console.log("\n🎉 Seeding complete!");
  console.log("   Admin login: POST /api/auth/login (if auth is enabled)");
  process.exit(0);
}

seed().catch(err => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
