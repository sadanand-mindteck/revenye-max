import { z } from 'zod';
import { pgTable, text, integer, serial } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const entitiesGr = pgTable("entities_gr", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
});


export type EntityGr = typeof entitiesGr.$inferSelect;
export type NewEntityGr = typeof entitiesGr.$inferInsert;

export const EntityGrCreateZ = z.object({
  name: z.string().min(1, 'Name is required'),
});

export type EntityGrCreateInput = z.infer<typeof EntityGrCreateZ>;
