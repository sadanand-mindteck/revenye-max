
import { Pool } from "pg";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";

export async function initDatabases() {
  // ✅ Postgres using node-postgres (pg)
  // prefer explicit DATABASE_URL when provided, otherwise build structured config
  const poolConfig = {
    host: process.env.PG_HOST,
    port: Number(process.env.PG_PORT),
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE,
  };

  const pool = new Pool(poolConfig as any);

  const pg = drizzlePg(pool);

  return {
    pg, // ← DRIZZLE INSTANCE for Postgres
    pool, // raw pg Pool for raw queries
  };
}

// 🔥 THIS IS THE IMPORTANT PART
export type AppDatabases = Awaited<ReturnType<typeof initDatabases>>;
