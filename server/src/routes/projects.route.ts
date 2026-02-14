import { FastifyInstance } from "fastify";
import { ProjectCreateZ, projects } from "../schema";
import { createMasterCrud } from "./master";

export default async function (server: FastifyInstance) {
  createMasterCrud({
    server,
    table: projects,
    createSchema: ProjectCreateZ,
    entityName: "Project",
  });
}
