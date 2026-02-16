import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod/dist/cjs/core.cjs";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { revenue } from "../schema";

export default async function (server: FastifyInstance) {
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

      const halfExpr = sql<string>`case when ${revenue.financialMonth} <= 6 then 'H1' else 'H2' end`;

      const rows = await server.db.pg
        .select({
          financialYear: revenue.financialYear,
          half: halfExpr,
          revenueSum: sql<number>`coalesce(sum(${revenue.forecast}), 0)`,
          profitSum: sql<number>`coalesce(sum(${revenue.actual}) - sum(${revenue.budget}), 0)`,
        })
        .from(revenue)
        .where(financialYear ? eq(revenue.financialYear, financialYear) : undefined)
        .groupBy(revenue.financialYear, halfExpr)
        .orderBy(revenue.financialYear, halfExpr);

      return rows.map((row) => {
        const revenueValue = Number(row.revenueSum ?? 0);
        const profitValue = Number(row.profitSum ?? 0);
        const marginValue = revenueValue === 0 ? 0 : Number(((profitValue / revenueValue) * 100).toFixed(2));

        return {
          period: `${row.financialYear}-${row.half}`,
          revenue: revenueValue,
          profit: profitValue,
          margin: marginValue,
        };
      });
    },
  );
}
