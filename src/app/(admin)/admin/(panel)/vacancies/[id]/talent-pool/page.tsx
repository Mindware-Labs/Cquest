import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { listAllDepartments } from "@/server/departments";
import { listTalentPool } from "@/server/applications";
import { getVacancy } from "@/server/vacancies";
import TalentPoolReview from "./TalentPoolReview";

export const metadata: Metadata = {
  title: "Talent pool · Center Quest Admin",
  robots: { index: false, follow: false },
};

export default async function TalentPoolPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [vacancy, candidates, departments] = await Promise.all([getVacancy(id), listTalentPool(), listAllDepartments()]);
  if (!vacancy) notFound();

  const departmentLabel = departments.find((entry) => entry.id === vacancy.departmentId)?.shortLabel ?? null;

  return (
    <TalentPoolReview
      vacancy={{ id: vacancy.id, title: vacancy.title, departmentId: vacancy.departmentId, departmentLabel }}
      candidates={candidates}
    />
  );
}
