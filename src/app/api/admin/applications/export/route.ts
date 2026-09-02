import { NextResponse } from "next/server";
import { adminSessionOrNull } from "@/lib/auth-guard";
import { APPLICATION_STATUS_EXCEL_COLOR, APPLICATION_STATUS_META } from "@/lib/applicationStatus";
import { buildStyledWorkbook, excelFilename, type ExcelColumn } from "@/lib/excelSheet";
import { getApplicationsForExport } from "@/server/applicationExport";
import type { ApplicationListRow } from "@/server/applicationQuery";
import { AVAILABILITY_OPTIONS, ENGLISH_OPTIONS, EXPERIENCE_OPTIONS, optionLabel } from "@/app/(site)/join-us/apply/data";

const COLUMNS: ExcelColumn<ApplicationListRow>[] = [
  { header: "Name", width: 24, value: (r) => r.fullName },
  { header: "Email", width: 28, value: (r) => r.email },
  { header: "Phone", width: 16, value: (r) => r.phone },
  { header: "City", width: 18, value: (r) => r.city },
  { header: "Applied for", width: 26, value: (r) => r.vacancyTitle ?? "Talent pool" },
  { header: "Department", width: 18, value: (r) => r.departmentLabel ?? "—" },
  { header: "Experience", width: 16, value: (r) => optionLabel(EXPERIENCE_OPTIONS, r.experience) },
  { header: "English", width: 14, value: (r) => optionLabel(ENGLISH_OPTIONS, r.english) },
  { header: "Availability", width: 14, value: (r) => optionLabel(AVAILABILITY_OPTIONS, r.availability) },
  {
    header: "Status",
    width: 14,
    value: (r) => APPLICATION_STATUS_META[r.status].label,
    fontColor: (r) => APPLICATION_STATUS_EXCEL_COLOR[r.status],
  },
  { header: "Source", width: 14, value: (r) => r.source || "Direct" },
  { header: "Applied at", width: 13, value: (r) => new Date(r.createdAt), numFmt: "dd/mm/yyyy" },
];

/* No usa listApplications() de applications.ts: esa llama a requireAdmin(),
   que redirige, y un route handler no puede seguir un redirect de servidor.
   getApplicationsForExport es la misma consulta, sin paginar y sin esa
   guardia — ver la nota en vacancyReport.ts. */
export async function GET(request: Request): Promise<Response> {
  const session = await adminSessionOrNull();
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  const url = new URL(request.url);
  const rows = await getApplicationsForExport({
    query: url.searchParams.get("q"),
    status: url.searchParams.get("status"),
    scope: url.searchParams.get("vacancy"),
    dateFrom: url.searchParams.get("dateFrom"),
    dateTo: url.searchParams.get("dateTo"),
  });

  const range =
    url.searchParams.get("dateFrom") || url.searchParams.get("dateTo")
      ? ` · ${url.searchParams.get("dateFrom") || "…"} to ${url.searchParams.get("dateTo") || "…"}`
      : "";
  const exportedAt = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const buffer = await buildStyledWorkbook({
    sheetName: "Applications",
    title: "Applications report",
    subtitle: `${rows.length} application${rows.length === 1 ? "" : "s"}${range} · exported ${exportedAt}`,
    columns: COLUMNS,
    rows,
  });

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${excelFilename("applications", new Date().toISOString().slice(0, 10))}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
