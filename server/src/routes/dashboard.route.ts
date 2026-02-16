import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod/dist/cjs/core.cjs";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { employees, projects, revenue } from "../schema";

export default async function (server: FastifyInstance) {
  const typed = server.withTypeProvider<ZodTypeProvider>();

  typed.get(
    "/trends",
    {
      schema: {
        querystring: z.object({
          financialYear: z.string().optional(),
        }),
      },
    },
    async (request) => {
      const { financialYear } = request.query;

      const rows = await server.db.pg
        .select({
          financialMonth: revenue.financialMonth,
          forecastSum: sql<number>`coalesce(sum(${revenue.forecast}), 0)`,
          actualSum: sql<number>`coalesce(sum(${revenue.actual}), 0)`,
          budgetSum: sql<number>`coalesce(sum(${revenue.budget}), 0)`,
        })
        .from(revenue)
        .where(financialYear ? eq(revenue.financialYear, financialYear) : undefined)
        .groupBy(revenue.financialMonth)
        .orderBy(revenue.financialMonth);

      const monthNames: Record<number, string> = {
        1: "Apr",
        2: "May",
        3: "Jun",
        4: "Jul",
        5: "Aug",
        6: "Sep",
        7: "Oct",
        8: "Nov",
        9: "Dec",
        10: "Jan",
        11: "Feb",
        12: "Mar",
      };

      const rowMap = new Map<number, { fct: number; act: number; bgt: number }>();
      rows.forEach((row) => {
        rowMap.set(row.financialMonth, {
          fct: Number(row.forecastSum ?? 0),
          act: Number(row.actualSum ?? 0),
          bgt: Number(row.budgetSum ?? 0),
        });
      });

      return Object.entries(monthNames).map(([monthKey, label]) => {
        const monthNumber = Number(monthKey);
        const values = rowMap.get(monthNumber) ?? { fct: 0, act: 0, bgt: 0 };
        return { name: label, ...values };
      });
    },
  );

  typed.get(
    "/summary",
    {
      schema: {
        querystring: z.object({
          financialYear: z.string().optional(),
          role: z.string().optional(),
          userId: z.coerce.number().optional(),
        }),
      },
    },
    async (request) => {
      const { financialYear, role, userId } = request.query;

      const conditions = [] as Array<ReturnType<typeof eq>>;
      if (financialYear) conditions.push(eq(revenue.financialYear, financialYear));

      if (userId && role) {
        if (role === "BDM") conditions.push(eq(projects.bdmId, userId));
        if (role === "BUH") conditions.push(eq(projects.buHeadId, userId));
        if (role === "PRACTICE_HEAD") conditions.push(eq(projects.practiceHeadId, userId));
      }

      const whereClause = conditions.length ? and(...conditions) : undefined;

      const totals = await server.db.pg
        .select({
          forecastSum: sql<number>`coalesce(sum(${revenue.forecast}), 0)`,
          actualSum: sql<number>`coalesce(sum(${revenue.actual}), 0)`,
          budgetSum: sql<number>`coalesce(sum(${revenue.budget}), 0)`,
        })
        .from(revenue)
        .leftJoin(projects, eq(revenue.projectId, projects.id))
        .where(whereClause)
        .then((rows) => rows[0]);

      const projectCount = await server.db.pg
        .select({ count: sql<number>`count(distinct ${projects.id})` })
        .from(projects)
        .leftJoin(revenue, eq(revenue.projectId, projects.id))
        .where(whereClause)
        .then((rows) => Number(rows[0]?.count ?? 0));

      const headcount = await server.db.pg
        .select({ count: sql<number>`count(*)` })
        .from(employees)
        .then((rows) => Number(rows[0]?.count ?? 0));

      const totalRevenue = Number(totals?.actualSum ?? 0);
      const totalForecast = Number(totals?.forecastSum ?? 0);
      const totalBudget = Number(totals?.budgetSum ?? 0);
      const operatingMargin = totalRevenue === 0
        ? 0
        : Number((((totalRevenue - totalBudget) / totalRevenue) * 100).toFixed(2));

      const avgForecastPerProject = projectCount === 0
        ? 0
        : Number((totalForecast / projectCount).toFixed(2));

      return {
        totalRevenue,
        operatingMargin,
        totalHeadcount: headcount,
        pipelineValue: totalForecast,
        projectCount,
        avgForecastPerProject,
      };
    },
  );
}
