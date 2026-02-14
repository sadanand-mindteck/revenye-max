import { FastifyInstance } from "fastify";
import { EntityGrCreateZ, entitiesGr } from "../schema";
import { createMasterCrud } from "./master";

export default async function (server: FastifyInstance) {
  createMasterCrud({
    server,
    table: entitiesGr,
    createSchema: EntityGrCreateZ,
    entityName: "EntityGr",
  });
}
