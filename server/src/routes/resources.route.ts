import { FastifyInstance } from "fastify";
import { ResourceCreateZ, resources } from "../schema";
import { createMasterCrud } from "./master";

export default async function (server: FastifyInstance) {
  createMasterCrud({
    server,
    table: resources,
    createSchema: ResourceCreateZ,
    entityName: "Resource",
  });
}
