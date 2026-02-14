import { z } from 'zod';
import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { employees } from './employees';
import { roles } from './roles';

export const employeeRoles = sqliteTable('employee_roles', {
  id: text('id').primaryKey(),
  employeeId: text('employee_id').notNull().references(() => employees.id),
  roleId: text('role_id').notNull().references(() => roles.id),
});

export type EmployeeRole = typeof employeeRoles.$inferSelect;
export type NewEmployeeRole = typeof employeeRoles.$inferInsert;

export const EmployeeRoleCreateZ = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  roleId: z.string().min(1, 'Role ID is required'),
});

export type EmployeeRoleCreateInput = z.infer<typeof EmployeeRoleCreateZ>;
