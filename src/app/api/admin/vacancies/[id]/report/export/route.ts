import { NextResponse } from "next/server";
import { z } from "zod";
import { adminSessionOrNull } from "@/lib/auth-guard";
import { APPLICATION_STATUS_EXCEL_COLOR, APPLICATION_STATUS_META } from "@/lib/applicationStatus";
import { buildStyledWorkbook, excelFilename, type ExcelColumn } from "@/lib/excelSheet";
import { getVacancyReportData, type VacancyReportCandidate } from "@/server/vacancyReport";
import { AVAILABILITY_OPTIONS, ENGLISH_OPTIONS, EXPERIENCE_OPTIONS, optionLabel } from "@/app/(site)/join-us/apply/data";

const COLUMNS: ExcelColumn<VacancyReportCandidate>[] = [
  { header: "Name", width: 26, value: (c) => c.fullName },
  { header: "Email", width: 30, value: (c) => c.email },
  { header: "Phone", width: 18, value: (c) => c.phone },
  { header: "City", width: 20, value: (c) => c.city },
  { header: "Experience", width: 18, value: (c) => optionLabel(EXPERIENCE_OPTIONS, c.experience) },
  { header: "English", width: 16, value: (c) => optionLabel(ENGLISH_OPTIONS, c.english) },
  { header: "Availability", width: 16, value: (c) => optionLabel(AVAILABILITY_OPTIONS, c.availability) },
  {
    header: "Status",
    width: 16,
    value: (c) => APPLICATION_STATUS_META[c.status].label,
    fontColor: (c) => APPLICATION_STATUS_EXCEL_COLOR[c.status],
  },
  { header: "Applied at", width: 14, value: (c) => new Date(c.createdAt), numFmt: "dd/mm/yyyy" },
];

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

  const exportedAt = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const buffer = await buildStyledWorkbook({
    sheetName: "Candidates",
    title: `${report.vacancy.title} — Candidates report`,
    subtitle: `${report.vacancy.departmentLabel ?? "No department"} · ${report.total} candidate${report.total === 1 ? "" : "s"} · exported ${exportedAt}`,
    columns: COLUMNS,
    rows: report.candidates,
  });

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${excelFilename(report.vacancy.title, "candidates")}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
