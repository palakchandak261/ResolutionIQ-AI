# ResolutionIQ AI
### Civic Intelligence Platform — AI-Powered Complaint Management

[![GitHub](https://img.shields.io/badge/GitHub-palakchandak261%2FResolutionIQ--AI-blue?logo=github)](https://github.com/palakchandak261/ResolutionIQ-AI)

> An end-to-end civic complaint management system where citizens file issues, AI routes them to the right government department, and officers resolve them — backed by real-time analytics and predictive risk alerts.

---

## Repository Structure

```
ResolutionIQ-AI/
│
├
├── Documentation/
│   ├── Technical_Documentation.md      ← Architecture, API, data models
│   ├── Installation_Guide.md           ← Step-by-step setup
│   ├── User_Manual.md                  ← How to use all portals
│   └── README.md
│
├── Presentation/
│   └── ResolutionIQ_AI_Presentation_Outline.md   ← Slide-by-slide outline
│
├── Demo/
│   ├── Demo_Video_Link.txt             ← Link to demo video
│   └── README.md                       ← How to run live demo
│
├── Architecture/
│   ├── Architecture_Diagram.svg        ← Full system architecture diagram
│   └── README.md
│
├── Screenshots/
│   ├── Login.png                       ← Add after running the app
│   ├── Dashboard.png
│   ├── Analytics.png
│   └── README.md
│
├── Attached-Assets/                    ← Original pnpm workspace (frontend)
├── resolutioniq-backend/               ← Original backend source
├── .gitignore
└── README.md                           ← This file
```

---

## Quick Start

### Prerequisites
- Node.js 18+  
- pnpm (`npm install -g pnpm`)  
- MongoDB (local or Atlas)

### 1 — Backend Setup
```bash
cd resolutioniq-backend
npm install
cp .env.example .env      # then edit MONGODB_URI
npm run seed              # populate demo data (run once)
npm run dev               # → http://localhost:5000
```

### 2 — Frontend Setup
```bash
cd Attached-Assets/Attached-Assets
pnpm install

cd artifacts/resolutioniq

# Windows PowerShell:
$env:PORT="5173"; $env:BASE_PATH="/"; pnpm run dev

# macOS/Linux:
PORT=5173 BASE_PATH=/ pnpm run dev
# → http://localhost:5173
```

### 3 — Open the App
Go to **http://localhost:5173** → select a role → Enter Platform

---

## Features

| Feature | Description |
|---|---|
| 📝 Multi-modal Complaints | File via text, voice (Hindi/Marathi/English), or image upload |
| 🤖 AI Classification | Auto-detects issue type, severity, confidence score |
| 🏛️ Smart Routing | Auto-assigns to correct government department |
| 👍 Co-voting | Citizens upvote existing complaints to boost priority |
| 📊 Analytics Dashboard | KPIs, category charts, ward heatmap, resolution trends |
| ⚠️ Risk Alerts | AI-predicted infrastructure failure warnings |
| ⏱️ SLA Tracking | Per-severity deadlines with breach detection |
| 🔧 Admin Panel | Manage users and departments |

---

## Portals

| Portal | URL | Access |
|---|---|---|
| Landing Page | `/` | Public |
| Login | `/login` | All (demo — no password) |
| Citizen Portal | `/citizen` | File & track complaints |
| Gov Command Center | `/gov` | Manage complaint queue |
| Analytics Dashboard | `/dashboard` | KPIs and charts |
| Risk Alerts | `/risk` | AI risk predictions |
| Admin Control Center | `/admin` | Users & departments |

---

## Tech Stack

**Frontend:** React 18 · Vite · TypeScript · TailwindCSS · TanStack Query · Framer Motion · Recharts · Radix UI · Wouter

**Backend:** Node.js · Express.js · MongoDB · Mongoose · CORS · Morgan · dotenv

**API:** REST · Generated TypeScript client (orval) · customFetch

---

## API Endpoints (20+)

```
GET  /api/complaints                   List complaints (filterable)
POST /api/complaints                   Create complaint
GET  /api/complaints/:id               Get complaint detail
PATCH /api/complaints/:id              Update status
POST /api/complaints/:id/vote          Upvote complaint
GET  /api/complaints/:id/timeline      Timeline events
GET  /api/complaints/stats/summary     KPI summary
GET  /api/complaints/stats/recent      Recent feed

GET  /api/analytics/overview           Platform KPIs
GET  /api/analytics/category-breakdown
GET  /api/analytics/severity-breakdown
GET  /api/analytics/ward-heatmap
GET  /api/analytics/resolution-trends
GET  /api/analytics/sla-breach-risk
GET  /api/analytics/department-workload

GET  /api/departments                  List departments
POST /api/departments                  Create department
GET  /api/departments/stats/workload   Workload stats

GET  /api/risk/alerts                  List risk alerts
POST /api/risk/alerts                  Create alert
PATCH /api/risk/alerts/:id             Update alert

GET  /api/users                        List users
POST /api/users                        Create user
DELETE /api/users/:id                  Delete user
```

---

## Seeded Demo Data

After running `npm run seed`:
- **7 departments** — Public Works, Sanitation, Water Supply, Electricity, Town Planning, Sewage & Drainage, General Admin
- **5 users** — 1 admin, 2 officers, 2 citizens
- **8 complaints** — various categories, severities, and statuses
- **3 risk alerts** — AI-generated infrastructure warnings

---

## Documentation

| Document | Description |
|---|---|
| [Technical Documentation](Documentation/Technical_Documentation.md) | Architecture, API reference, data models |
| [Installation Guide](Documentation/Installation_Guide.md) | Local and production setup |
| [User Manual](Documentation/User_Manual.md) | How to use all three portals |
| [Presentation Outline](Presentation/ResolutionIQ_AI_Presentation_Outline.md) | Slide deck content |

---

## License

MIT — free to use, modify and distribute.

---

*ResolutionIQ AI — Making civic complaint management smarter.*
