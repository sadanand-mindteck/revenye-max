import { z } from 'zod';
import { pgTable, text, integer, serial } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const roles = pgTable('roles', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
});

export type Role = typeof roles.$inferSelect;
export type NewRole = typeof roles.$inferInsert;

export const RoleCreateZ = z.object({
  name: z.string().min(1, 'Name is required'),
});

export type RoleCreateInput = z.infer<typeof RoleCreateZ>;
