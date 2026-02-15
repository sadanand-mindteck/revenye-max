import { FastifyInstance } from "fastify";
import ExcelJS from "exceljs";
import { log } from "console";

export function createExcelUploadRoute(server: FastifyInstance) {

  server.post("/upload-excel", async (request, reply) => {
  const parts = request.parts();

  let session: string | undefined;
  let fileBuffer: Buffer | undefined;

  for await (const part of parts) {
    if (part.type === "file") {
      fileBuffer = await part.toBuffer();
    }

    if (part.type === "field" && part.fieldname === "session") {
      session = part.value as string;
    }
  }

  if (!fileBuffer) {
    return reply.status(400).send({ message: "No file uploaded" });
  }

  console.log("Session Year:", session);

  const workbook = new ExcelJS.Workbook();
  //@ts-ignore
  await workbook.xlsx.load(fileBuffer);

  const worksheet = workbook.getWorksheet(1);

  if (!worksheet) {
    return reply.status(400).send({ message: "No worksheet found" });
  }

  const rows: any[] = [];

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber <= 2) return; // skip header rows

    const rowData: any[] = [];

    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      rowData[colNumber - 1] = cell.value;
    });

    rows.push(rowData);
  });
  // log("Extracted Rows:", rows);

  return reply.send({
    message: "File processed successfully",
    session: session,
    totalRows: rows.length,
  });
});

}
