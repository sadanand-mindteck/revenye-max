import "dotenv/config";
import type { Config } from "drizzle-kit";

export default {
  schema: "./src/schema/**/*.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    host: process.env.PG_HOST!,
    port: Number(process.env.PG_PORT) || 5432,
    user: process.env.PG_USER!,
    password: process.env.PG_PASSWORD!,
    database: process.env.PG_DATABASE!,
    ssl: false, // change to "require" if needed
  },
} satisfies Config;
