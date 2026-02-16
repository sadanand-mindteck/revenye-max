import { z } from 'zod';
import { pgTable, real, serial, text } from 'drizzle-orm/pg-core';


export const resources = pgTable("resources", {
  id: serial("id").primaryKey(),
  name: text("name"),
  employeeId: text("employee_id"),
  billRate: real("bill_rate").notNull(),
});


export type Resource = typeof resources.$inferSelect;
export type NewResource = typeof resources.$inferInsert;

export const ResourceCreateZ = z.object({
  name: z.string().optional(),
  employeeId: z.string().optional(),
  billRate: z.number().optional(),
});

export type ResourceCreateInput = z.infer<typeof ResourceCreateZ>;
