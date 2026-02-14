import { FastifyInstance } from "fastify";
import { HorizontalCreateZ, horizontals } from "../schema";
import { createMasterCrud } from "./master";

export default async function (server: FastifyInstance) {
  createMasterCrud({
    server,
    table: horizontals,
    createSchema: HorizontalCreateZ,
    entityName: "Horizontal",
  });
}
