import { FastifyInstance } from "fastify";
import ExcelJS from "exceljs";

export function createExcelUploadRoute(server: FastifyInstance) {
  server.post("/upload-excel", async (request, reply) => {
    const data = await request.file();

    if (!data) {
      return reply.status(400).send({ message: "No file uploaded" });
    }

    const fileBuffer = await data.toBuffer();
    const safeBuffer = Buffer.from(fileBuffer);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(safeBuffer.buffer);

    const worksheet = workbook.getWorksheet(1); // first sheet

    if (!worksheet) {
      return reply.status(400).send({ message: "No worksheet found" });
    }

    const rows: any[] = [];

    worksheet.eachRow((row, rowNumber) => {
      // Skip header if needed
      if (rowNumber === 1) return;

      const rowData: any[] = [];

      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        rowData[colNumber - 1] = cell.value;
      });

      rows.push(rowData);
    });

    console.log(rows);
    return reply.send({ message: "File processed successfully", data: rows });
  });
}
