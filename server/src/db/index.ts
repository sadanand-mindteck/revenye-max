import Database from "better-sqlite3";
import { drizzle as drizzleSqlite } from "drizzle-orm/better-sqlite3";
import mysql from "mysql2/promise";
import { drizzle as drizzleMysql } from "drizzle-orm/mysql2";

export async function initDatabases() {

// ✅ SQLite
  const sqliteRaw = new Database(process.env.SQLITE_PATH || 'server/dev.sqlite',);
  const sqlite = drizzleSqlite(sqliteRaw);

  // ✅ MySQL
  const mysqlPool = mysql.createPool({host: process.env.MYSQL_HOST || '127.0.0.1',
        port: Number(process.env.MYSQL_PORT || 3306),
        user: process.env.MYSQL_USER || 'root',
        password: process.env.MYSQL_PASSWORD || '',
        database: process.env.MYSQL_DATABASE || 'revenuemax'});
  const mysqlDb = drizzleMysql(mysqlPool);

 
  return {
    sqlite,      // ← DRIZZLE INSTANCE
    mysql: mysqlDb,  // ← DRIZZLE INSTANCE
  };
}

// 🔥 THIS IS THE IMPORTANT PART
export type AppDatabases = Awaited<ReturnType<typeof initDatabases>>;
