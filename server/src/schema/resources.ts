import { z } from 'zod';
import { integer, sqliteTable, text, } from 'drizzle-orm/sqlite-core';

export const resources = sqliteTable("resources", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  resourceId: text("resource_id").notNull(),
  billRate: integer("bill_rate").notNull(),
});


export type Resource = typeof resources.$inferSelect;
export type NewResource = typeof resources.$inferInsert;

export const ResourceCreateZ = z.object({
  name: z.string().min(1, 'Name is required'),
  resourceId: z.string().optional(),
  billRate: z.number().optional(),
});

export type ResourceCreateInput = z.infer<typeof ResourceCreateZ>;
