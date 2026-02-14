import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod/dist/cjs/core.cjs";
import { eq, like } from "drizzle-orm";
import { randomUUID } from "crypto";
import { z, ZodObject, ZodRawShape } from "zod";

export function createMasterCrud<
  TSchema extends ZodObject<ZodRawShape>
>({
  server,
  table,
  createSchema,
  entityName,
}: {
  server: FastifyInstance;
  table: any;
  createSchema: TSchema; // <-- strongly typed
  entityName: string;
}) {
  const typed = server.withTypeProvider<ZodTypeProvider>();

  // CREATE
  typed.post(
    "/",
    { schema: { body: createSchema } },
    async (request, reply) => {
      const body = request.body as z.infer<TSchema>;

      const newItem = {
        id: randomUUID(),
        ...body,
      };

      await server.db.sqlite.insert(table).values(newItem);

      return reply.status(201).send(newItem);
    }
  );

  // UPDATE
  typed.put(
    "/:id",
    {
      schema: {
        params: z.object({ id: z.string() }),
        body: createSchema.partial(),
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const body = request.body as Partial<z.infer<TSchema>>;

      const existing = await server.db.sqlite
        .select()
        .from(table)
        .where(eq(table.id, id));

      if (!existing) {
        return reply.status(404).send({
          message: `${entityName} not found`,
        });
      }

      await server.db.sqlite
        .update(table)
        .set({
          ...body,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(table.id, id));

      return { message: `${entityName} updated successfully` };
    }
  );

  // LIST
  typed.get(
    "/",
    {
      schema: {
        querystring: z.object({
          page: z.coerce.number().min(1).default(1),
          limit: z.coerce.number().min(1).max(100).default(10),
          search: z.string().optional(),
        }),
      },
    },
    async (request) => {
      const { page, limit, search } = request.query;
      const offset = (page - 1) * limit;

      const whereCondition = search
        ? like(table.name, `%${search}%`)
        : undefined;

      return server.db.sqlite
        .select()
        .from(table)
        .where(whereCondition)
        .limit(limit)
        .offset(offset);
    }
  );

  // GET BY ID
  typed.get(
    "/:id",
    {
      schema: {
        params: z.object({ id: z.string() }),
      },
    },
    async (request, reply) => {
      const item = await server.db.sqlite
        .select()
        .from(table)
        .where(eq(table.id, request.params.id));

      if (!item) {
        return reply.status(404).send({
          message: `${entityName} not found`,
        });
      }

      return item;
    }
  );

  // DELETE
  typed.delete(
    "/:id",
    {
      schema: {
        params: z.object({ id: z.string() }),
      },
    },
    async (request) => {
      await server.db.sqlite
        .delete(table)
        .where(eq(table.id, request.params.id));

      return { message: `${entityName} deleted successfully` };
    }
  );

  // OPTIONS
  server.get("/options", async () => {
    return server.db.sqlite
      .select({
        id: table.id,
        name: table.name,
      })
      .from(table)
      .orderBy(table.name);
  });
}
