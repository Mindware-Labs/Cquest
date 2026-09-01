import ExcelJS from "exceljs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { adminSessionOrNull } from "@/lib/auth-guard";
import { APPLICATION_STATUS_META, type ApplicationStatus } from "@/lib/applicationStatus";
import { getVacancyReportData } from "@/server/vacancyReport";
import { AVAILABILITY_OPTIONS, ENGLISH_OPTIONS, EXPERIENCE_OPTIONS, optionLabel } from "@/app/(site)/join-us/apply/data";

// Paleta de DISENIO.md / tokens.css, en hex: exceljs no lee custom properties CSS.
const BRAND = { petroleo: "3F738D", ink: "0D1E29", border: "E2DDD6", sunken: "F0EDE8", muted: "6B7280" };

const STATUS_COLOR: Record<ApplicationStatus, string> = {
  new: "3F738D",
  reviewing: "74C3D5",
  shortlisted: "6AAA00",
  rejected: "6B7280",
  hired: "3D7A2A",
};

const COLUMNS = [
  { header: "Name", width: 26 },
  { header: "Email", width: 30 },
  { header: "Phone", width: 18 },
  { header: "City", width: 20 },
  { header: "Experience", width: 18 },
  { header: "English", width: 16 },
  { header: "Availability", width: 16 },
  { header: "Status", width: 16 },
  { header: "Applied at", width: 14 },
];

const HEADER_ROW = 4;

/* No usa la server action de vacancies.ts: esa llama a requireAdmin(), que
   redirige, y un route handler no puede seguir un redirect de servidor.
   getVacancyReportData es la misma consulta sin esa guardia. */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  const session = await adminSessionOrNull();
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  const { id } = await params;
  if (!z.uuid().safeParse(id).success) return new NextResponse("Not found", { status: 404 });

  const report = await getVacancyReportData(id);
  if (!report) return new NextResponse("Not found", { status: 404 });

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Center Quest";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Candidates", {
    views: [{ state: "frozen", ySplit: HEADER_ROW }],
    pageSetup: { orientation: "landscape", fitToPage: true, fitToWidth: 1 },
  });

  COLUMNS.forEach((column, index) => {
    sheet.getColumn(index + 1).width = column.width;
  });

  // Título
  sheet.mergeCells(1, 1, 1, COLUMNS.length);
  const titleCell = sheet.getCell(1, 1);
  titleCell.value = `${report.vacancy.title} — Candidates report`;
  titleCell.font = { name: "Calibri", size: 16, bold: true, color: { argb: `FF${BRAND.ink}` } };
  sheet.getRow(1).height = 26;

  // Subtítulo: departamento, total, fecha de exportación.
  sheet.mergeCells(2, 1, 2, COLUMNS.length);
  const subtitleCell = sheet.getCell(2, 1);
  const department = report.vacancy.departmentLabel ?? "No department";
  const exportedAt = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  subtitleCell.value = `${department} · ${report.total} candidate${report.total === 1 ? "" : "s"} · exported ${exportedAt}`;
  subtitleCell.font = { name: "Calibri", size: 10.5, color: { argb: `FF${BRAND.muted}` } };
  sheet.getRow(2).height = 18;

  // Encabezado de tabla: relleno institucional, texto blanco.
  const headerRow = sheet.getRow(HEADER_ROW);
  COLUMNS.forEach((column, index) => {
    const cell = headerRow.getCell(index + 1);
    cell.value = column.header;
    cell.font = { name: "Calibri", size: 10.5, bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: `FF${BRAND.petroleo}` } };
    cell.alignment = { vertical: "middle" };
    cell.border = { bottom: { style: "medium", color: { argb: `FF${BRAND.petroleo}` } } };
  });
  headerRow.height = 20;

  // Filas de candidatos: cebra suave + el estado en su propio color de marca.
  report.candidates.forEach((candidate, index) => {
    const row = sheet.getRow(HEADER_ROW + 1 + index);
    row.getCell(1).value = candidate.fullName;
    row.getCell(2).value = candidate.email;
    row.getCell(3).value = candidate.phone;
    row.getCell(4).value = candidate.city;
    row.getCell(5).value = optionLabel(EXPERIENCE_OPTIONS, candidate.experience);
    row.getCell(6).value = optionLabel(ENGLISH_OPTIONS, candidate.english);
    row.getCell(7).value = optionLabel(AVAILABILITY_OPTIONS, candidate.availability);
    row.getCell(8).value = APPLICATION_STATUS_META[candidate.status].label;
    const appliedCell = row.getCell(9);
    appliedCell.value = new Date(candidate.createdAt);
    appliedCell.numFmt = "dd/mm/yyyy";

    const zebra = index % 2 === 1;
    for (let column = 1; column <= COLUMNS.length; column++) {
      const cell = row.getCell(column);
      cell.font = { name: "Calibri", size: 10.5, color: { argb: `FF${BRAND.ink}` } };
      cell.alignment = { vertical: "middle" };
      cell.border = { bottom: { style: "hair", color: { argb: `FF${BRAND.border}` } } };
      if (zebra) cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: `FF${BRAND.sunken}` } };
    }

    const statusCell = row.getCell(8);
    statusCell.font = { name: "Calibri", size: 10.5, bold: true, color: { argb: `FF${STATUS_COLOR[candidate.status]}` } };
  });

  if (report.candidates.length > 0) {
    sheet.autoFilter = {
      from: { row: HEADER_ROW, column: 1 },
      to: { row: HEADER_ROW + report.candidates.length, column: COLUMNS.length },
    };
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const ascii = report.vacancy.title.replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-+|-+$/g, "").toLowerCase() || "vacancy";

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${ascii}-candidates.xlsx"`,
      "Cache-Control": "private, no-store",
    },
  });
}
