import { sql } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { z } from "zod";
import { employees } from "./employees";

/* =====================================================
   Projects
===================================================== */

export const projects = sqliteTable("projects", {
  id: text("id").primaryKey(), 
  projectCode: text("project_code"), // optional internal code
  name: text("name").notNull(),
  customerName: text("customer_name").notNull(),
  vertical: text("vertical"),
  horizontal: text("horizontal"),
  businessType: text("business_type"),
  practiceHeadId: text("practice_head_id").references(() => employees.id),
  bdmId: text("bdm_id").references(() => employees.id),
  geoHeadId: text("geo_head_id").references(() => employees.id),
  buHeadId: text("bu_head_id").references(() => employees.id),
  startDate: text("start_date"),
  endDate: text("end_date"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

export const ProjectCreateZ = z.object({
  projectCode: z.string().optional(),
  name: z.string().min(1),

  customerName: z.string().min(1),

  vertical: z.string().optional(),
  horizontal: z.string().optional(),
  businessType: z.string().optional(),

  practiceHeadId: z.string().optional(),
  bdmId: z.string().optional(),
  geoHeadId: z.string().optional(),
  buHeadId: z.string().optional(),

  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type ProjectCreateInput = z.infer<typeof ProjectCreateZ>;
