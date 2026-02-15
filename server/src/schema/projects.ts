import { sql } from "drizzle-orm";
import { pgTable, text, integer, serial } from "drizzle-orm/pg-core";
import { z } from "zod";
import { employees } from "./employees";
import { customers } from "./customers";
import { verticals } from "./verticals";
import { horizontals } from "./horizontals";
import { resources } from "./resources";
import { dealTypes } from "./dealTypes";
import { entitiesGr } from "./entities-gr";
import { entities } from "./entities";
import { regions } from "./regions";

/* =====================================================
   Projects
===================================================== */

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  regionId: integer("region_id").notNull().references(() => regions.id), 
  entityId: integer("entity_id").notNull().references(() => entities.id),
  entityGrId: integer("entity_gr_id").notNull().references(() => entitiesGr.id),
  dealTypeId: integer("deal_type_id").notNull().references(() => dealTypes.id), 
  classification: text("classification").notNull(), // RoW or US
  verticalId: integer("vertical_id").notNull().references(() => verticals.id),
  horizontalId: integer("horizontal_id").notNull().references(() => horizontals.id),
  businessType: text("business_type").notNull(), // PS or MS
  resourceId: integer("resource_id").references(() => resources.id),
  customerId: integer("customer_id").notNull().references(() => customers.id),
  practiceHeadId: integer("practice_head_id").references(() => employees.id),
  bdmId: integer("bdm_id").references(() => employees.id),
  geoHeadId: integer("geo_head_id").references(() => employees.id),
  buHeadId: integer("bu_head_id").references(() => employees.id),
  startDate: text("start_date"),
  endDate: text("end_date"),
  remarks: text("remarks"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

export const ProjectCreateZ = z.object({
  name: z.string().min(1),
  dealTypeId: z.number().int(),
  customerId: z.number().int(),
  resourceId: z.number().int().optional(),
  regionId: z.number().int(),
  entityId: z.number().int(),
  entityGrId: z.number().int(),
  classification: z.enum(["RoW", "US"]),
  verticalId: z.number().int(),
  horizontalId: z.number().int(),
  businessType: z.enum(["PS", "MS"]),

  practiceHeadId: z.number().int().optional(),
  bdmId: z.number().int().optional(),
  geoHeadId: z.number().int().optional(),
  buHeadId: z.number().int().optional(),

  startDate: z.string(),
  endDate: z.string().optional(),
  remarks: z.string().optional(),
});

export type ProjectCreateInput = z.infer<typeof ProjectCreateZ>;
