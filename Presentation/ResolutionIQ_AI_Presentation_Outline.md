# ResolutionIQ AI — Presentation Outline

> Use this outline to build your PowerPoint / Google Slides presentation.
> Export as `ResolutionIQ_AI_Presentation.pptx` and place in the Presentation folder.

---

# Slide 1 — Title

## ResolutionIQ AI
### Civic Intelligence Platform for Smart Complaint Management

**Tagline:** File It Right. Get It Fixed.

**Presented By:** Palak Chandak  
**Date:** June 2026

---

# Slide 2 — Problem Statement

## Challenges in Civic Complaint Management

- Citizens struggle to identify the correct department
- Complaints are often incomplete or poorly described
- Language barriers limit accessibility
- No centralized complaint tracking system
- Delayed resolution due to manual routing
- Lack of visibility into civic issue hotspots

### Impact
Issue → Wrong Department → Delay → Unresolved Problem → Reduced Public Trust

---

# Slide 3 — Solution Overview

## ResolutionIQ AI

An AI-powered civic intelligence platform that transforms citizen complaints into structured government action.

### Workflow

1. Citizen submits complaint (Text / Voice / Image)
2. AI analyzes complaint
3. Complaint classified automatically
4. Correct department identified
5. Complaint routed instantly
6. Officers track and resolve issue
7. Analytics dashboard provides insights

---

# Slide 4 — Key Features

## Core Features

### Citizen Side
- Multi-modal complaint filing
- Voice complaints in multiple languages
- Image-based issue detection
- Community voting for similar issues

### Government Side
- AI classification
- Smart department routing
- SLA monitoring
- Real-time analytics
- Predictive risk alerts

---

# Slide 5 — Technology Stack

## Frontend

- React 18
- TypeScript
- Vite
- TailwindCSS
- Framer Motion
- Recharts

## Backend

- Node.js
- Express.js

## Database

- MongoDB
- Mongoose

## APIs

- REST API
- TanStack Query

## Development Tools

- pnpm Workspaces
- dotenv
- nodemon

---

# Slide 6 — System Architecture

## Architecture Flow

Citizen Portal

↓  

React Frontend

↓  

Express REST API

↓  

MongoDB Database

↓

Analytics Engine

↓

Government Dashboard

↓

Risk Alert System

### Highlights

- Full frontend-backend integration
- Scalable REST architecture
- JSON-based communication
- Production-ready design

---

# Slide 7 — Citizen Portal

## Smart Complaint Filing

### Features

- Submit complaint in seconds
- Upload photos
- Voice-based reporting
- Automatic location tagging
- Duplicate complaint detection
- Community impact visibility

### Screenshots

- Complaint List Page
- New Complaint Form
- AI Analysis Panel

---

# Slide 8 — AI Analysis Engine

## Intelligent Complaint Processing

### AI Capabilities

#### Image Analysis
- Detect potholes
- Detect garbage accumulation
- Detect broken streetlights

#### Voice Processing
- Speech-to-text conversion
- Language detection
- Translation support

#### Complaint Intelligence
- Severity prediction
- Confidence scoring
- Category classification

---

# Slide 9 — Smart Department Routing

## Automated Authority Mapping

### Routing Examples

| Complaint Type | Department |
|---------------|------------|
| Pothole | Public Works |
| Garbage | Sanitation |
| Water Leakage | Water Supply |
| Broken Streetlight | Electrical Department |

### Benefits

- Reduced manual work
- Faster assignment
- Improved resolution speed
- Fewer routing errors

---

# Slide 10 — Government Command Center

## Officer Dashboard

### Features

- Complaint queue management
- SLA monitoring
- Status tracking
- Officer assignment
- Priority filtering

### Screenshots

- Complaint Table
- Assignment Panel
- SLA Dashboard

---

# Slide 11 — Analytics Dashboard

## Data-Driven Governance

### Key Metrics

- Resolution Rate
- Complaint Volume
- AI Accuracy
- Citizen Satisfaction
- Department Performance

### Visualizations

- Complaint Trends
- Severity Distribution
- Ward Heatmaps
- Department Backlogs

---

# Slide 12 — Database & API Design

## MongoDB Collections

### complaints
Stores complaint details and status history

### departments
Department metadata and SLA settings

### riskalerts
Predicted civic risks

### users
Citizen, Officer, and Admin accounts

---

## REST APIs

### Complaints
- GET /api/complaints
- POST /api/complaints
- PUT /api/complaints/:id

### Analytics
- GET /api/analytics/*

### Departments
- GET /api/departments

### Risk Alerts
- GET /api/risk/alerts

---

# Slide 13 — Results & Impact

## Achievements

- Complete frontend implementation
- Backend API integration
- Real-time MongoDB connectivity
- Dashboard analytics working
- Complaint lifecycle management operational

## Expected Impact

### Citizens
- Easier reporting
- Faster responses
- Improved transparency

### Government
- Better resource planning
- Reduced misrouting
- Actionable civic intelligence

---

# Slide 14 — Future Enhancements

## Planned Features

### AI Enhancements
- Google Gemini integration
- OpenAI integration
- Advanced classification models

### Accessibility
- WhatsApp complaint filing
- SMS complaint filing
- Regional language support

### Platform Expansion
- Mobile App
- GIS Maps
- Push Notifications
- Smart City Integration

---

# Slide 15 — Thank You

# ResolutionIQ AI

### File It Right. Get It Fixed.

**GitHub Repository**
https://github.com/palakchandak261/ResolutionIQ-AI

**Demo**
http://localhost:5173

### Questions?

Thank You!