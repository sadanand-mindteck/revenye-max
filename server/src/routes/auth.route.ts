import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { hashPassword, verifyPassword } from "../utils/password";
import { EmployeeCreateZ, employeeRoles, employees, roles } from "../schema";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { eq } from "drizzle-orm";
import { addToBlacklist } from "../utils/helper";

const LoginSchema = z.object({
  name: z.string().min(1),
  password: z.string().min(1),
});

const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
});

export default async function (server: FastifyInstance) {
  // register user (writes go to sqlite only)
  server.withTypeProvider<ZodTypeProvider>().post(
    "/register",
    {
      schema: {
        body: EmployeeCreateZ.extend({ password: z.string().min(6) }),
      },
    },
    async (request, reply) => {

      const { name, email, password, employeeCode } = request.body;
      const hashed = await hashPassword(password);

      try {
        const inserted = await (server as any).db.pg.insert(employees).values({ name, email, employeeCode, password: hashed }).returning();
        const created = inserted && inserted.length > 0 ? inserted[0] : null;
        return reply.code(201).send(created ? { id: created.id } : {});
      } catch (err: any) {
        server.log.error(err);

        return reply.code(500).send({ error: err.message || "register failed" });
      }
    },
  );

  // login
  server.withTypeProvider<ZodTypeProvider>().post("/login",{
    schema: {
      body: LoginSchema,
    },
  }, async (request, reply) => {
    const { name, password } = request.body ;
    try {
    const row = await server.db.pg.select().from(employees).where(eq(employees.name, name)).then(rows => rows[0]);

      if (!row) return reply.code(401).send({ error: "invalid credentials" });

      const ok = await verifyPassword(password, row.password);
      if (!ok) return reply.code(401).send({ error: "invalid credentials" });

      const empRoles = await server.db.pg.select().from(employeeRoles).innerJoin(roles, eq(employeeRoles.roleId, roles.id)).where(eq(employeeRoles.employeeId, row.id)).then(rows => rows.map(r => r.roles.name));

      const token = server.jwt.sign({ id: row.id, name: row.name, roles: empRoles });
      return reply.send({ token, user: { id: row.id, name: row.name, email: row.email, employeeCode: row.employeeCode, roles: empRoles } });
    } catch (err: any) {
      server.log.error(err);
      return reply.code(500).send({ error: err.message || "login failed" });
    }
  });

  server.withTypeProvider<ZodTypeProvider>().post("/logout", async (request, reply) => {
    // with JWT, logout is typically handled client-side by deleting the token
    // optionally, you could implement token blacklisting here
    addToBlacklist(request.headers.authorization?.split(" ")[1] || "");

    return reply.send({ message: "logged out" });
  });

  server.withTypeProvider<ZodTypeProvider>().post(
    "/change-password",
    {
      schema: {
        body: ChangePasswordSchema,
      },
    },
    async (request, reply) => {
      try {
        const user = request.user;
        if (!user?.id) {
          return reply.code(401).send({ error: "Unauthorized" });
        }

        const { currentPassword, newPassword } = request.body;
        const row = await server.db.pg
          .select()
          .from(employees)
          .where(eq(employees.id, user.id))
          .then((rows) => rows[0]);

        if (!row) return reply.code(404).send({ error: "User not found" });

        const ok = await verifyPassword(currentPassword, row.password);
        if (!ok) return reply.code(401).send({ error: "Invalid current password" });

        const hashed = await hashPassword(newPassword);
        await server.db.pg
          .update(employees)
          .set({ password: hashed })
          .where(eq(employees.id, user.id));

        return reply.send({ message: "Password updated" });
      } catch (err: any) {
        server.log.error(err);
        return reply.code(500).send({ error: err.message || "change password failed" });
      }
    },
  );

  // simple me endpoint — verifies JWT and returns decoded token payload
  server.get(
    "/me",
    {
      preValidation: [
        async (request: FastifyRequest, reply: FastifyReply) => {
          await request.jwtVerify();
        },
      ],
    },
    async (request: FastifyRequest) => {
      // request.user is populated by fastify-jwt after jwtVerify
      const user = request.user;
      return { user };
    },
  );
}
