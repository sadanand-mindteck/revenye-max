import "fastify";
import "@fastify/jwt";
//
import type { AppDatabases } from "./db";

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (
      request: FastifyRequest,
      reply: FastifyReply
    ) => Promise<void>;

    authorize: (
      roles: string[]
    ) => (
      request: FastifyRequest,
      reply: FastifyReply
    ) => Promise<void>;

     db: AppDatabases;


    user: {
      id: string;
      email: string;
      role: string;
    };
}
}
// ✅ THIS is how fastify-jwt expects user typing
declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: {
      id: string;
      email: string;
      role: string;
    };
    user: {
      id: string;
      email: string;
      role: string;
    };
  }
}