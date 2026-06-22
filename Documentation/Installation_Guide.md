# ResolutionIQ AI — Installation Guide

**Version:** 1.0.0

---

## Prerequisites

| Requirement | Minimum Version | Download |
|---|---|---|
| Node.js | 18.x LTS | https://nodejs.org |
| pnpm | 8.x | `npm install -g pnpm` |
| MongoDB | 6.x (local) or Atlas | https://www.mongodb.com |
| Git | any | https://git-scm.com |

---

## Step 1 — Clone the Repository

```bash
git clone https://github.com/palakchandak261/ResolutionIQ-AI.git
cd ResolutionIQ-AI
```

---

## Step 2 — Set Up the Backend

### 2a. Navigate to backend folder
```bash
cd Source_Code/backend
```

### 2b. Install dependencies
```bash
npm install
```

### 2c. Create environment file
Copy the example and fill in your values:
```bash
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Option A — Local MongoDB (make sure mongod is running)
MONGODB_URI=mongodb://127.0.0.1:27017/resolutioniq

# Option B — MongoDB Atlas
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/resolutioniq?retryWrites=true&w=majority

JWT_SECRET=change_this_to_a_long_random_string
JWT_EXPIRES_IN=7d
```

### 2d. Start local MongoDB (if using local)

**Windows:**
```
net start MongoDB
```
or run `mongod` directly.

**macOS (Homebrew):**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
```

### 2e. Seed demo data
```bash
npm run seed
```
This creates:
- 7 departments
- 5 demo users (admin, officers, citizens)
- 8 sample complaints with various statuses
- 3 AI risk alerts

### 2f. Start the backend
```bash
npm run dev      # development with auto-restart
# or
npm start        # production
```

**Expected output:**
```
MongoDB connected: 127.0.0.1
ResolutionIQ AI backend running on port 5000 [development]
```

---

## Step 3 — Set Up the Frontend

### 3a. Navigate to the workspace root
```bash
# From repo root:
cd Attached-Assets/Attached-Assets
```

### 3b. Install all workspace dependencies
```bash
pnpm install
```

### 3c. Start the frontend dev server

**Windows PowerShell:**
```powershell
cd artifacts/resolutioniq
$env:PORT="5173"; $env:BASE_PATH="/"; pnpm run dev
```

**Windows CMD:**
```cmd
cd artifacts\resolutioniq
set PORT=5173 & set BASE_PATH=/ & pnpm run dev
```

**macOS / Linux:**
```bash
cd artifacts/resolutioniq
PORT=5173 BASE_PATH=/ pnpm run dev
```

**Expected output:**
```
VITE v7.x  ready in ~900ms
➜  Local:   http://localhost:5173/
```

---

## Step 4 — Open the Application

Open your browser at: **http://localhost:5173**

You should see the ResolutionIQ AI landing page.

---

## Step 5 — Verify It's Working

1. Click **Get Started** → `/login`
2. Select **Citizen** → click **Enter Platform**
3. You should see the complaints list with seeded data
4. Navigate to **Dashboard** → charts should load with real data
5. Navigate to **Risk Alerts** → 3 AI alerts should appear

---

## Troubleshooting

### "Port 5000 already in use"
Change `PORT=5001` in `.env` and update `vite.config.ts` proxy target:
```typescript
proxy: {
  "/api": { target: "http://localhost:5001" }
}
```

### "CORS error in browser"
Ensure `CLIENT_URL=http://localhost:5173` in your `.env` matches exactly.

### "Cannot connect to MongoDB"
- Local: verify `mongod` is running: `mongosh --eval "db.runCommand({ping:1})"`
- Atlas: whitelist your IP at cloud.mongodb.com → Network Access

### "PORT env variable required" error in Vite
You must set `PORT` and `BASE_PATH` before running `pnpm run dev` (see Step 3c).

### pnpm not found
```bash
npm install -g pnpm
```

### Seed fails with "duplicate key" error
The database already has data. Either drop the DB:
```bash
mongosh resolutioniq --eval "db.dropDatabase()"
```
or skip the seed — the app works with existing data.

---

## Production Build

### Backend
```bash
cd Source_Code/backend
NODE_ENV=production npm start
```

### Frontend
```bash
cd Attached-Assets/Attached-Assets/artifacts/resolutioniq
PORT=3000 BASE_PATH=/ pnpm run build
# Output in: dist/
```

Serve the `dist/` folder with nginx, Vercel, or any static host.  
Set `VITE_API_URL=https://your-backend-url.com` as a build env var to point to your deployed backend.
