import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { z } from "zod";
import { projects } from './projects';

/* =====================================================
   Project Revenue (Transactional)
===================================================== */

export const revenue = sqliteTable("revenue", {
  id: text("id").primaryKey(),

  projectId: text("project_id")
    .notNull()
    .references(() => projects.id),

  financialYear: text("financial_year").notNull(), 
  // Example: 2025-26

  financialMonth: integer("financial_month").notNull(),
  // 1 = April
  // 2 = May
  // ...
  // 12 = March

  forecast: real("forecast").default(0),
  actual: real("actual").default(0),
  budget: real("budget").default(0),

});


export type Revenue = typeof revenue.$inferSelect;
export type NewRevenue = typeof revenue.$inferInsert;

export const RevenueCreateZ = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  financialYear: z.string().min(1, 'Financial Year is required'),
  financialMonth: z.number().int().min(1).max(12, 'Financial Month must be between 1 and 12'),
  forecast: z.number().optional(),
  actual: z.number().optional(),
  budget: z.number().optional(),
});

export type RevenueCreateInput = z.infer<typeof RevenueCreateZ>;
