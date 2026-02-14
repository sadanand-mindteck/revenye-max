import { z } from 'zod';
import { sqliteTable, text, } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const regions = sqliteTable("regions", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
});

export type Region = typeof regions.$inferSelect;
export type NewRegion = typeof regions.$inferInsert;

export const RegionCreateZ = z.object({
  name: z.string().min(1, 'Name is required'),
});

export type RegionCreateInput = z.infer<typeof RegionCreateZ>;
