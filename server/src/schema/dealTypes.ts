import { z } from 'zod';
import { sqliteTable, text, } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const dealTypes = sqliteTable("deal_types", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
});


export type DealTypes  = typeof dealTypes.$inferSelect;
export type NewDealTypes = typeof dealTypes.$inferInsert;

export const DealTypesCreateZ  = z.object({
  name: z.string().min(1, 'Name is required'),
});

export type DealTypesCreateInput = z.infer<typeof DealTypesCreateZ>;
