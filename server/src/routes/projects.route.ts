import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod/dist/cjs/core.cjs";
import { and, eq, inArray, sql } from "drizzle-orm";
import { z } from "zod";
import {
  businessTypes,
  customers,
  dealTypes,
  employees,
  projects,
  regions,
  revenue,
  ProjectCreateZ,
} from "../schema";
import { createMasterCrud } from "./master";

export default async function (server: FastifyInstance) {
  createMasterCrud({
    server,
    table: projects,
    createSchema: ProjectCreateZ,
    entityName: "Project",
  });

  const typed = server.withTypeProvider<ZodTypeProvider>();

  typed.get(
    "/summary",
    {
      schema: {
        querystring: z.object({
          financialYear: z.string().optional(),
        }),
      },
    },
    async (request) => {
      const { financialYear } = request.query;
      const revenueJoin = financialYear
        ? and(eq(revenue.projectId, projects.id), eq(revenue.financialYear, financialYear))
        : eq(revenue.projectId, projects.id);

      const rows = await server.db.pg
        .select({
          id: projects.id,
          projectName: projects.name,
          projectType: projects.projectType,
          status: projects.status,
          customerName: customers.name,
          regionName: regions.name,
          dealTypeName: dealTypes.name,
          businessTypeName: businessTypes.name,
          bdmId: projects.bdmId,
          fyForecast: sql<number>`coalesce(sum(${revenue.forecast}), 0)`,
          fyActual: sql<number>`coalesce(sum(${revenue.actual}), 0)`,
          fyBudget: sql<number>`coalesce(sum(${revenue.budget}), 0)`,
        })
        .from(projects)
        .leftJoin(customers, eq(projects.customerId, customers.id))
        .leftJoin(regions, eq(projects.regionId, regions.id))
        .leftJoin(dealTypes, eq(projects.dealTypeId, dealTypes.id))
        .leftJoin(businessTypes, eq(projects.businessTypeId, businessTypes.id))
        .leftJoin(revenue, revenueJoin)
        .groupBy(
          projects.id,
          customers.name,
          regions.name,
          dealTypes.name,
          businessTypes.name,
          projects.name,
          projects.projectType,
          projects.status,
          projects.bdmId,
        );

      const bdmIds = Array.from(new Set(rows.map((row) => row.bdmId).filter((id) => id != null))) as number[];
      const bdmMap = bdmIds.length
        ? await server.db.pg
            .select({ id: employees.id, name: employees.name })
            .from(employees)
            .where(inArray(employees.id, bdmIds))
            .then((items) => new Map(items.map((item) => [item.id, item.name])))
        : new Map<number, string>();

      return rows.map((row) => ({
        id: row.id,
        projectName: row.projectName,
        projectType: row.projectType,
        status: row.status ?? "In Progress",
        customer: row.customerName ?? "",
        region: row.regionName ?? "",
        dealType: row.dealTypeName ?? "",
        businessType: row.businessTypeName ?? "",
        bdm: row.bdmId ? bdmMap.get(row.bdmId) ?? "" : "",
        fyForecast: Number(row.fyForecast ?? 0),
        fyActual: Number(row.fyActual ?? 0),
        fyBudget: Number(row.fyBudget ?? 0),
      }));
    },
  );

  typed.get(
    "/entry-options",
    async () => {
      const rows = await server.db.pg
        .select({
          id: projects.id,
          projectName: projects.name,
          customerName: customers.name,
          regionName: regions.name,
          bdmId: projects.bdmId,
        })
        .from(projects)
        .leftJoin(customers, eq(projects.customerId, customers.id))
        .leftJoin(regions, eq(projects.regionId, regions.id));

      const bdmIds = Array.from(new Set(rows.map((row) => row.bdmId).filter((id) => id != null))) as number[];
      const bdmMap = bdmIds.length
        ? await server.db.pg
            .select({ id: employees.id, name: employees.name })
            .from(employees)
            .where(inArray(employees.id, bdmIds))
            .then((items) => new Map(items.map((item) => [item.id, item.name])))
        : new Map<number, string>();

      return rows.map((row) => ({
        id: row.id,
        projectName: row.projectName ?? "",
        customer: row.customerName ?? "",
        region: row.regionName ?? "",
        bdm: row.bdmId ? bdmMap.get(row.bdmId) ?? "" : "",
      }));
    },
  );

  typed.get(
    "/:id/entry",
    {
      schema: {
        params: z.object({ id: z.coerce.number() }),
        querystring: z.object({
          financialYear: z.string().optional(),
        }),
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const { financialYear } = request.query;

      const project = await server.db.pg
        .select()
        .from(projects)
        .where(eq(projects.id, id))
        .then((rows) => rows[0]);

      if (!project) {
        return reply.status(404).send({ message: "Project not found" });
      }

      const resolveNameById = async (table: any, rowId?: number | null) => {
        if (!rowId) return "";
        return server.db.pg
          .select({ name: table.name })
          .from(table)
          .where(eq(table.id, rowId))
          .then((rows) => rows[0]?.name ?? "");
      };

      const [
        customerName,
        regionName,
        dealTypeName,
        businessTypeName,
        practiceHeadName,
        bdmName,
        buHeadName,
      ] = await Promise.all([
        resolveNameById(customers, project.customerId),
        resolveNameById(regions, project.regionId),
        resolveNameById(dealTypes, project.dealTypeId),
        resolveNameById(businessTypes, project.businessTypeId),
        resolveNameById(employees, project.practiceHeadId),
        resolveNameById(employees, project.bdmId),
        resolveNameById(employees, project.buHeadId),
      ]);

      const revenueRows = await server.db.pg
        .select({
          financialMonth: revenue.financialMonth,
          forecast: revenue.forecast,
          actual: revenue.actual,
          budget: revenue.budget,
        })
        .from(revenue)
        .where(
          financialYear
            ? and(eq(revenue.projectId, id), eq(revenue.financialYear, financialYear))
            : eq(revenue.projectId, id),
        );

      const monthMap = new Map<number, { fct: number; act: number; bgt: number }>();
      revenueRows.forEach((row) => {
        monthMap.set(row.financialMonth, {
          fct: Number(row.forecast ?? 0),
          act: Number(row.actual ?? 0),
          bgt: Number(row.budget ?? 0),
        });
      });

      const months = [
        { month: 1, name: "April" },
        { month: 2, name: "May" },
        { month: 3, name: "June" },
        { month: 4, name: "July" },
        { month: 5, name: "August" },
        { month: 6, name: "September" },
        { month: 7, name: "October" },
        { month: 8, name: "November" },
        { month: 9, name: "December" },
        { month: 10, name: "January" },
        { month: 11, name: "February" },
        { month: 12, name: "March" },
      ];

      const monthly = months.reduce<Record<string, { fct: number; act: number; bgt: number }>>((acc, item) => {
        acc[item.name] = monthMap.get(item.month) ?? { fct: 0, act: 0, bgt: 0 };
        return acc;
      }, {});

      return {
        id: project.id,
        projectName: project.name ?? "",
        customer: customerName,
        region: regionName,
        buHead: buHeadName,
        projectType: project.projectType ?? "",
        dealType: dealTypeName,
        businessType: businessTypeName,
        practiceHead: practiceHeadName,
        bdm: bdmName,
        note: project.remarks ?? "",
        monthly,
      };
    },
  );

  typed.put(
    "/:id/entry",
    {
      schema: {
        params: z.object({ id: z.coerce.number() }),
        body: z.object({
          financialYear: z.string().min(1),
          note: z.string().optional(),
          monthly: z.record(z.string(), z.object({
            fct: z.number().optional(),
            act: z.number().optional(),
            bgt: z.number().optional(),
          })),
        }),
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const { financialYear, monthly, note } = request.body;

      const project = await server.db.pg
        .select({ id: projects.id })
        .from(projects)
        .where(eq(projects.id, id))
        .then((rows) => rows[0]);

      if (!project) {
        return reply.status(404).send({ message: "Project not found" });
      }

      if (typeof note === "string") {
        await server.db.pg
          .update(projects)
          .set({ remarks: note })
          .where(eq(projects.id, id));
      }

      const monthIndex: Record<string, number> = {
        April: 1,
        May: 2,
        June: 3,
        July: 4,
        August: 5,
        September: 6,
        October: 7,
        November: 8,
        December: 9,
        January: 10,
        February: 11,
        March: 12,
      };

      for (const [monthName, values] of Object.entries(monthly)) {
        const monthNumber = monthIndex[monthName];
        if (!monthNumber) continue;

        const existing = await server.db.pg
          .select({ id: revenue.id })
          .from(revenue)
          .where(
            and(
              eq(revenue.projectId, id),
              eq(revenue.financialYear, financialYear),
              eq(revenue.financialMonth, monthNumber),
            ),
          )
          .then((rows) => rows[0]);

        const nextValues = {
          forecast: values.fct ?? 0,
          actual: values.act ?? 0,
          budget: values.bgt ?? 0,
        };

        if (existing) {
          await server.db.pg
            .update(revenue)
            .set(nextValues)
            .where(eq(revenue.id, existing.id));
        } else {
          await server.db.pg
            .insert(revenue)
            .values({
              projectId: id,
              financialYear,
              financialMonth: monthNumber,
              ...nextValues,
            });
        }
      }

      return { message: "Entry saved" };
    },
  );
}
