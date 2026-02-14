import { FastifyInstance } from 'fastify';

export default async function (server: FastifyInstance) {
  server.get('/', async (request, reply) => {
    return { ok: true, env: process.env.NODE_ENV || 'development' };
  });
}
