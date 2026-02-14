import { FastifyInstance } from "fastify";
import { EmployeeRoleCreateZ, employeeRoles } from "../schema";
import { createMasterCrud } from "./master";

export default async function (server: FastifyInstance) {
  createMasterCrud({
    server,
    table: employeeRoles,
    createSchema: EmployeeRoleCreateZ,
    entityName: "EmployeeRole",
  });
}
