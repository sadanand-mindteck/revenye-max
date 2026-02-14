import { z } from 'zod';
import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const employees = sqliteTable("employees", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").unique(),
  employeeCode: text("employee_code"),
  password: text("password").notNull(),
  // roles stored as JSON string (array of role IDs).
  // Prefer using the `employee_roles` join table to assign roles.
  // This column is kept for backward compatibility; default is empty array.
  roles: text("roles").notNull().default(sql`'[]'`),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export type Employee = typeof employees.$inferSelect;
export type NewEmployee = typeof employees.$inferInsert;

export const EmployeeCreateZ = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.email('Invalid email address').optional(),
  employeeCode: z.string().optional(),
  password: z.string().optional(),
  roles: z.array(z.string()).optional(),
});

export type EmployeeCreateInput = z.infer<typeof EmployeeCreateZ>;
