import { FastifyInstance } from "fastify";
import { RegionCreateZ, regions } from "../schema";
import { createMasterCrud } from "./master";

export default async function (server: FastifyInstance) {
  createMasterCrud({
    server,
    table: regions,
    createSchema: RegionCreateZ,
    entityName: "Region",
  });
}