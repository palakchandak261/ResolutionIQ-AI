# ResolutionIQ AI — User Manual

**Version:** 1.0.0

---

## Overview

ResolutionIQ AI has three portals, each for a different type of user:

| Portal | Who it's for | URL |
|---|---|---|
| Citizen Portal | Public users filing complaints | `/citizen` |
| Government Command Center | Officers managing complaints | `/gov` |
| Admin Control Center | Administrators | `/admin` |

Plus two shared screens:
- **Analytics Dashboard** `/dashboard` — Charts and KPIs
- **Risk Alerts** `/risk` — AI-predicted infrastructure risks

---

## Getting Started — Login

1. Open **http://localhost:5173**
2. Click **Get Started** or navigate to `/login`
3. Select your role:
   - **Citizen** → file and track complaints
   - **Government Officer** → manage complaint queue
   - **City Administrator** → full platform control
4. Click **Enter Platform**

> ℹ️ This is demo mode — no password required. Just select a role.

---

## Citizen Portal

### Viewing Your Complaints
- Navigate to `/citizen`
- All complaints are listed with status badges, severity indicators, and vote counts
- Use the **search bar** to filter by title or location
- Use the **Status** and **Category** dropdowns to filter
- Click any complaint to see full details

### Filing a New Complaint

1. Click **File New Complaint** button (top right)
2. Choose your input method:

   **Text Tab** — Type your complaint description
   - Start typing — AI analysis appears on the right panel after 15 characters
   - The AI shows: issue type, department, severity, confidence score, estimated resolution time

   **Voice Tab** — Record your complaint
   - Select language: English, Hindi, or Marathi
   - Click **Start Recording** and speak clearly
   - Click **Stop Recording** when done
   - Transcript appears automatically

   **Image Tab** — Upload a photo
   - Drag & drop or click to upload an image
   - AI scans the image and detects the issue type automatically

3. Click **Continue to Location**

4. **Select Ward** — click your ward from the grid or search by address
5. Enter your **Name** and **Email**
6. Click **Continue to Review**

7. Review the AI-generated complaint:
   - Professional title, formal draft, citizen summary, department notes
   - Click any field to edit the AI text
8. Check the **Review Summary** panel for routing details
9. Click **Submit Complaint**

10. You'll receive a **success screen** with your complaint ID — note it for tracking

### Tracking a Complaint
- Click any complaint from your list
- See the full **Timeline** of events (submitted → AI routed → status updates)
- View AI confidence score and department routing
- Click the **👍 vote button** to upvote the complaint

### Voting on Complaints
If a similar complaint already exists:
- A yellow **duplicate alert** appears during filing
- Click **Upvote Existing** to add your vote without creating a duplicate
- Higher vote counts increase the complaint's priority

---

## Government Command Center

### Overview
- Navigate to `/gov`
- **KPI row** at top: Total, Pending, In Progress, Resolved counts
- **Department Workload** bar shows active complaints per department
- **Complaint table** with all columns: ID, Title, Category, Status, Severity, Ward, Filed, AI confidence

### Filtering Complaints
Use the filter row:
- Search by title or location
- Filter by **Status**: Pending, In Progress, Resolved, Escalated
- Filter by **Severity**: Critical, High, Medium, Low

### Complaint Detail
Click any row in the table → `/gov/complaint/:id`

From here you can:
- See full complaint details and AI analysis
- View the complete timeline
- **Update status** using the status dropdown
- **Assign to an officer** using the assign field
- Add a resolution note

### SLA Monitoring
- Complaints approaching or past their SLA deadline are flagged in the analytics dashboard
- Critical complaints have a 24-hour SLA
- High severity: 72 hours
- Medium: 168 hours (7 days)
- Low: 336 hours (14 days)

---

## Analytics Dashboard

Navigate to `/dashboard`

### KPI Cards (top row)
| Metric | Description |
|---|---|
| Total Complaints | All complaints in the system |
| Resolution Rate | % of complaints marked Resolved |
| AI Routing Accuracy | AI classification confidence average |
| Avg Response Time | Hours from submission to first action |
| Citizen Satisfaction | Survey satisfaction rate |
| Active Risk Alerts | Open AI-generated risk alerts |
| Duplicates Blocked | Complaints identified as duplicates |
| Wards Covered | Number of distinct wards with complaints |

### Charts

**Complaints by Category** — Bar chart showing volume per issue type  
**Severity Distribution** — Donut chart (Critical / High / Medium / Low)  
**Resolution Trends** — Line chart: submitted vs resolved per week  
**Ward Heatmap** — Color-coded grid by complaint density and severity  
**SLA Breach Risk** — Table of complaints at risk of breaching SLA  
**Department Load** — Horizontal bar chart of active complaints per dept

---

## Risk Alerts

Navigate to `/risk`

The AI automatically generates risk alerts when complaint patterns indicate emerging infrastructure failures.

### Viewing Alerts
- **Red banner** at top shows count of active alerts
- Each alert card shows: severity badge, risk type, status, AI confidence %, title, description, location, ward, creation time
- Active alerts have a **Resolve** button

### Creating a Manual Alert
1. Click **Create Alert** (top right)
2. Fill in:
   - **Title** — short description of the risk
   - **Risk Type** — Road Failure / Water Infrastructure / Electrical Grid / Sewage System / Structural / Environmental
   - **Severity** — Critical / High / Medium / Low
   - **Ward** — affected ward
   - **AI Confidence** — 0 to 1 (e.g. 0.85)
   - **Location** — specific area
   - **Description** — full explanation of the risk
3. Click **Create Risk Alert**

### Resolving an Alert
Click the **✓ Resolve** button on any active alert card.

---

## Admin Control Center

Navigate to `/admin`

### System Stats
Four KPI cards at top: Total Complaints, Users, Departments, Active Alerts.

### Users Tab

**View all users:**
- Name, Email, Role, Department, Complaints Handled, Status

**Create a new user:**
1. Click **Add User**
2. Enter: Full Name, Email, Role (citizen/officer/admin), Department
3. Click **Create User**

**Delete a user:**
- Click the trash icon on any user row

### Departments Tab

**View all departments:**
- Name, Code, Head, SLA Hours, Active complaints, Total Resolved

**Create a new department:**
1. Click **Add Department**
2. Enter: Name, Code (e.g. PWD), Head officer name, Email, SLA Hours
3. Click **Create Department**

---

## Keyboard & Navigation Tips

| Action | How |
|---|---|
| Go to citizen portal | Click **Citizen Portal** in sidebar |
| Go to gov command center | Click **Command Center** in sidebar |
| Go to dashboard | Click **Analytics** in sidebar |
| Go to risk alerts | Click **Risk Alerts** in sidebar |
| Go to admin | Click **Admin** in sidebar |
| Back to home | Click the **ResolutionIQ AI** logo |

---

## Status Reference

| Status | Meaning |
|---|---|
| Pending | Just submitted, awaiting review |
| In Progress | Assigned to a department, work started |
| Resolved | Issue fixed, complaint closed |
| Escalated | Escalated to higher authority |
| Rejected | Complaint rejected (invalid or duplicate) |

## Severity Reference

| Severity | SLA | Color |
|---|---|---|
| Critical | 24 hours | Red |
| High | 72 hours | Orange |
| Medium | 7 days | Yellow |
| Low | 14 days | Green |
