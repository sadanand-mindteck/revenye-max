import { z } from 'zod';
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { mysqlTable, text as mysqlText, int as mysqlInt } from 'drizzle-orm/mysql-core';

/* =====================================================
   SQLite (Primary Write Database)
===================================================== */

export const sqliteDeals = sqliteTable('deals', {
  id: text('id').primaryKey(), // UUID string recommended
  projectName: text('project_name').notNull(),
  customer: text('customer').notNull(),
  region: text('region'),

  fyForecast: integer('fy_forecast'),
  fyBudget: integer('fy_budget'),
  fyActual: integer('fy_actual'),
  variance: integer('variance'),
});

/* =====================================================
   MySQL (Read Replica)
===================================================== */

export const mysqlDeals = mysqlTable('deals', {
  id: mysqlText('id').primaryKey(),
  projectName: mysqlText('project_name').notNull(),
  customer: mysqlText('customer').notNull(),
  region: mysqlText('region'),

  fyForecast: mysqlInt('fy_forecast'),
  fyBudget: mysqlInt('fy_budget'),
  fyActual: mysqlInt('fy_actual'),
  variance: mysqlInt('variance'),
});

/* =====================================================
   Types (Modern Drizzle Way)
===================================================== */

// SELECT type
export type Deal = typeof sqliteDeals.$inferSelect;

// INSERT type
export type NewDeal = typeof sqliteDeals.$inferInsert;

// MySQL read type
export type DealReplica = typeof mysqlDeals.$inferSelect;

/* =====================================================
   Zod Validation Schemas
===================================================== */

export const DealCreateZ = z.object({
  projectName: z.string().min(1, 'Project name is required'),
  customer: z.string().min(1, 'Customer is required'),
  region: z.string().optional(),

  fyForecast: z.number().optional().default(0),
  fyBudget: z.number().optional().default(0),
  fyActual: z.number().optional().default(0),
});

export type DealCreateInput = z.infer<typeof DealCreateZ>;
