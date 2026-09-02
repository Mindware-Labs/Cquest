import type { Metadata } from "next";
import JoinUsExperience from "./JoinUsExperience";
import JsonLd from "@/components/JsonLd";
import { breadcrumbNode, graph, jobPostingNode, simplePageNode } from "@/lib/schema";
import { listDepartmentsHiring, listPublishedVacancies } from "@/lib/vacancies";

const TITLE = "Join Us | Center Quest";

// La revalidación real la disparan las server actions de vacantes
// (revalidatePath("/join-us")); esto es solo el respaldo si algo se les escapa.
export const revalidate = 3600;

function describeOpenings(count: number, departments: string[]): string {
  if (count === 0) {
    return "No open positions right now at Center Quest — check back soon, or send us your resume for the next opening.";
  }
  const list = departments.length > 1 ? `${departments.slice(0, -1).join(", ")} and ${departments.at(-1)}` : (departments[0] ?? "");
  return `${count} open position${count === 1 ? "" : "s"} at Center Quest across ${list}. Real openings, no third-party listings.`;
}

export async function generateMetadata(): Promise<Metadata> {
  const [openings, hiring] = await Promise.all([listPublishedVacancies(), listDepartmentsHiring()]);
  const description = describeOpenings(openings.length, hiring.map((d) => d.shortLabel));

  return {
    title: TITLE,
    description,
    alternates: { canonical: "/join-us" },
    openGraph: { title: TITLE, description, type: "website" },
    twitter: { card: "summary_large_image", title: TITLE, description },
  };
}

export default async function JoinUsPage() {
  const [openings, hiring] = await Promise.all([listPublishedVacancies(), listDepartmentsHiring()]);
  const DESCRIPTION = describeOpenings(openings.length, hiring.map((d) => d.shortLabel));

  return (
    <>
      <JsonLd
        data={graph(
          simplePageNode("WebPage", "/join-us", TITLE, DESCRIPTION),
          breadcrumbNode([
            { name: "Center Quest", path: "" },
            { name: "Join Us", path: "/join-us" },
          ]),
          ...openings.map((vacancy) => jobPostingNode(vacancy)),
        )}
      />
      <JoinUsExperience openings={openings} hiring={hiring} />
    </>
  );
}
