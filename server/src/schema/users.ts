import { z } from 'zod';
import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { mysqlTable, text as mysqlText } from 'drizzle-orm/mysql-core';
import { InferModel } from 'drizzle-orm';

export const sqliteUsers = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  password: text('password').notNull(),
});

export const mysqlUsers = mysqlTable('users', {
  id: mysqlText('id').primaryKey(),
  name: mysqlText('name').notNull(),
  email: mysqlText('email').notNull(),
  password: mysqlText('password').notNull(),
});

export type UserSqliteModel = InferModel<typeof sqliteUsers>;
export type UserMysqlModel = InferModel<typeof mysqlUsers>;

export const UserRegisterZ = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
});

export type UserRegisterInput = z.infer<typeof UserRegisterZ>;
