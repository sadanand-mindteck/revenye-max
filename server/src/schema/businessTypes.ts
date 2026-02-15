import { z } from 'zod';
import { pgTable, text, integer, serial } from 'drizzle-orm/pg-core';

export const businessTypes = pgTable("business_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
});


export type BusinessType = typeof businessTypes.$inferSelect;
export type NewBusinessType = typeof businessTypes.$inferInsert;

export const BusinessTypeCreateZ = z.object({
  name: z.string().min(1, 'Name is required'),
});

export type BusinessTypeCreateInput = z.infer<typeof BusinessTypeCreateZ>;
