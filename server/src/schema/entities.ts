import { z } from 'zod';
import { pgTable, text, integer, serial } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const entities = pgTable("entities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
});


export type Entity = typeof entities.$inferSelect;
export type NewEntity = typeof entities.$inferInsert;

export const EntityCreateZ = z.object({
  name: z.string().min(1, 'Name is required'),
});

export type EntityCreateInput = z.infer<typeof EntityCreateZ>;
