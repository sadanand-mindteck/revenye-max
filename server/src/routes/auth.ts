import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { PasswordHash } from '../utils/password';

const RegisterSchema = z.object({
  name: z.string().min(1),
  email: z.email(),
  password: z.string().min(6)
});

const LoginSchema = z.object({
  email: z.email(),
  password: z.string().min(1)
});

export default async function (server: FastifyInstance) {
  // register user (writes go to sqlite)
  server.post('/register', async (request, reply) => {
    const parsed = RegisterSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.format() });

    const dbs = (server as any).db;
    if (!dbs || !dbs.sqlite) return reply.code(500).send({ error: 'sqlite not initialized' });

    const { name, email, password } = parsed.data;
    const hashed = await PasswordHash.hash(password);

    try {
      // ensure users table exists for demo purposes
      const raw = dbs.sqlite.raw;
      raw.exec(`CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, name TEXT, email TEXT UNIQUE, password TEXT);`);
      const id = cryptoRandomId();
      const stmt = raw.prepare('INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)');
      stmt.run(id, name, email, hashed);
      const token = await (server as any).jwt.sign({ id, email });
      return reply.code(201).send({ id, token });
    } catch (err: any) {
      server.log.error(err);
      return reply.code(500).send({ error: err.message || 'register failed' });
    }
  });

  // login
  server.post('/login', async (request, reply) => {
    const parsed = LoginSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.format() });

    const dbs = (server as any).db;
    if (!dbs || !dbs.sqlite) return reply.code(500).send({ error: 'sqlite not initialized' });

    const { email, password } = parsed.data;
    try {
      const raw = dbs.sqlite.raw;
      const row = raw.prepare('SELECT id, password FROM users WHERE email = ?').get(email);
      if (!row) return reply.code(401).send({ error: 'invalid credentials' });
      const ok = await PasswordHash.compare(password, row.password);
      if (!ok) return reply.code(401).send({ error: 'invalid credentials' });
      const token = await (server as any).jwt.sign({ id: row.id, email });
      return reply.send({ token });
    } catch (err: any) {
      server.log.error(err);
      return reply.code(500).send({ error: err.message || 'login failed' });
    }
  });

  // simple me endpoint
  server.get('/me', { preValidation: [(server as any).jwt.verify] }, async (request, reply) => {
    // @ts-ignore
    const user = (request as any).user;
    return { user };
  });
}

function cryptoRandomId() {
  return Math.random().toString(36).slice(2, 10);
}
