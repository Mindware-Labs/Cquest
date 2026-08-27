import type { Metadata } from "next";
import TeamExperience from "./TeamExperience";
import JsonLd from "@/components/JsonLd";
import { simplePageGraph } from "@/lib/schema";
import { listDepartmentsForDisplay } from "@/lib/departments";

const TITLE = "Our Team | Center Quest";

// La revalidación real la disparan las server actions de departamentos
// (revalidatePath("/team")); esto es solo el respaldo si algo se les escapa.
export const revalidate = 3600;

function describeDepartments(names: string[]): string {
  const list = names.length > 1 ? `${names.slice(0, -1).join(", ")} and ${names.at(-1)}` : (names[0] ?? "");
  return `Meet the ${names.length} department${names.length === 1 ? "" : "s"} behind Center Quest: ${list}.`;
}

export async function generateMetadata(): Promise<Metadata> {
  const departments = await listDepartmentsForDisplay();
  const description = describeDepartments(departments.map((d) => d.shortLabel));

  return {
    title: TITLE,
    description,
    alternates: { canonical: "/team" },
    openGraph: { title: TITLE, description, type: "website" },
    twitter: { card: "summary_large_image", title: TITLE, description },
  };
}

export default async function TeamPage() {
  const departments = await listDepartmentsForDisplay();
  const DESCRIPTION = describeDepartments(departments.map((d) => d.shortLabel));

  return (
    <>
      <JsonLd
        data={simplePageGraph("AboutPage", "/team", TITLE, DESCRIPTION, [
          { name: "Center Quest", path: "" },
          { name: TITLE, path: "/team" },
        ])}
      />
      <TeamExperience departments={departments} />
    </>
  );
}
