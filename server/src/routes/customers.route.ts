import { FastifyInstance } from "fastify";
import { CustomerCreateZ, customers } from "../schema";
import { createMasterCrud } from "./master";

export default async function (server: FastifyInstance) {
  createMasterCrud({
    server,
    table: customers,
    createSchema: CustomerCreateZ,
    entityName: "Customer",
  });
}
