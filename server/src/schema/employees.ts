import { z } from 'zod';
import { pgTable, text, integer, serial } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").unique(),
  employeeCode: text("employee_code"),
  password: text("password").notNull(),
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
  roles: z.array(z.number()).optional(),
});

export type EmployeeCreateInput = z.infer<typeof EmployeeCreateZ>;
