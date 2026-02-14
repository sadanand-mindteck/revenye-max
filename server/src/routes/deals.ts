import { FastifyInstance } from "fastify";
import { z } from "zod/v4";
import { v4 as uuidv4 } from "uuid";
import { DealCreateZ, sqliteDeals } from "../schema";
import type { ZodTypeProvider } from "fastify-type-provider-zod";

const DealCreateSchema = z.object({
  projectName: z.string().min(1),
  customer: z.string().min(1),
  region: z.string().optional(),
  fyForecast: z.number().optional().default(0),
  fyBudget: z.number().optional().default(0),
  fyActual: z.number().optional().default(0),
});

export default async function dealsRoutes(server: FastifyInstance) {
  // GET /api/deals - returns rows from sqlite demo table
  server.get("/", async (request, reply) => {
    const { sqlite, mysql } = server.db;

    if (!sqlite && !mysql) {
      return reply.code(500).send({
        error: "Databases not initialized",
      });
    }

    // Prefer MySQL if available
    if (mysql) {
      return {
        source: "mysql",
        ok: true,
      };
    }

    // Fallback to SQLite
    try {
      const rows = await sqlite.select().from(sqliteDeals);

      return {
        source: "sqlite",
        data: rows,
      };
    } catch (err) {
      request.log.error(err);
      throw err; // let global handler manage
    }
  });

  // POST /api/deals
  server.withTypeProvider<ZodTypeProvider>().post(
    "/",
    {
      schema: {
        body: DealCreateZ,
      },
    },
    async (request, reply) => {
      const body = request.body;

      const id = uuidv4();

      const variance = (body.fyForecast ?? 0) - (body.fyBudget ?? 0);

      await server.db.sqlite.insert(sqliteDeals).values({
        id,
        ...body,
        region: body.region ?? null,
        fyForecast: body.fyForecast ?? 0,
        fyBudget: body.fyBudget ?? 0,
        fyActual: body.fyActual ?? 0,
        variance,
      });

      return reply.code(201).send({ id });
    },
  );
}
