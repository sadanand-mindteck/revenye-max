import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";


export async function authPlugin(server: FastifyInstance) {
  // 🔐 JWT Verification Hook
  // server.decorate(
  //   "authenticate",
  //   async function (request: FastifyRequest, reply: FastifyReply) {
  //     try {
  //       await request.jwtVerify();
  //     } catch (err) {
  //       return reply.code(401).send({ message: "Unauthorized" });
  //     }
  //   }
  // );

  // 🔐 Role-based Authorization Decorator
  server.decorate(
    "authorize",
    (roles: string[]) =>
      async (request: FastifyRequest, reply: FastifyReply) => {
        if (!request.user || !request.user.roles || !roles.some(role => request.user.roles.includes(role))) {
          return reply.code(403).send({ message: "Forbidden" });
        }
      }
  );
}
