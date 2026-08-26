import type { Metadata } from "next";
import WorkCaseStudy from "./WorkCaseStudy";
import JsonLd from "@/components/JsonLd";
import { graph, breadcrumbNode, SITE_URL } from "@/lib/schema";
import { SERVICES } from "@/components/services/data";

const TITLE = "Contact-center operations platform · Case study | Center Quest";

const DESCRIPTION =
  "How we designed and built a custom platform that runs an entire call-center operation — automatic call capture, ticketing, real-time dashboards and per-site reporting.";

const systemsService = SERVICES.find((entry) => entry.id === "systems")!;

/* CreativeWork y no Article: no hay author ni datePublished reales que
   declarar, e inventarlos rompería la regla del proyecto contra datos
   fabricados en JSON-LD. `about` referencia el nodo Service de Sistemas por
   @id en vez de repetirlo. */
function caseStudyGraph() {
  return graph(
    {
      "@type": "CreativeWork",
      "@id": `${SITE_URL}/services/systems/work#creativework`,
      name: TITLE,
      description: DESCRIPTION,
      url: `${SITE_URL}/services/systems/work`,
      inLanguage: "en",
      about: { "@id": `${SITE_URL}/services/systems#service` },
    },
    breadcrumbNode([
      { name: "Center Quest", path: "" },
      { name: systemsService.label, path: systemsService.href },
      { name: TITLE, path: "/services/systems/work" },
    ]),
  );
}

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/services/systems/work" },
  openGraph: { title: TITLE, description: DESCRIPTION, type: "website" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

export default function WorkCaseStudyPage() {
  return (
    <>
      <JsonLd data={caseStudyGraph()} />
      <WorkCaseStudy />
    </>
  );
}
