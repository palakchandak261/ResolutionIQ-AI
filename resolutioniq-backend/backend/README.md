# ResolutionIQ AI — Backend

"File It Right. Get It Fixed."

Node.js / Express / MongoDB (Mongoose) backend for the ResolutionIQ AI civic intelligence platform.
Pairs with the existing React/Vite/Tailwind/ShadCN frontend prototype.

## Stack

- Express.js + Mongoose (MongoDB Atlas)
- JWT auth with role-based access control (citizen / officer / admin)
- Google Gemini (text + vision) for complaint generation, department routing, image analysis
- Whisper (OpenAI-compatible STT endpoint) for voice complaint transcription
- Multer for image/audio uploads

## Quick start

```bash
cp .env.example .env
# fill in MONGODB_URI, JWT_SECRET, JWT_REFRESH_SECRET, GEMINI_API_KEY, WHISPER_API_KEY

npm install
npm run seed   # creates default departments + an admin user (admin@resolutioniq.gov / ChangeMe123!)
npm run dev    # starts on http://localhost:5000
```

> The AI services degrade gracefully without API keys: complaint generation falls back to a templated
> formal-complaint format, department routing falls back to keyword matching, and image analysis returns
> a low-confidence "other" classification. This keeps the MVP demoable even if a key is rate-limited
> mid-demo.

## Docker

```bash
docker compose up --build
```

Spins up the API on `:5000` and a local MongoDB on `:27017`. Set `MONGODB_URI=mongodb://mongo:27017/resolutioniq`
in `.env` when running this way.

## Folder structure

```
backend/
  config/          # db connection, app-wide constants (roles, issue types, SLA hours)
  controllers/      # request handlers
  middleware/        # auth, role guard, upload, error handler
  models/             # Mongoose schemas
  routes/              # Express routers
  services/             # AI integration, duplicate detection, correlation engine, notifications
  utils/                # token generation, reference IDs, geo helpers, seed script
  uploads/               # local file storage (images/, voice/)
  app.js
  server.js
```

## Core API surface

| Method | Route | Access | Notes |
|---|---|---|---|
| POST | `/api/auth/register` | public | citizen self-registration |
| POST | `/api/auth/login` | public | |
| GET/PUT | `/api/auth/me` | authenticated | |
| POST | `/api/complaints` | authenticated | multipart: `description`, `lat`, `lng`, `address`, `ward`, optional `image`, `voice` files. Runs the full AI pipeline (see below). |
| GET | `/api/complaints` | authenticated | scoped by role (citizen → own, officer → department, admin → all) |
| GET | `/api/complaints/:id` | authenticated | |
| PATCH | `/api/complaints/:id/status` | officer/admin | |
| PATCH | `/api/complaints/:id/assign` | officer/admin | |
| POST | `/api/complaints/:id/vote` | authenticated | co-voting / upvote existing issue |
| GET | `/api/departments` | authenticated | |
| POST/PUT | `/api/departments` | admin | |
| GET | `/api/notifications` | authenticated | |
| GET | `/api/analytics/overview` `/heatmap` `/wards` `/department-load` `/sla` | officer/admin | |
| GET | `/api/risk/alerts` `/correlations` | officer/admin | |
| GET/POST | `/api/admin/users` | admin | |
| GET | `/api/admin/audit-logs` | admin | |

## AI pipeline (triggered on `POST /api/complaints`)

1. **Voice processing** (if `voice` file present) → Whisper STT → transcript + detected language
2. **AI Complaint Generator** → Gemini turns the raw description into a formal civic complaint + summary
3. **AI Department Routing** → Gemini classifies issue type + severity, returns confidence, maps to a department
4. **Image analysis** (if `image` file present) → Gemini Vision detects issue type/severity from the photo; if its
   confidence beats the text classifier, it wins
5. **Duplicate detection** → geospatial `$near` query (configurable radius) + Jaccard text similarity against nearby
   open complaints of the same issue type; returned as `duplicateSuggestions` so the frontend can prompt "upvote
   existing issue instead"
6. **Root-cause correlation engine** → checks nearby complaints (configurable radius) against rule definitions (e.g.
   2+ potholes + 1+ water leakage within 50m → possible underground pipe leak); creates an `IssueCorrelation` +
   `RiskAlert` record feeding the heatmap/risk dashboard

## Environment variables

See `.env.example`. Required at minimum: `MONGODB_URI`, `JWT_SECRET`, `JWT_REFRESH_SECRET`. Everything AI-related is
optional thanks to the fallbacks described above.

## Connecting the existing frontend

The frontend prototype in `artifacts/resolutioniq` currently expects an `api-client-react` / `api-zod` typed contract
generated against the project's original Drizzle/Postgres API server. Since this backend is a clean MongoDB rebuild,
that generated client's types **will not match** these response shapes one-for-one. Two options:

1. Point the frontend's HTTP base URL at this backend and adjust call sites to match the response shapes documented
   above (recommended for a hackathon timeline — fastest path to a working demo).
2. Regenerate `api-zod` / `api-client-react` from an OpenAPI spec describing this backend, if you want the typed
   client back. Not done here since it's a generated-code step tied to your existing tooling.
