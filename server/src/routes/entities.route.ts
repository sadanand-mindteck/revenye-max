import { FastifyInstance } from "fastify";
import { EntityCreateZ, entities } from "../schema";
import { createMasterCrud } from "./master";

export default async function (server: FastifyInstance) {
  createMasterCrud({
    server,
    table: entities,
    createSchema: EntityCreateZ,
    entityName: "Entity",
  });
}
