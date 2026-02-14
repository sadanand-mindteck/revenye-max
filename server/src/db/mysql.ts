import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';

export async function initMysql(cfg: { host: string; port: number; user: string; password: string; database: string }) {
  const pool = mysql.createPool({
    host: cfg.host,
    port: cfg.port,
    user: cfg.user,
    password: cfg.password,
    database: cfg.database,
    waitForConnections: true,
    connectionLimit: 10,
  });

  const client = drizzle(pool);

  // Do NOT create tables here; run migrations separately in production.

  return { client: client as any, pool };
}
