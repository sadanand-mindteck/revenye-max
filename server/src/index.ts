import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import multipart from "@fastify/multipart";
import fastifyJwt from "@fastify/jwt";



import { initDatabases } from "./db";
import healthRoutes from "./routes/health";
import dealsRoutes from "./routes/deals";
import authRoutes from "./routes/auth";
import { authPlugin } from "./plugins/auth";
import { authenticate } from "./middleware/authenticate.middleware";
import { setupErrorHandler } from "./Error";

const server = Fastify({ logger: true });
// Add schema validator and serializer

async function start() {
  server.setValidatorCompiler(validatorCompiler);
  server.setSerializerCompiler(serializerCompiler);
  await server.register(cors, { origin: true });
  await server.register(multipart);
  await server.register(fastifyJwt, { secret: process.env.JWT_SECRET || "change-me" });

  // initialize DB connections before registering routes that depend on them
  const dbs = await initDatabases();

  // attach DB FIRST before auth plugin since some auth logic might depend on DB (e.g. fetching user roles)

  // Register Auth Plugin
  await server.register(authPlugin);

  // attach DB instances to server under `db`
  server.decorate("db", dbs);

  // Global onRequest hook to protect all routes except a few
  server.addHook("onRequest", async (request, reply) => {
    if (
      request.raw.url?.startsWith("/api/auth/login") ||
      request.raw.url?.startsWith("/api/auth/reset-password") ||
      request.raw.url?.startsWith("/docs")
    ) {
      return; // Skip auth for these
    }

    await authenticate(request, reply);
  });

  // Register centralized error handler
  setupErrorHandler(server);

  // Register routes
  server.register(healthRoutes, { prefix: "/api/health" });
  server.register(dealsRoutes, { prefix: "/api/deals" });
  server.register(authRoutes, { prefix: "/api/auth" });

  const port = Number(process.env.PORT || 5000);
  try {
    await server.listen({ port, host: "0.0.0.0" });
    server.log.info(`Server listening on ${port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

start();
