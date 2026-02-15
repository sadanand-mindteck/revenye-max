import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod/dist/cjs/core.cjs";
import { eq, like } from "drizzle-orm";
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

  function tryParseRoles(obj: any) {
    if (!obj || typeof obj !== 'object') return obj;
    if (typeof obj.roles === 'string') {
      try {
        obj.roles = JSON.parse(obj.roles);
      } catch (e) {
        // leave as-is
      }
    }
    return obj;
  }

  // CREATE
  typed.post(
    "/",
    { schema: { body: createSchema } },
    async (request, reply) => {
      const body = request.body as z.infer<TSchema>;

      const newItem: any = {
        ...body,
      };

      if (Array.isArray(newItem.roles)) newItem.roles = JSON.stringify(newItem.roles);

      const inserted = await (server as any).db.pg.insert(table).values(newItem).returning();
      const resp = inserted && inserted.length > 0 ? tryParseRoles(inserted[0]) : tryParseRoles(newItem);
      return reply.status(201).send(resp);
    }
  );

  // UPDATE
  typed.put(
    "/:id",
    {
      schema: {
        params: z.object({ id: z.coerce.number() }),
        body: createSchema.partial(),
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const body = request.body as Partial<z.infer<TSchema>>;

      const existing = await (server as any).db.pg
        .select()
        .from(table)
        .where(eq(table.id, id));
      if (!existing || (Array.isArray(existing) && existing.length === 0)) {
        return reply.status(404).send({ message: `${entityName} not found` });
      }

      const setData: any = { ...body, updatedAt: new Date().toISOString() };
      if (Array.isArray(setData.roles)) setData.roles = JSON.stringify(setData.roles);

      await (server as any).db.pg.update(table).set(setData).where(eq(table.id, id));

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

      return server.db.pg
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
        params: z.object({ id: z.coerce.number() }),
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const item = await (server as any).db.pg
        .select()
        .from(table)
        .where(eq(table.id, id));

      if (!item || (Array.isArray(item) && item.length === 0)) {
        return reply.status(404).send({ message: `${entityName} not found` });
      }

      return tryParseRoles(item[0] ?? item);
    }
  );

  // DELETE
  typed.delete(
    "/:id",
    {
      schema: {
        params: z.object({ id: z.coerce.number() }),
      },
    },
    async (request) => {
      const { id } = request.params;
      await (server as any).db.pg.delete(table).where(eq(table.id, id));
      return { message: `${entityName} deleted successfully` };
    }
  );

  // OPTIONS
  server.get("/options", async () => {
    return server.db.pg
      .select({
        id: table.id,
        name: table.name,
      })
      .from(table)
      .orderBy(table.name);
  });
}
