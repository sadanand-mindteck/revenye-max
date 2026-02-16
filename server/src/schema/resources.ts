import { z } from 'zod';
import { integer, pgTable, real, serial, text } from 'drizzle-orm/pg-core';
import { projects } from './projects';


export const resources = pgTable("resources", {
  id: serial("id").primaryKey(),
  name: text("name"),
  employeeId: text("employee_id"),
  billRate: real("bill_rate").notNull(),
  projectId: integer("project_id").references(() => projects.id),
});


export type Resource = typeof resources.$inferSelect;
export type NewResource = typeof resources.$inferInsert;

export const ResourceCreateZ = z.object({
  name: z.string().optional(),
  employeeId: z.string().optional(),
  billRate: z.number().optional(),
  projectId: z.number().optional(),
});

export type ResourceCreateInput = z.infer<typeof ResourceCreateZ>;
