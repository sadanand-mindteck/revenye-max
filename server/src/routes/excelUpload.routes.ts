import { FastifyInstance } from "fastify";
import ExcelJS from "exceljs";
import { eq } from "drizzle-orm";
import {
  customers,
  dealTypes,
  employees,
  entities,
  entitiesGr,
  horizontals,
  projects,
  resources,
  revenue,
  verticals,
} from "../schema";
import { log } from "node:console";

const DEFAULT_HEADERS = [
  "MS/PS", "Entity", "GR Entity", "ROW/US", "Resource ID", "Resource Name", "Deal Type", "EEENNN", "Bill Rate", "Start Date", "End Date",
  "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar","FY",
  "Customer Name", "Project Name", "Practice Head", "BDM", "GeoHead", "Vertical", "Horizontal"
];

export function createExcelUploadRoute(server: FastifyInstance) {
  server.post("/upload-excel", async (request, reply) => {
    const parts = request.parts();

    let session: string | undefined;
    let fileBuffer: Buffer | undefined;
    let mappedHeaders: Record<string, string> = {};

    for await (const part of parts) {
      if (part.type === "file") {
        fileBuffer = await part.toBuffer();
      }

      if (part.type === "field" && part.fieldname === "session") {
        session = part.value as string;
      }

      if (part.type === "field" && part.fieldname === "mappedHeaders") {
        mappedHeaders = JSON.parse(part.value as string);
      }
    }

    if (!fileBuffer) {
      return reply.status(400).send({ message: "No file uploaded" });
    }

    const workbook = new ExcelJS.Workbook();
    //@ts-ignore
    await workbook.xlsx.load(fileBuffer);

    const worksheet = workbook.getWorksheet(1);

    if (!worksheet) {
      return reply.status(400).send({ message: "No worksheet found" });
    }

    // Utility to get cell value by column letter
    function getCellValue(row: any, col: string) {
      return row.getCell(col).value;
    }

   
    const toText = (value: unknown) => {
      if (value === null || value === undefined) return "";
      if (typeof value === "object") {
        if ("text" in (value as { text?: unknown })) return String((value as { text?: unknown }).text ?? "");
        if ("result" in (value as { result?: unknown })) return String((value as { result?: unknown }).result ?? "");
      }
      return String(value);
    };

    const toNumber = (value: unknown) => {
      if (value === null || value === undefined || value === "") return null;
      if (typeof value === "number") return Number.isFinite(value) ? value : null;
      const parsed = Number(String(value).replace(/,/g, ""));
      return Number.isFinite(parsed) ? parsed : null;
    };

    const normalizeName = (value: unknown) => toText(value).trim();
    const isTbh = (value: unknown) => /tbh/i.test(normalizeName(value));
    const hasNewKeyword = (value: unknown) => /new/i.test(normalizeName(value));

    const resolveEmployeeId = async (value: unknown) => {
      const name = normalizeName(value);
      if (!name) return null;
      const row = await server.db.pg
        .select({ id: employees.id })
        .from(employees)
        .where(eq(employees.name, name))
        .then((rows) => rows[0]);
      return row?.id ?? null;
    };

    const resolveVerticalId = async (value: unknown) => {
      const name = normalizeName(value);
      if (!name) return null;
      const row = await server.db.pg
        .select({ id: verticals.id })
        .from(verticals)
        .where(eq(verticals.name, name))
        .then((rows) => rows[0]);
      return row?.id ?? null;
    };

    const resolveHorizontalId = async (value: unknown) => {
      const name = normalizeName(value);
      if (!name) return null;
      const row = await server.db.pg
        .select({ id: horizontals.id })
        .from(horizontals)
        .where(eq(horizontals.name, name))
        .then((rows) => rows[0]);
      return row?.id ?? null;
    };

    const randomSuffix = () => Math.random().toString(36).slice(2, 7).toUpperCase();

    for (let rowNumber = 4; rowNumber <= worksheet.rowCount; rowNumber += 1) {
      const row = worksheet.getRow(rowNumber);

 

      const msPs = getCellValue(row, mappedHeaders["MS/PS"]);
      const entity = getCellValue(row, mappedHeaders["Entity"]);
      const grEntity = getCellValue(row, mappedHeaders["GR Entity"]);
      const rowUs = getCellValue(row, mappedHeaders["ROW/US"]);
      const resourceId = getCellValue(row, mappedHeaders["Resource ID"]);
      const resourceName = getCellValue(row, mappedHeaders["Resource Name"]);
      const dealType = getCellValue(row, mappedHeaders["Deal Type"]);
      const eeEnNn = getCellValue(row, mappedHeaders["EEENNN"]);
      const billRate = getCellValue(row, mappedHeaders["Bill Rate"]);
      const startDate = getCellValue(row, mappedHeaders["Start Date"]);
      const endDate = getCellValue(row, mappedHeaders["End Date"]);
      const apr = getCellValue(row, mappedHeaders["Apr"]);
      const may = getCellValue(row, mappedHeaders["May"]);
      const jun = getCellValue(row, mappedHeaders["Jun"]);
      const jul = getCellValue(row, mappedHeaders["Jul"]);
      const aug = getCellValue(row, mappedHeaders["Aug"]);
      const sep = getCellValue(row, mappedHeaders["Sep"]);
      const oct = getCellValue(row, mappedHeaders["Oct"]);
      const nov = getCellValue(row, mappedHeaders["Nov"]);
      const dec = getCellValue(row, mappedHeaders["Dec"]);
      const jan = getCellValue(row, mappedHeaders["Jan"]);
      const feb = getCellValue(row, mappedHeaders["Feb"]);
      const mar = getCellValue(row, mappedHeaders["Mar"]);
      const customerName = getCellValue(row, mappedHeaders["Customer Name"]);
      const projectName = getCellValue(row, mappedHeaders["Project Name"]);
      const practiceHead = getCellValue(row, mappedHeaders["Practice Head"]);
      const bdm = getCellValue(row, mappedHeaders["BDM"]);
      const geoHead = getCellValue(row, mappedHeaders["GeoHead"]);
      const vertical = getCellValue(row, mappedHeaders["Vertical"]);
      const horizontal = getCellValue(row, mappedHeaders["Horizontal"]);
     
      if (msPs === "MS") {
        await (async () => {
            const baseCustomerName = normalizeName(customerName);
            if (!baseCustomerName) return;

            let customerId: number | null = null;
            
              const existingCustomer = await server.db.pg
                .select({ id: customers.id })
                .from(customers)
                .where(eq(customers.name, baseCustomerName))
                .then((rows) => rows[0]);
              customerId = existingCustomer?.id ?? null;
            

            if (!customerId) {
              const customerNameToSave = hasNewKeyword(baseCustomerName)
                ? `${baseCustomerName}-${randomSuffix()}`
                : baseCustomerName;
              const inserted = await server.db.pg
                .insert(customers)
                .values({ name: customerNameToSave })
                .returning({ id: customers.id });
              customerId = inserted[0]?.id ?? null;
            }

            if (!customerId) return;

            const entityIdRow = normalizeName(entity)
              ? await server.db.pg
                  .select({ id: entities.id })
                  .from(entities)
                  .where(eq(entities.name, normalizeName(entity)))
                  .then((rows) => rows[0])
              : null;

            const entityGrRow = await server.db.pg
              .select({ id: entitiesGr.id })
              .from(entitiesGr)
              .where(eq(entitiesGr.name, normalizeName(grEntity)))
              .then((rows) => rows[0]);

            if (!entityGrRow?.id) return;

            const dealTypeRow = await server.db.pg
              .select({ id: dealTypes.id })
              .from(dealTypes)
              .where(eq(dealTypes.name, normalizeName(dealType)))
              .then((rows) => rows[0]);

            if (!dealTypeRow?.id) return;

            const practiceHeadId = await resolveEmployeeId(practiceHead);
            const bdmId = isTbh(bdm) ? null : await resolveEmployeeId(bdm);
            const geoHeadId = isTbh(geoHead) ? null : await resolveEmployeeId(geoHead);

            const verticalId = isTbh(vertical) ? null : await resolveVerticalId(vertical);
            const horizontalId = isTbh(horizontal) ? null : await resolveHorizontalId(horizontal);

            const classification = normalizeName(rowUs).toUpperCase() === "US" ? "US" : "RoW";
            const projectType = normalizeName(msPs).toUpperCase() === "PS" ? "PS" : "MS";
            const projectCustomerType = normalizeName(eeEnNn).toUpperCase() as "EE" | "EN" | "NN";
            if (!projectCustomerType || !["EE", "EN", "NN"].includes(projectCustomerType)) return;

            const projectInserted = await server.db.pg
              .insert(projects)
              .values({
                name: normalizeName(projectName),
                classification,
                projectType,
                projectCustomerType,
                entityId: entityIdRow?.id ?? null,
                entityGrId: entityGrRow.id,
                dealTypeId: dealTypeRow.id,
                verticalId,
                horizontalId,
                customerId,
                practiceHeadId,
                bdmId,
                geoHeadId,
                startDate: normalizeName(startDate) || null,
                endDate: normalizeName(endDate) || null,
              })
              .returning({ id: projects.id });

            const projectId = projectInserted[0]?.id ?? null;
            if (!projectId || !session) return;

            const monthData = [
              { month: 1, value: apr },
              { month: 2, value: may },
              { month: 3, value: jun },
              { month: 4, value: jul },
              { month: 5, value: aug },
              { month: 6, value: sep },
              { month: 7, value: oct },
              { month: 8, value: nov },
              { month: 9, value: dec },
              { month: 10, value: jan },
              { month: 11, value: feb },
              { month: 12, value: mar },
            ];

            const revenueRows = monthData
              .map(({ month, value }) => ({ month, amount: toNumber(value) }))
              .filter((entry) => entry.amount !== null);

            if (revenueRows.length > 0) {
              await server.db.pg.insert(revenue).values(
                revenueRows.map((entry) => ({
                  projectId,
                  financialYear: session,
                  financialMonth: entry.month,
                  forecast: entry.amount ?? 0,
                })),
              );
            }
          })();
          log(`Processed row ${rowNumber} for MS project: ${toText(projectName)}`);
      }


      if (msPs === "PS") {
        const baseCustomerName = normalizeName(customerName);
        if (!baseCustomerName) return;

        let customerId: number | null = null;

        const existingCustomer = await server.db.pg
          .select({ id: customers.id })
          .from(customers)
          .where(eq(customers.name, baseCustomerName))
          .then((rows) => rows[0]);
        customerId = existingCustomer?.id ?? null;

        if (!customerId) {
          const customerNameToSave = hasNewKeyword(baseCustomerName)
            ? `${baseCustomerName}-${randomSuffix()}`
            : baseCustomerName;
          const inserted = await server.db.pg
            .insert(customers)
            .values({ name: customerNameToSave })
            .returning({ id: customers.id });
          customerId = inserted[0]?.id ?? null;
        }

        if (!customerId) return;

        const entityIdRow = normalizeName(entity)
          ? await server.db.pg
              .select({ id: entities.id })
              .from(entities)
              .where(eq(entities.name, normalizeName(entity)))
              .then((rows) => rows[0])
          : null;

        const entityGrRow = await server.db.pg
          .select({ id: entitiesGr.id })
          .from(entitiesGr)
          .where(eq(entitiesGr.name, normalizeName(grEntity)))
          .then((rows) => rows[0]);

        if (!entityGrRow?.id) return;

        const dealTypeRow = await server.db.pg
          .select({ id: dealTypes.id })
          .from(dealTypes)
          .where(eq(dealTypes.name, normalizeName(dealType)))
          .then((rows) => rows[0]);

        if (!dealTypeRow?.id) return;

        const practiceHeadId = await resolveEmployeeId(practiceHead);
        const bdmId = isTbh(bdm) ? null : await resolveEmployeeId(bdm);
        const geoHeadId = isTbh(geoHead) ? null : await resolveEmployeeId(geoHead);

        const verticalId = isTbh(vertical) ? null : await resolveVerticalId(vertical);
        const horizontalId = isTbh(horizontal) ? null : await resolveHorizontalId(horizontal);

        const classification = normalizeName(rowUs).toUpperCase() === "US" ? "US" : "RoW";
        const projectType = normalizeName(msPs).toUpperCase() === "PS" ? "PS" : "MS";
        const projectCustomerType = normalizeName(eeEnNn).toUpperCase() as "EE" | "EN" | "NN";
        if (!projectCustomerType || !["EE", "EN", "NN"].includes(projectCustomerType)) return;

        const baseProjectName = normalizeName(projectName);
        if (!baseProjectName) return;

        let projectId: number | null = null;
        if (!hasNewKeyword(baseProjectName)) {
          const existingProject = await server.db.pg
            .select({ id: projects.id })
            .from(projects)
            .where(eq(projects.name, baseProjectName))
            .then((rows) => rows[0]);
          projectId = existingProject?.id ?? null;
        }

        if (!projectId) {
          const projectNameToSave = hasNewKeyword(baseProjectName)
            ? `${baseProjectName}-${randomSuffix()}`
            : baseProjectName;
          const insertedProject = await server.db.pg
            .insert(projects)
            .values({
              name: projectNameToSave,
              classification,
              projectType,
              projectCustomerType,
              entityId: entityIdRow?.id ?? null,
              entityGrId: entityGrRow.id,
              dealTypeId: dealTypeRow.id,
              verticalId,
              horizontalId,
              customerId,
              practiceHeadId,
              bdmId,
              geoHeadId,
              startDate: normalizeName(startDate) || null,
              endDate: normalizeName(endDate) || null,
            })
            .returning({ id: projects.id });
          projectId = insertedProject[0]?.id ?? null;
        }

        if (!projectId) return;

        const resourceCodeRaw = normalizeName(resourceId);
        const resourceNameRaw = normalizeName(resourceName);
        const resourceCode = !resourceCodeRaw
          ? `RES-${randomSuffix()}`
          : hasNewKeyword(resourceCodeRaw)
            ? `${resourceCodeRaw}-${randomSuffix()}`
            : resourceCodeRaw;
        const resourceNameFinal = hasNewKeyword(resourceNameRaw)
          ? `${resourceNameRaw}-${randomSuffix()}`
          : resourceNameRaw || resourceCode;

        let resourceDbId: number | null = null;

        if (resourceNameFinal) {
          const existingByName = await server.db.pg
            .select({ id: resources.id, projectId: resources.projectId })
            .from(resources)
            .where(eq(resources.name, resourceNameFinal))
            .then((rows) => rows[0]);
          resourceDbId = existingByName?.id ?? null;
          if (resourceDbId && existingByName?.projectId !== projectId) {
            await server.db.pg
              .update(resources)
              .set({ projectId })
              .where(eq(resources.id, resourceDbId));
          }
        }

        if (!resourceDbId) {
          const existingByCode = await server.db.pg
            .select({ id: resources.id, projectId: resources.projectId })
            .from(resources)
            .where(eq(resources.employeeId, resourceCode))
            .then((rows) => rows[0]);
          resourceDbId = existingByCode?.id ?? null;
          if (resourceDbId && existingByCode?.projectId !== projectId) {
            await server.db.pg
              .update(resources)
              .set({ projectId })
              .where(eq(resources.id, resourceDbId));
          }
        }

        if (!resourceDbId) {
          const resourceInserted = await server.db.pg
            .insert(resources)
            .values({
              name: resourceNameFinal,
              employeeId: resourceCode,
              billRate: toNumber(billRate) ?? 0,
              projectId,
            })
            .returning({ id: resources.id });
          resourceDbId = resourceInserted[0]?.id ?? null;
        }

        if (!resourceDbId) return;

        log(`Processed row ${rowNumber} for PS project: ${toText(projectName)}`);
      }




    }

    return reply.send({
      message: "File processed successfully",
      session: session,
    });
  });
}
