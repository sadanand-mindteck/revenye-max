import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';

export function initSqlite(opts: { filename: string }) {
  const raw = new Database(opts.filename);
  const client = drizzle(raw);

  // Do NOT create tables here; migrations should be applied separately via Drizzle migrations.

  return { client: client as any, raw };
}
