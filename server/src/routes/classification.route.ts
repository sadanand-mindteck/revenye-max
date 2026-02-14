import { FastifyInstance } from "fastify";
import { ClassificationCreateZ, classifications } from "../schema";
import { createMasterCrud } from "./master";

export default async function (server: FastifyInstance) {
  createMasterCrud({
    server,
    table: classifications,
    createSchema: ClassificationCreateZ,
    entityName: "Classification",
  });
}
