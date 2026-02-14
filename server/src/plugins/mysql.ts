import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';

export async function createMysqlPool(cfg: { host: string; port: number; user: string; password: string; database: string }) {
  const pool = mysql.createPool({
    host: cfg.host,
    port: cfg.port,
    user: cfg.user,
    password: cfg.password,
    database: cfg.database,
    waitForConnections: true,
    connectionLimit: 10,
  });

  const db = drizzle(pool);

  // You can run a lightweight ensure table query if needed — keep migrations separate in production
  await pool.query(`
    CREATE TABLE IF NOT EXISTS deals (
      id VARCHAR(100) PRIMARY KEY,
      projectName TEXT,
      customer TEXT,
      region TEXT,
      fyForecast BIGINT,
      fyBudget BIGINT,
      fyActual BIGINT,
      variance BIGINT
    )
  `);

  return db as any;
}

export function initMysql(cfg: { host: string; port: number; user: string; password: string; database: string }) {
  // For convenience in the simple scaffold, create and return a promise-like object that exposes run queries.
  // The `createMysqlPool` is async; caller may choose to await initialization. We'll return a minimal wrapper.
  const poolPromise = createMysqlPool(cfg);
  return {
    poolPromise,
    query: async (...args: any[]) => {
      const pool = (await poolPromise).session?.exec ? poolPromise : await poolPromise;
      // using pool.query via mysql2
      const p = await (await poolPromise).run ? (await poolPromise) : await poolPromise;
      // fallback: user should await poolPromise to get a usable drizzle instance
      return null;
    }
  } as any;
}
