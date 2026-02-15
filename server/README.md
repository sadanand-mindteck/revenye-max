# Mindteck — Server (starter)

This folder contains a starter Fastify + Drizzle + Zod TypeScript backend scaffold.

Features included:
- Fastify server with CORS enabled
- SQLite (better-sqlite3) drizzle client for quick local dev
- MySQL (mysql2) + drizzle adapter placeholder
- Zod schemas for route validation
- Simple `/api/health` and `/api/deals` endpoints
- Shared types in `../shared/types.ts`

Quick start (from repository root):

```bash
cd server
pnpm install
cp .env.example .env
# adjust .env values if using MySQL
pnpm dev
```

Notes & next steps:
- For production, migrate from the demo `CREATE TABLE IF NOT EXISTS` to proper migrations (Drizzle migrations or a dedicated migration tool).
- The MySQL helper included is minimal — prefer connecting and awaiting the `createMysqlPool` wrapper before using it in routes.
- If you want the client to import shared types directly, add a path mapping (or import with relative path `../shared/types`).
