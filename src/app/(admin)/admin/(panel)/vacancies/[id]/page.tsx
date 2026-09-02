import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getVacancy } from "@/server/vacancies";
import { listAllDepartments } from "@/server/departments";
import VacancyEditor from "./VacancyEditor";

export const metadata: Metadata = {
  title: "Edit vacancy · Center Quest Admin",
  robots: { index: false, follow: false },
};

export default async function VacancyEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [vacancy, departments] = await Promise.all([getVacancy(id), listAllDepartments()]);
  if (!vacancy) notFound();

  return <VacancyEditor vacancy={vacancy} departments={departments} />;
}
