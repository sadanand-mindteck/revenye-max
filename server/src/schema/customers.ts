import { z } from 'zod';
import { pgTable, text, serial } from 'drizzle-orm/pg-core';

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name"),
});


export type Customer = typeof customers.$inferSelect;
export type NewCustomer = typeof customers.$inferInsert;

export const CustomerCreateZ = z.object({
  name: z.string().optional(),
});

export type CustomerCreateInput = z.infer<typeof CustomerCreateZ>;
