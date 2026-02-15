import { z } from 'zod';
import { integer, pgTable, serial, text } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { employees } from './employees';

export const resources = pgTable("resources", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  employeeId: integer("employee_id").references(() => employees.id),
  billRate: integer("bill_rate").notNull(),
});


export type Resource = typeof resources.$inferSelect;
export type NewResource = typeof resources.$inferInsert;

export const ResourceCreateZ = z.object({
  name: z.string().min(1, 'Name is required'),
  employeeId: z.number().int().optional(),
  billRate: z.number().optional(),
});

export type ResourceCreateInput = z.infer<typeof ResourceCreateZ>;
