import { z } from 'zod';
import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const roles = sqliteTable('roles', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
});

export type Role = typeof roles.$inferSelect;
export type NewRole = typeof roles.$inferInsert;

export const RoleCreateZ = z.object({
  name: z.string().min(1, 'Name is required'),
});

export type RoleCreateInput = z.infer<typeof RoleCreateZ>;
