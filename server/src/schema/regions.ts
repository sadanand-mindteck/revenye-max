import { z } from 'zod';
import { pgTable, text, integer, serial } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const regions = pgTable("regions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
});

export type Region = typeof regions.$inferSelect;
export type NewRegion = typeof regions.$inferInsert;

export const RegionCreateZ = z.object({
  name: z.string().min(1, 'Name is required'),
});

export type RegionCreateInput = z.infer<typeof RegionCreateZ>;
