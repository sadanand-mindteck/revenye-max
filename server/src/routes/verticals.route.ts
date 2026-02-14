import { FastifyInstance } from "fastify";
import { VerticalCreateZ, verticals } from "../schema";
import { createMasterCrud } from "./master";

export default async function (server: FastifyInstance) {
  createMasterCrud({
    server,
    table: verticals,
    createSchema: VerticalCreateZ,
    entityName: "Vertical",
  });
}
