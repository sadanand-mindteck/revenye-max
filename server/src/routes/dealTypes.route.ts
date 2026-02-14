import { FastifyInstance } from "fastify";
import { DealTypesCreateZ, dealTypes } from "../schema";
import { createMasterCrud } from "./master";

export default async function (server: FastifyInstance) {
  createMasterCrud({
    server,
    table: dealTypes,
    createSchema: DealTypesCreateZ,
    entityName: "DealType",
  });
}
