# ResolutionIQ AI

AI-powered GovTech SaaS platform for civic complaint management — "File It Right. Get It Fixed."

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/scripts run seed` — seed the DB with sample data
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET` — session secret

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite (artifacts/resolutioniq, port 19144)
- API: Express 5 (artifacts/api-server, port 8080)
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Charts: Recharts
- Animations: Framer Motion
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/resolutioniq/src/pages/` — all page components (landing, login, citizen, gov, dashboard, risk, admin)
- `artifacts/resolutioniq/src/components/` — layout, badges, ui components
- `artifacts/resolutioniq/src/hooks/use-auth.tsx` — role-based auth state (citizen/officer/admin)
- `artifacts/api-server/src/routes/` — Express route handlers (complaints, departments, analytics, risk, users)
- `lib/db/src/schema/` — Drizzle schema (complaints, departments, timeline_events, risk_alerts, users)
- `lib/api-zod/src/generated/api.ts` — Zod validation schemas (generated from OpenAPI spec)
- `lib/api-client-react/src/generated/api.ts` — React Query hooks (generated from OpenAPI spec)
- `scripts/src/seed.ts` — DB seed script

## Architecture decisions

- Contract-first: OpenAPI spec → Zod schemas + React Query hooks via Orval codegen
- Role-based client auth stored in React state (demo mode, no credentials required)
- AI routing is deterministic (category→department map) + simulated confidence score
- Timeline events auto-created on complaint submission and status changes
- Risk alerts are manually created/resolved by officers; future: AI auto-generate from complaint clusters

## Product

Five portals:
1. **Landing** — marketing page with live stats, problem/solution, feature grid
2. **Citizen Portal** (`/citizen`) — file complaints, track status, vote on issues
3. **Government Command Center** (`/gov`) — complaint queue with SLA monitoring, status updates, officer assignment
4. **Civic Intelligence Dashboard** (`/dashboard`) — KPIs, charts (category bar, severity pie, trends line), ward heatmap, SLA breach risk
5. **Predictive Risk Alerts** (`/risk`) — AI risk predictions, create/resolve alerts
6. **Admin Control Center** (`/admin`) — user management, department management

## User preferences

- Deep navy sidebar (`222 47% 11%`), electric cyan primary (`199 89% 42%`) — no dark mode toggle needed
- No emojis in UI
- Font: Inter sans, JetBrains Mono for mono/code
- Professional GovTech aesthetic

## Gotchas

- DB schema push required after any schema change: `pnpm --filter @workspace/db run push`
- Codegen required after any OpenAPI spec change: `pnpm --filter @workspace/api-spec run codegen`
- Query hooks use `export function useXxx` (not `export const`) — grep for `export function use` not `export const use`
- Routes must use `Array.isArray(req.params.id) ? req.params.id[0] : req.params.id` for path params in Express 5
- `@workspace/db` must be added as a dependency to any workspace package that imports it (scripts package needs it explicitly)

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
