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
import { businessTypes } from "./businessTypes";

/* =====================================================
   Projects
===================================================== */

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name"),
  classification: text("classification").notNull(), // RoW or US
  projectType: text("project_type").notNull(), // PS or MS
  projectCustomerType: text("project_customer_type").notNull(), // EE, EN, NN

  regionId: integer("region_id").references(() => regions.id), 
  entityId: integer("entity_id").references(() => entities.id),
  entityGrId: integer("entity_gr_id").notNull().references(() => entitiesGr.id),
  dealTypeId: integer("deal_type_id").notNull().references(() => dealTypes.id), 
  verticalId: integer("vertical_id").references(() => verticals.id),
  horizontalId: integer("horizontal_id").references(() => horizontals.id),
  businessTypeId: integer("business_type_id").references(() => businessTypes.id),
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
  name: z.string().optional(),
  dealTypeId: z.number().int(),
  customerId: z.number().int(),
  resourceId: z.number().int().optional(),
  regionId: z.number().int().optional(),
  entityId: z.number().int().optional(),
  entityGrId: z.number().int(),
  classification: z.enum(["RoW", "US"]),
  verticalId: z.number().int().optional(),
  horizontalId: z.number().int().optional(),
  businessTypeId: z.number().int().optional(),
  projectType: z.enum(["PS", "MS"]),
  projectCustomerType: z.enum(["EE", "EN" , "NN"]),

  practiceHeadId: z.number().int().optional(),
  bdmId: z.number().int().optional(),
  geoHeadId: z.number().int().optional(),
  buHeadId: z.number().int().optional(),

  startDate: z.string().optional(),
  endDate: z.string().optional(),
  remarks: z.string().optional(),
});

export type ProjectCreateInput = z.infer<typeof ProjectCreateZ>;
