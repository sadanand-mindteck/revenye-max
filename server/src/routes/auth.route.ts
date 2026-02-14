import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import Database from "better-sqlite3";
import { hashPassword, verifyPassword } from "../utils/password";
import { randomUUID } from "crypto";
import { EmployeeCreateZ, employees } from "../schema";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { eq } from "drizzle-orm";

const LoginSchema = z.object({
  name: z.string().min(1),
  password: z.string().min(1),
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

        const id = randomUUID();
        await server.db.sqlite.insert(employees).values({ id, name, email, employeeCode, password: hashed });


        return reply.code(201);
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
   
      const row = await server.db.sqlite.select().from(employees).where(eq(employees.name, name)).then(rows => rows[0]);
      if (!row) return reply.code(401).send({ error: "invalid credentials" });

      const ok = await verifyPassword(password, row.password);
      if (!ok) return reply.code(401).send({ error: "invalid credentials" });

      const token = await (server as any).jwt.sign({ id: row.id, email: row.email, roles: row.roles });
      return reply.send({ token });
    } catch (err: any) {
      server.log.error(err);
      return reply.code(500).send({ error: err.message || "login failed" });
    }
  });

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
      // @ts-ignore
      const user = (request as any).user;
      return { user };
    },
  );
}
