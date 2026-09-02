import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getVacancyReport } from "@/server/vacancies";
import VacancyReportView from "./VacancyReportView";

export const metadata: Metadata = {
  title: "Vacancy report · Center Quest Admin",
  robots: { index: false, follow: false },
};

export default async function VacancyReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const report = await getVacancyReport(id);
  if (!report) notFound();

  return <VacancyReportView report={report} />;
}
