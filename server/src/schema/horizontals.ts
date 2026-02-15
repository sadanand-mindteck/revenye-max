import { z } from 'zod';
import { pgTable, text, integer, serial } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const horizontals = pgTable("horizontals", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
});


export type Horizontal = typeof horizontals.$inferSelect;
export type NewHorizontal = typeof horizontals.$inferInsert;

export const HorizontalCreateZ = z.object({
  name: z.string().min(1, 'Name is required'),
});

export type HorizontalCreateInput = z.infer<typeof HorizontalCreateZ>;
