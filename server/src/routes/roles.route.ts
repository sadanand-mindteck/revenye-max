import { FastifyInstance } from "fastify";
import { RoleCreateZ, roles } from "../schema";
import { createMasterCrud } from "./master";

export default async function (server: FastifyInstance) {
  createMasterCrud({
    server,
    table: roles,
    createSchema: RoleCreateZ,
    entityName: "Role",
  });
}
