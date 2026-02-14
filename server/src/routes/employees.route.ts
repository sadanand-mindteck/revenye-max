import { FastifyInstance } from "fastify";
import { EmployeeCreateZ, employees } from "../schema";
import { createMasterCrud } from "./master";

export default async function (server: FastifyInstance) {
  createMasterCrud({
    server,
    table: employees,
    createSchema: EmployeeCreateZ,
    entityName: "Employee",
  });
}
