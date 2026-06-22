import { db, complaintsTable, departmentsTable, riskAlertsTable, usersTable, timelineEventsTable } from "@workspace/db";

async function seed() {
  console.log("Seeding database...");

  // Departments
  const depts = await db.insert(departmentsTable).values([
    { name: "Public Works Department", code: "PWD", head: "Ramesh Sharma", email: "pwd@city.gov", slaHours: 48 },
    { name: "Sanitation Department", code: "SAN", head: "Priya Nair", email: "sanitation@city.gov", slaHours: 24 },
    { name: "Water Supply Department", code: "WSD", head: "Anil Mehta", email: "water@city.gov", slaHours: 12 },
    { name: "Electricity Department", code: "ELEC", head: "Sunita Rao", email: "electricity@city.gov", slaHours: 8 },
    { name: "Town Planning Department", code: "TPD", head: "Vikram Singh", email: "planning@city.gov", slaHours: 72 },
    { name: "Sewage & Drainage Department", code: "SDD", head: "Meena Krishnan", email: "sewage@city.gov", slaHours: 12 },
  ]).returning().onConflictDoNothing();
  console.log(`Seeded ${depts.length} departments`);

  // Users
  const users = await db.insert(usersTable).values([
    { name: "Arjun Patel", email: "arjun@city.gov", role: "officer", department: "Public Works Department", complaintsHandled: 124 },
    { name: "Deepa Iyer", email: "deepa@city.gov", role: "officer", department: "Sanitation Department", complaintsHandled: 87 },
    { name: "Ravi Kumar", email: "ravi@city.gov", role: "admin", department: "General Administration", complaintsHandled: 0 },
    { name: "Lakshmi Devi", email: "lakshmi@city.gov", role: "officer", department: "Water Supply Department", complaintsHandled: 203 },
    { name: "Suresh Pillai", email: "suresh@city.gov", role: "officer", department: "Electricity Department", complaintsHandled: 156 },
    { name: "Nandini Rao", email: "nandini@citizen.in", role: "citizen", department: "", complaintsHandled: 0 },
    { name: "Vijay Malhotra", email: "vijay@citizen.in", role: "citizen", department: "", complaintsHandled: 0 },
    { name: "Ananya Krishnan", email: "ananya@citizen.in", role: "citizen", department: "", complaintsHandled: 0 },
  ]).returning().onConflictDoNothing();
  console.log(`Seeded ${users.length} users`);

  // Complaints with dates spread across 8 weeks
  const now = Date.now();
  const week = 7 * 24 * 60 * 60 * 1000;

  const complaintsData = [
    { title: "Large pothole near City Hospital", description: "Massive pothole on Main Street near City Hospital causing accidents. Three vehicles damaged this week.", category: "Pothole", ward: "Ward 3", location: "Main Street near City Hospital, Sector 4", citizenName: "Nandini Rao", citizenEmail: "nandini@citizen.in", status: "Resolved", votes: 47, createdAt: new Date(now - 6 * week) },
    { title: "Overflowing garbage dump behind market", description: "The garbage collection hasn't happened in 10 days. Dump behind Nehru Market is overflowing onto the road.", category: "Garbage", ward: "Ward 7", location: "Behind Nehru Market, Old City Area", citizenName: "Vijay Malhotra", citizenEmail: "vijay@citizen.in", status: "Resolved", votes: 89, createdAt: new Date(now - 5 * week) },
    { title: "Water pipe burst on MG Road", description: "Underground water pipe burst at MG Road junction. Water flowing onto road since yesterday morning.", category: "Water Leakage", ward: "Ward 1", location: "MG Road Junction, Near Bus Stand", citizenName: "Ananya Krishnan", citizenEmail: "ananya@citizen.in", status: "In Progress", votes: 134, createdAt: new Date(now - 3 * week) },
    { title: "Streetlights out in residential colony", description: "All 12 streetlights on Park Avenue have been non-functional for 3 weeks. Safety concern for residents.", category: "Broken Streetlight", ward: "Ward 5", location: "Park Avenue, Green Colony, Block C", citizenName: "Nandini Rao", citizenEmail: "nandini@citizen.in", status: "In Progress", votes: 62, createdAt: new Date(now - 2 * week) },
    { title: "Illegal construction blocking road", description: "Unauthorized multi-storey construction blocking 60% of road width. No permits visible on site.", category: "Illegal Construction", ward: "Ward 9", location: "Near Temple Street, Old Bazaar Area", citizenName: "Vijay Malhotra", citizenEmail: "vijay@citizen.in", status: "Pending", votes: 28, createdAt: new Date(now - 4 * week) },
    { title: "Sewage overflow near school", description: "Sewage overflow near DPS School entrance. Children wading through sewage every morning. Urgent health hazard.", category: "Sewage Overflow", ward: "Ward 2", location: "DPS School Gate, Sector 12", citizenName: "Ananya Krishnan", citizenEmail: "ananya@citizen.in", status: "Escalated", votes: 203, createdAt: new Date(now - 1 * week) },
    { title: "Road cave-in on Nehru Avenue", description: "Portion of road has caved in near Nehru Avenue-Lal Bahadur crossing. Risk of vehicle damage.", category: "Pothole", ward: "Ward 6", location: "Nehru Avenue-LB Shastri Crossing", citizenName: "Nandini Rao", citizenEmail: "nandini@citizen.in", status: "Pending", votes: 91, createdAt: new Date(now - 2 * week) },
    { title: "No water supply for 48 hours", description: "Ward 11 residents haven't received water supply for 2 days. Pump station may be faulty.", category: "Water Leakage", ward: "Ward 11", location: "Sector 11 Pump Station area", citizenName: "Vijay Malhotra", citizenEmail: "vijay@citizen.in", status: "In Progress", votes: 178, createdAt: new Date(now - 5 * 24 * 60 * 60 * 1000) },
    { title: "High tension wire hanging low", description: "High tension electrical wire sagging very low over footpath after storm. Immediate safety risk.", category: "Broken Streetlight", ward: "Ward 4", location: "Industrial Estate Entry Road", citizenName: "Ananya Krishnan", citizenEmail: "ananya@citizen.in", status: "In Progress", votes: 156, createdAt: new Date(now - 3 * 24 * 60 * 60 * 1000) },
    { title: "Garbage piling up at bus stop", description: "Three 10-day-old garbage bins overflowing at central bus stop. Flies and stench affecting commuters.", category: "Garbage", ward: "Ward 3", location: "Central Bus Stand, Stop 7", citizenName: "Nandini Rao", citizenEmail: "nandini@citizen.in", status: "Pending", votes: 44, createdAt: new Date(now - 2 * 24 * 60 * 60 * 1000) },
    { title: "Manhole cover missing on highway", description: "Manhole cover missing on NH-44 service road. Cyclist fell in last night. Emergency repair needed.", category: "Pothole", ward: "Ward 8", location: "NH-44 Service Road, KM 12", citizenName: "Vijay Malhotra", citizenEmail: "vijay@citizen.in", status: "Pending", votes: 67, createdAt: new Date(now - 1 * 24 * 60 * 60 * 1000) },
    { title: "Illegal basement excavation started", description: "Building owner started excavation work at night without permission. Adjacent house showing cracks.", category: "Illegal Construction", ward: "Ward 10", location: "Subhash Nagar, House No 42 Block D", citizenName: "Ananya Krishnan", citizenEmail: "ananya@citizen.in", status: "Escalated", votes: 38, createdAt: new Date(now - 4 * 24 * 60 * 60 * 1000) },
    { title: "Sewage pipe blocked near flats", description: "Sewage pipe completely blocked. Wastewater backing up into ground floor flats. 40 families affected.", category: "Sewage Overflow", ward: "Ward 6", location: "Green Valley Apartments, Block 4", citizenName: "Nandini Rao", citizenEmail: "nandini@citizen.in", status: "In Progress", votes: 119, createdAt: new Date(now - 6 * 24 * 60 * 60 * 1000) },
    { title: "Pothole cluster on school route", description: "6 potholes within 200m stretch on school bus route. Kids complaining of back pain. Parents worried.", category: "Pothole", ward: "Ward 12", location: "School Road, Near Rotary Park", citizenName: "Vijay Malhotra", citizenEmail: "vijay@citizen.in", status: "Pending", votes: 83, createdAt: new Date(now - 8 * 24 * 60 * 60 * 1000) },
    { title: "Water contamination complaint", description: "Brown discolored water coming from taps for past week. Foul smell. Children falling sick.", category: "Water Leakage", ward: "Ward 8", location: "River View Colony, Sector 8", citizenName: "Ananya Krishnan", citizenEmail: "ananya@citizen.in", status: "Resolved", votes: 234, createdAt: new Date(now - 7 * week) },
  ];

  const severityMap: Record<string, string> = {
    "Pothole": "High", "Garbage": "Medium", "Water Leakage": "High",
    "Broken Streetlight": "Medium", "Illegal Construction": "Critical", "Sewage Overflow": "Critical",
  };
  const deptMap: Record<string, string> = {
    "Pothole": "Public Works Department", "Garbage": "Sanitation Department",
    "Water Leakage": "Water Supply Department", "Broken Streetlight": "Electricity Department",
    "Illegal Construction": "Town Planning Department", "Sewage Overflow": "Sewage & Drainage Department",
  };

  const inserted: typeof complaintsTable.$inferSelect[] = [];
  for (const c of complaintsData) {
    const severity = severityMap[c.category] ?? "Medium";
    const department = deptMap[c.category] ?? "General Administration";
    const confidence = 0.85 + Math.random() * 0.12;
    const aiSummary = `AI classified this as a ${c.category} issue in ${c.ward}. Routed to ${department} with ${severity.toLowerCase()} severity based on historical patterns.`;
    const [row] = await db.insert(complaintsTable).values({
      ...c,
      department,
      severity,
      aiConfidence: Math.round(confidence * 100) / 100,
      aiSummary,
      estimatedResolutionDays: severity === "Critical" ? 3 : severity === "High" ? 5 : 7,
      resolvedAt: c.status === "Resolved" ? new Date(c.createdAt.getTime() + 4 * 24 * 60 * 60 * 1000) : null,
    }).returning();
    inserted.push(row);
    // timeline
    await db.insert(timelineEventsTable).values({ complaintId: row.id, eventType: "submitted", description: `Complaint submitted by ${c.citizenName}`, actor: c.citizenName, createdAt: c.createdAt });
    await db.insert(timelineEventsTable).values({ complaintId: row.id, eventType: "ai_routed", description: `AI routed to ${department} with ${Math.round(confidence * 100)}% confidence`, actor: "AI Engine", createdAt: new Date(c.createdAt.getTime() + 5000) });
    if (c.status !== "Pending") {
      await db.insert(timelineEventsTable).values({ complaintId: row.id, eventType: "status_changed", description: `Status updated to ${c.status}`, actor: "Government Officer", createdAt: new Date(c.createdAt.getTime() + 2 * 60 * 60 * 1000) });
    }
  }
  console.log(`Seeded ${inserted.length} complaints`);

  // Risk alerts
  const alerts = await db.insert(riskAlertsTable).values([
    { title: "Road infrastructure failure risk - Ward 3 cluster", description: "AI detected 8 pothole complaints within 0.5km radius in Ward 3 in 30 days. High risk of full road collapse on Main Street corridor.", riskType: "Road Failure", location: "Main Street Corridor, Ward 3", ward: "Ward 3", severity: "Critical", status: "Active", confidence: 0.91, relatedComplaintIds: [] },
    { title: "Water main failure predicted - Ward 1 & 8", description: "Pattern analysis shows water leakage complaints doubling every 2 weeks in Wards 1 and 8. Underground main may need replacement.", riskType: "Water Infrastructure", location: "MG Road to River View Colony", ward: "Ward 1", severity: "High", status: "Active", confidence: 0.84, relatedComplaintIds: [] },
    { title: "Sewage system overload risk - Sector 12", description: "Sewage complaints near schools and residential area indicate systemic blockage. Risk of widespread overflow affecting 500+ households.", riskType: "Sewage System", location: "Sector 12 Drainage Network", ward: "Ward 2", severity: "Critical", status: "Active", confidence: 0.88, relatedComplaintIds: [] },
    { title: "Electrical grid stress - Industrial Estate", description: "Multiple streetlight failures near Industrial Estate suggest aging transformer infrastructure. Grid stress risk during peak load hours.", riskType: "Electrical Grid", location: "Industrial Estate, Ward 4", ward: "Ward 4", severity: "High", status: "Active", confidence: 0.77, relatedComplaintIds: [] },
    { title: "Structural risk from illegal excavation", description: "Two adjacent illegal excavation complaints within 100m of heritage building. Structural integrity risk to surrounding properties.", riskType: "Structural", location: "Subhash Nagar, Ward 10", ward: "Ward 10", severity: "High", status: "Active", confidence: 0.79, relatedComplaintIds: [] },
    { title: "Air quality degradation - Ward 7 waste", description: "Persistent garbage complaints in Ward 7 indicate systemic collection failure. Health risk from methane buildup.", riskType: "Environmental", location: "Old City Area, Ward 7", ward: "Ward 7", severity: "Medium", status: "Resolved", confidence: 0.82, relatedComplaintIds: [], resolvedAt: new Date(now - 3 * 24 * 60 * 60 * 1000) },
  ]).returning();
  console.log(`Seeded ${alerts.length} risk alerts`);

  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch((e) => { console.error(e); process.exit(1); });
