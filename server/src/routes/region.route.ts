import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod/dist/cjs/core.cjs";
import { and, eq, inArray, sql } from "drizzle-orm";
import { z } from "zod";
import { employees, projects, RegionCreateZ, regions, revenue } from "../schema";
import { createMasterCrud } from "./master";

export default async function (server: FastifyInstance) {
  createMasterCrud({
    server,
    table: regions,
    createSchema: RegionCreateZ,
    entityName: "Region",
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
          projectId: projects.id,
          regionName: regions.name,
          buHeadId: projects.buHeadId,
          bdmId: projects.bdmId,
          fyForecast: sql<number>`coalesce(sum(${revenue.forecast}), 0)`,
        })
        .from(projects)
        .leftJoin(regions, eq(projects.regionId, regions.id))
        .leftJoin(revenue, revenueJoin)
        .groupBy(projects.id, regions.name, projects.buHeadId, projects.bdmId);

      const employeeIds = Array.from(
        new Set(
          rows.flatMap((row) => [row.buHeadId, row.bdmId]).filter((id) => id != null),
        ),
      ) as number[];

      const employeeMap = employeeIds.length
        ? await server.db.pg
            .select({ id: employees.id, name: employees.name })
            .from(employees)
            .where(inArray(employees.id, employeeIds))
            .then((items) => new Map(items.map((item) => [item.id, item.name])))
        : new Map<number, string>();

      return rows.map((row) => ({
        projectId: row.projectId,
        region: row.regionName ?? "",
        buHead: row.buHeadId ? employeeMap.get(row.buHeadId) ?? "" : "",
        bdm: row.bdmId ? employeeMap.get(row.bdmId) ?? "" : "",
        fyForecast: Number(row.fyForecast ?? 0),
      }));
    },
  );
}