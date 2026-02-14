import { FastifyInstance } from "fastify";
import { BusinessTypeCreateZ, businessTypes } from "../schema";
import { createMasterCrud } from "./master";

export default async function (server: FastifyInstance) {
  createMasterCrud({
    server,
    table: businessTypes,
    createSchema: BusinessTypeCreateZ,
    entityName: "BusinessType",
  });
}
