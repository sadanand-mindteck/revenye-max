import { z } from 'zod';
import { pgTable, text, integer, serial } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const dealTypes = pgTable("deal_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
});


export type DealTypes  = typeof dealTypes.$inferSelect;
export type NewDealTypes = typeof dealTypes.$inferInsert;

export const DealTypesCreateZ  = z.object({
  name: z.string().min(1, 'Name is required'),
});

export type DealTypesCreateInput = z.infer<typeof DealTypesCreateZ>;
