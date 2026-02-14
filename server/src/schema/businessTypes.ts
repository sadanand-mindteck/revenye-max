import { z } from 'zod';
import { sqliteTable, text, } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const businessTypes = sqliteTable("business_types", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
});


export type BusinessType = typeof businessTypes.$inferSelect;
export type NewBusinessType = typeof businessTypes.$inferInsert;

export const BusinessTypeCreateZ = z.object({
  name: z.string().min(1, 'Name is required'),
});

export type BusinessTypeCreateInput = z.infer<typeof BusinessTypeCreateZ>;
