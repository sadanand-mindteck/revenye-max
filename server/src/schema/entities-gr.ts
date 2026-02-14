import { z } from 'zod';
import { sqliteTable, text, } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const entitiesGr = sqliteTable("entities_gr", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
});


export type EntityGr = typeof entitiesGr.$inferSelect;
export type NewEntityGr = typeof entitiesGr.$inferInsert;

export const EntityGrCreateZ = z.object({
  name: z.string().min(1, 'Name is required'),
});

export type EntityGrCreateInput = z.infer<typeof EntityGrCreateZ>;
