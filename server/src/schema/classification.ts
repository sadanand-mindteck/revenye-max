import { z } from 'zod';
import { sqliteTable, text, } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const classifications = sqliteTable("classifications", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
});


export type Classification = typeof classifications.$inferSelect;
export type NewClassification = typeof classifications.$inferInsert;

export const ClassificationCreateZ = z.object({
  name: z.string().min(1, 'Name is required'),
});

export type ClassificationCreateInput = z.infer<typeof ClassificationCreateZ>;
