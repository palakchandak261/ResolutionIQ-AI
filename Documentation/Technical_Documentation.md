# ResolutionIQ AI — Technical Documentation

**Version:** 1.0.0  
**Platform:** Civic Intelligence & Complaint Management  
**Stack:** React · Node.js · Express · MongoDB · TanStack Query · Vite

---

## 1. System Overview

ResolutionIQ AI is a full-stack civic complaint management platform that uses AI-assisted routing, analytics, and risk prediction to help governments and citizens manage public infrastructure issues efficiently.

### Key Capabilities
- Citizens file complaints via text, voice, or image
- AI auto-classifies issue type, severity, and routes to the correct department
- Government officers manage a smart complaint queue with SLA tracking
- Administrators control users, departments, and platform settings
- Real-time analytics: category breakdowns, ward heatmaps, resolution trends
- Predictive risk alerts based on complaint pattern correlation

---

## 2. Architecture

```
┌─────────────────────────────────────┐
│         React Frontend (Vite)       │  :5173
│  Citizen · Officer · Admin Portals  │
│  TanStack Query + generated client  │
└──────────────┬──────────────────────┘
               │ HTTP REST /api/*
               │ (Vite proxy in dev)
┌──────────────▼──────────────────────┐
│      Express.js Backend             │  :5000
│  Routes → Controllers → Models      │
│  No auth middleware (demo mode)      │
└──────────────┬──────────────────────┘
               │ Mongoose ODM
┌──────────────▼──────────────────────┐
│           MongoDB                   │
│  complaints · departments · users   │
│  riskAlerts · (indexes on status,   │
│  category, severity, ward)          │
└─────────────────────────────────────┘
```

---

## 3. Technology Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 18.x | UI framework |
| Vite | 5.x | Build tool & dev server |
| TypeScript | 5.x | Type safety |
| TanStack Query | 5.x | Server state management |
| Wouter | 3.x | Client-side routing |
| Tailwind CSS | 4.x | Utility-first styling |
| Framer Motion | 11.x | Animations |
| Recharts | 2.x | Analytics charts |
| Radix UI | various | Accessible UI primitives |
| Lucide React | 0.46x | Icon library |
| date-fns | 3.x | Date formatting |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Node.js | 18+ | Runtime |
| Express | 4.x | HTTP framework |
| MongoDB | 7+ | Database |
| Mongoose | 8.x | ODM |
| CORS | 2.x | Cross-origin requests |
| Morgan | 1.x | HTTP logging |
| dotenv | 16.x | Environment config |

---

## 4. Project Structure

```
resolutionIT/
├── Source_Code/
│   ├── frontend/                   ← React app
│   │   ├── src/
│   │   │   ├── App.tsx             ← Router + providers
│   │   │   ├── main.tsx            ← Entry point + setBaseUrl()
│   │   │   ├── pages/
│   │   │   │   ├── landing.tsx
│   │   │   │   ├── login.tsx
│   │   │   │   ├── dashboard.tsx
│   │   │   │   ├── admin.tsx
│   │   │   │   ├── risk.tsx
│   │   │   │   ├── citizen/
│   │   │   │   │   ├── index.tsx
│   │   │   │   │   ├── new-complaint.tsx
│   │   │   │   │   └── complaint-detail.tsx
│   │   │   │   └── gov/
│   │   │   │       ├── index.tsx
│   │   │   │       └── complaint-detail.tsx
│   │   │   ├── components/
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── badges.tsx
│   │   │   │   └── ui/             ← shadcn/ui components
│   │   │   └── hooks/
│   │   │       ├── use-auth.tsx
│   │   │       └── use-toast.ts
│   │   ├── vite.config.ts
│   │   └── package.json
│   └── backend/
│       ├── server.js               ← Entry point
│       ├── app.js                  ← Express app + middleware
│       ├── config/
│       │   ├── db.js               ← MongoDB connection
│       │   └── constants.js
│       ├── controllers/
│       │   ├── complaintController.js
│       │   ├── analyticsController.js
│       │   ├── departmentController.js
│       │   ├── riskController.js
│       │   └── userController.js
│       ├── models/
│       │   ├── Complaint.js
│       │   ├── Department.js
│       │   ├── RiskAlert.js
│       │   └── User.js
│       ├── routes/
│       │   ├── index.js
│       │   ├── complaintRoutes.js
│       │   ├── analyticsRoutes.js
│       │   ├── departmentRoutes.js
│       │   ├── riskRoutes.js
│       │   └── userRoutes.js
│       ├── middleware/
│       │   └── errorHandler.js
│       ├── utils/
│       │   └── seed.js
│       ├── .env.example
│       └── package.json
```

---

## 5. API Reference

### Base URL
```
http://localhost:5000/api
```

### Complaints

| Method | Endpoint | Description | Body / Query |
|---|---|---|---|
| GET | `/complaints` | List complaints | `?status=Pending&category=Pothole&severity=High&ward=Ward+3` |
| POST | `/complaints` | Create complaint | `{title, description, category, ward, location, citizenName, citizenEmail}` |
| GET | `/complaints/:id` | Get single complaint | — |
| PATCH | `/complaints/:id` | Update status/assignment | `{status, assignedTo, priority, notes}` |
| POST | `/complaints/:id/vote` | Upvote complaint | — |
| GET | `/complaints/:id/timeline` | Get timeline events | — |
| GET | `/complaints/stats/summary` | KPI summary | — |
| GET | `/complaints/stats/recent` | Recent complaints | `?limit=10` |

#### Complaint Object
```json
{
  "id": "mongo_object_id_string",
  "title": "Large Pothole on MG Road",
  "description": "Full description text",
  "category": "Pothole",
  "department": "Public Works Department",
  "status": "Pending | In Progress | Resolved | Escalated | Rejected",
  "severity": "Low | Medium | High | Critical",
  "priority": "Normal | High | Critical",
  "ward": "Ward 3",
  "location": "MG Road, near City College",
  "citizenName": "Arjun Nair",
  "citizenEmail": "arjun@example.com",
  "assignedTo": null,
  "imageUrl": null,
  "votes": 24,
  "aiConfidence": 0.94,
  "aiSummary": "AI analysis summary text",
  "isDuplicate": false,
  "duplicateOf": null,
  "estimatedResolutionDays": 5,
  "resolvedAt": null,
  "createdAt": "2026-06-22T07:41:50.720Z",
  "updatedAt": "2026-06-22T07:41:50.720Z"
}
```

### Departments

| Method | Endpoint | Description |
|---|---|---|
| GET | `/departments` | List all departments |
| POST | `/departments` | Create department |
| PATCH | `/departments/:id` | Update department |
| GET | `/departments/stats/workload` | Per-department workload |

### Analytics

| Method | Endpoint | Description |
|---|---|---|
| GET | `/analytics/overview` | Platform KPIs |
| GET | `/analytics/category-breakdown` | Complaints by category |
| GET | `/analytics/severity-breakdown` | Complaints by severity |
| GET | `/analytics/ward-heatmap` | Ward complaint density |
| GET | `/analytics/resolution-trends` | Weekly trends |
| GET | `/analytics/sla-breach-risk` | SLA breach list |
| GET | `/analytics/department-workload` | Dept load stats |

### Users

| Method | Endpoint | Description |
|---|---|---|
| GET | `/users` | List users |
| POST | `/users` | Create user |
| PATCH | `/users/:id` | Update user |
| DELETE | `/users/:id` | Delete user |

### Risk Alerts

| Method | Endpoint | Description |
|---|---|---|
| GET | `/risk/alerts` | List risk alerts |
| POST | `/risk/alerts` | Create risk alert |
| PATCH | `/risk/alerts/:id` | Update alert status |

---

## 6. Data Models

### Complaint Schema
```javascript
{
  title:                  String (required),
  description:            String (required),
  category:               String,          // Pothole, Garbage, etc.
  department:             String,          // auto-assigned by AI
  status:                 Enum[Pending, In Progress, Resolved, Escalated, Rejected],
  severity:               Enum[Low, Medium, High, Critical],
  priority:               String,
  ward:                   String,
  location:               String,
  citizenName:            String,
  citizenEmail:           String,
  assignedTo:             String,
  imageUrl:               String,
  votes:                  Number (default: 0),
  aiConfidence:           Number (0-1),
  aiSummary:              String,
  isDuplicate:            Boolean,
  duplicateOf:            Number,
  estimatedResolutionDays: Number,
  resolvedAt:             Date,
  timeline:               [{ eventType, description, actor, at }],
  createdAt:              Date,
  updatedAt:              Date
}
```

### Department Schema
```javascript
{
  name:            String (unique, required),
  code:            String (unique, required),   // PWD, SAN, etc.
  head:            String,
  contactEmail:    String,
  slaHours:        Number (default: 72),
  activeComplaints: Number,
  totalResolved:   Number,
  isActive:        Boolean
}
```

### RiskAlert Schema
```javascript
{
  title:                String (required),
  description:          String,
  riskType:             String,   // Road Failure, Water Infrastructure, etc.
  location:             String,
  ward:                 String,
  severity:             Enum[Low, Medium, High, Critical],
  status:               Enum[Active, Acknowledged, Resolved],
  confidence:           Number (0-1),
  relatedComplaintIds:  [Number],
  resolvedAt:           Date
}
```

---

## 7. Environment Variables

```env
# Server
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Database
MONGODB_URI=mongodb://127.0.0.1:27017/resolutioniq

# JWT (for future auth)
JWT_SECRET=your_secret_here
JWT_EXPIRES_IN=7d
```

---

## 8. AI Classification Logic

The frontend implements client-side AI simulation for the demo:

```
Input Text → Keyword Detection → Category Classification
                                        ↓
                              Department Routing (DEPT_MAP)
                                        ↓
                              Severity Assignment (SEV_MAP)
                                        ↓
                              Confidence Score (0.85–0.97)
                                        ↓
                              Ward Detection (text or user pick)
                                        ↓
                         POST /api/complaints → MongoDB
```

**Category → Department Mapping:**
| Category | Department | Severity |
|---|---|---|
| Pothole | Public Works Department | High |
| Garbage | Sanitation Department | Medium |
| Water Leakage | Water Supply Department | High |
| Broken Streetlight | Electricity Department | Medium |
| Illegal Construction | Town Planning Department | Critical |
| Sewage Overflow | Sewage & Drainage Department | Critical |

---

## 9. Frontend API Client

The frontend uses a generated TanStack Query client (`@workspace/api-client-react`) with hooks:

```typescript
// Complaints
useListComplaints(params?)         // GET /api/complaints
useGetComplaint(id)                // GET /api/complaints/:id
useCreateComplaint()               // POST /api/complaints
useUpdateComplaint()               // PATCH /api/complaints/:id
useVoteComplaint()                 // POST /api/complaints/:id/vote
useGetComplaintTimeline(id)        // GET /api/complaints/:id/timeline
useGetComplaintsSummary()          // GET /api/complaints/stats/summary

// Analytics
useGetAnalyticsOverview()          // GET /api/analytics/overview
useGetCategoryBreakdown()          // GET /api/analytics/category-breakdown
useGetSeverityBreakdown()          // GET /api/analytics/severity-breakdown
useGetWardHeatmap()                // GET /api/analytics/ward-heatmap
useGetResolutionTrends()           // GET /api/analytics/resolution-trends
useGetSlaBreachRisk()              // GET /api/analytics/sla-breach-risk
useGetDepartmentWorkload()         // GET /api/analytics/department-workload

// Departments
useListDepartments()               // GET /api/departments
useCreateDepartment()              // POST /api/departments
useGetDepartmentWorkload()         // GET /api/departments/stats/workload

// Users
useListUsers()                     // GET /api/users
useCreateUser()                    // POST /api/users
useDeleteUser()                    // DELETE /api/users/:id

// Risk Alerts
useListRiskAlerts()                // GET /api/risk/alerts
useCreateRiskAlert()               // POST /api/risk/alerts
useUpdateRiskAlert()               // PATCH /api/risk/alerts/:id
```

---

## 10. Security Considerations

- The current version runs in **demo mode** — no authentication required
- For production deployment, enable the JWT middleware in route files
- Never commit `.env` files — use `.env.example` as a template
- Set `CLIENT_URL` to restrict CORS to your production domain
- Use MongoDB Atlas with IP whitelisting for cloud deployments
- Rate limiting is configured at 500 requests per 15 minutes per IP
