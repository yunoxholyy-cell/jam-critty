# JAM CRITTY

A Y2K teen pool party event registration site for a Zimbabwe summer event (Sat 13 Dec 2026). Single-page landing site with full registration system and hidden admin dashboard.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000 mapped to 8080)
- `pnpm --filter @workspace/jam-critty run dev` — run the frontend (Vite dev server)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string
- Optional env: `ADMIN_PASSWORD` — defaults to `jamcritty-admin-2026`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind + Framer Motion
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/db/src/schema/registrations.ts` — DB schema (registrations + event_settings tables)
- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth for all API contracts)
- `lib/api-client-react/src/generated/` — generated React Query hooks
- `artifacts/api-server/src/routes/` — Express route handlers (register, stats, admin)
- `artifacts/jam-critty/src/pages/LandingPage.tsx` — full landing page
- `artifacts/jam-critty/src/pages/AdminDashboard.tsx` — admin dashboard
- `artifacts/jam-critty/src/index.css` — Y2K design system (colors, fonts, utilities)
- `artifacts/jam-critty/public/` — event images (hero.jpg, card-*.jpg, poster.jpg, break-pool.jpg)

## Architecture decisions

- Contract-first API: OpenAPI spec → codegen → typed hooks used by the frontend
- Soft cap enforcement: registration form switches to waitlist mode (never hard-blocked), admin can promote waitlisters
- Admin auth via `x-admin-password` header stored in sessionStorage; no JWT/sessions needed for a private dashboard
- Ticket tokens are 8-char base64-encoded random values, stored in DB and encoded in QR codes
- Walk-up entries skip phone/IG fields (empty strings) — used only at the door
- Rate limiting: 3 registrations per IP per hour (in-memory map, resets on server restart)

## Product

- **Landing page**: Hero with countdown, event details cards, event poster, registration form, socials, FAQ
- **Registration**: 34 women / 16 men cap (50 total). Waitlist mode when any cap is hit. Honeypot spam protection.
- **Admin dashboard** at `/admin`: password-protected, two modes:
  - **List Mode**: full registrations table with search/filter, status/payment management, ticket modal, CSV export, cap editor
  - **Door Mode**: check-in flow, QR code scanner (jsQR), walk-up registration

## User preferences

- Event date: Sat 13 Dec 2026, 18:00 SAST (+02:00)
- Cap: 50 total, 34 women, 16 men
- WhatsApp numbers: +263 77 648 2053, +263 78 109 3789
- Instagram: @jamcritty
- Entry fee: US$20 (includes food + first drinks)
- Address sent via WhatsApp 48 hours before the event

## Gotchas

- The `lib/db` package must be built (`pnpm run typecheck:libs`) before the API server will typecheck correctly
- `event_settings` table is seeded with id=1 on first GET /api/caps call (lazily), but also pre-seeded on initial setup
- Images in `artifacts/jam-critty/public/` must be named: hero.jpg, card-entry.jpg, card-braai.jpg, card-dresscode.jpg, card-limited.jpg, poster.jpg, break-pool.jpg
- Admin password defaults to `jamcritty-admin-2026` if `ADMIN_PASSWORD` env var is not set

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
