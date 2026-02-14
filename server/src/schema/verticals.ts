import { z } from 'zod';
import { sqliteTable, text, } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const verticals = sqliteTable("verticals", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
});


export type Vertical = typeof verticals.$inferSelect;
export type NewVertical = typeof verticals.$inferInsert;

export const VerticalCreateZ = z.object({
  name: z.string().min(1, 'Name is required'),
});

export type VerticalCreateInput = z.infer<typeof VerticalCreateZ>;
