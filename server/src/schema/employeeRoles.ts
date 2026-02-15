import { z } from 'zod';
import { pgTable, text, integer, serial } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { employees } from './employees';
import { roles } from './roles';

export const employeeRoles = pgTable('employee_roles', {
  id: serial('id').primaryKey(),
  employeeId: integer('employee_id').notNull().references(() => employees.id),
  roleId: integer('role_id').notNull().references(() => roles.id),
});

export type EmployeeRole = typeof employeeRoles.$inferSelect;
export type NewEmployeeRole = typeof employeeRoles.$inferInsert;

export const EmployeeRoleCreateZ = z.object({
  employeeId: z.number().int().min(1, 'Employee ID is required'),
  roleId: z.number().int().min(1, 'Role ID is required'),
});

export type EmployeeRoleCreateInput = z.infer<typeof EmployeeRoleCreateZ>;
