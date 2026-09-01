import { NextResponse } from "next/server";
import { z } from "zod";
import { adminSessionOrNull } from "@/lib/auth-guard";
import { APPLICATION_STATUS_META } from "@/lib/applicationStatus";
import { getVacancyReportData } from "@/server/vacancyReport";
import { AVAILABILITY_OPTIONS, ENGLISH_OPTIONS, EXPERIENCE_OPTIONS, optionLabel } from "@/app/(site)/join-us/apply/data";

function csvCell(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

const HEADER = ["Name", "Email", "Phone", "City", "Experience", "English", "Availability", "Status", "Applied at"];

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

  const lines = [HEADER.map(csvCell).join(",")];
  for (const candidate of report.candidates) {
    lines.push(
      [
        candidate.fullName,
        candidate.email,
        candidate.phone,
        candidate.city,
        optionLabel(EXPERIENCE_OPTIONS, candidate.experience),
        optionLabel(ENGLISH_OPTIONS, candidate.english),
        optionLabel(AVAILABILITY_OPTIONS, candidate.availability),
        APPLICATION_STATUS_META[candidate.status].label,
        candidate.createdAt,
      ]
        .map(csvCell)
        .join(","),
    );
  }

  const csv = `﻿${lines.join("\r\n")}`;
  const ascii = report.vacancy.title.replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-+|-+$/g, "").toLowerCase() || "vacancy";

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${ascii}-candidates.csv"`,
      "Cache-Control": "private, no-store",
    },
  });
}
