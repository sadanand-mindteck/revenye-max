import { z } from 'zod';
import { pgTable, text, integer, serial } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const verticals = pgTable("verticals", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
});


export type Vertical = typeof verticals.$inferSelect;
export type NewVertical = typeof verticals.$inferInsert;

export const VerticalCreateZ = z.object({
  name: z.string().min(1, 'Name is required'),
});

export type VerticalCreateInput = z.infer<typeof VerticalCreateZ>;
