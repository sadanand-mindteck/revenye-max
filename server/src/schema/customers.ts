import { z } from 'zod';
import { sqliteTable, text, } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const customers = sqliteTable("customers", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
});


export type Customer = typeof customers.$inferSelect;
export type NewCustomer = typeof customers.$inferInsert;

export const CustomerCreateZ = z.object({
  name: z.string().min(1, 'Name is required'),
});

export type CustomerCreateInput = z.infer<typeof CustomerCreateZ>;
