import type { Metadata } from "next";
import WorkCaseStudy from "./WorkCaseStudy";
import type { Locale } from "@/i18n/config";
import { localeAlternates } from "@/i18n/alternates";
import { resolveLang } from "@/i18n/resolveLangParam";
import JsonLd from "@/components/JsonLd";
import { graph, breadcrumbNode, SITE_URL } from "@/lib/schema";
import { SERVICES } from "@/components/services/data";

const TITLE: Record<Locale, string> = {
  en: "Contact-center operations platform · Case study | Center Quest",
  es: "Plataforma de contact center · Caso de éxito | Center Quest",
};

const DESCRIPTION: Record<Locale, string> = {
  en: "How we designed and built a custom platform that runs an entire call-center operation — automatic call capture, ticketing, real-time dashboards and per-site reporting.",
  es: "Cómo construimos una plataforma a la medida para una operación de call center: captura automática de llamadas, ticketing, dashboards y reportes por sede.",
};

const systemsService = SERVICES.find((entry) => entry.id === "systems")!;

/* CreativeWork y no Article: no hay author ni datePublished reales que
   declarar, e inventarlos rompería la regla del proyecto contra datos
   fabricados en JSON-LD. `about` referencia el nodo Service de Sistemas por
   @id en vez de repetirlo. */
function caseStudyGraph(lang: Locale) {
  return graph(
    {
      "@type": "CreativeWork",
      "@id": `${SITE_URL}/${lang}/services/systems/work#creativework`,
      name: TITLE[lang],
      description: DESCRIPTION[lang],
      url: `${SITE_URL}/${lang}/services/systems/work`,
      inLanguage: lang,
      about: { "@id": `${SITE_URL}/${lang}/services/systems#service` },
    },
    breadcrumbNode(lang, [
      { name: "Center Quest", path: "" },
      { name: systemsService.label[lang], path: systemsService.href },
      { name: TITLE[lang], path: "/services/systems/work" },
    ]),
  );
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const lang = await resolveLang(params);
  return {
    title: TITLE[lang],
    description: DESCRIPTION[lang],
    alternates: localeAlternates(lang, "/services/systems/work"),
    openGraph: { title: TITLE[lang], description: DESCRIPTION[lang], type: "website" },
    twitter: { card: "summary_large_image", title: TITLE[lang], description: DESCRIPTION[lang] },
  };
}

export default async function WorkCaseStudyPage({ params }: { params: Promise<{ lang: string }> }) {
  const lang = await resolveLang(params);
  return (
    <>
      <JsonLd data={caseStudyGraph(lang)} />
      <WorkCaseStudy />
    </>
  );
}
