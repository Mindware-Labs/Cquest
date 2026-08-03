import type { Metadata } from "next";
import TeamExperience from "./TeamExperience";
import type { Locale } from "@/i18n/config";
import { localeAlternates } from "@/i18n/alternates";
import { resolveLang } from "@/i18n/resolveLangParam";

const TITLE: Record<Locale, string> = {
  en: "Our Team | Center Quest",
  es: "Nuestro Equipo | Center Quest",
};

const DESCRIPTION: Record<Locale, string> = {
  en: "The people behind every operation: over 200 call center operators, 10 specialized developers and a dedicated HR department, organised by department.",
  es: "La gente detrás de cada operación: más de 200 operadores de call center, 10 programadores especializados y un departamento de RRHH dedicado, organizados por departamento.",
};

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const lang = await resolveLang(params);
  return {
    title: TITLE[lang],
    description: DESCRIPTION[lang],
    alternates: localeAlternates(lang, "/team"),
    openGraph: { title: TITLE[lang], description: DESCRIPTION[lang], type: "website" },
    /* The org chart below is a placeholder structure with invented department
       names and lorem profiles (see data.ts). Indexing it would put fabricated
       people into search results under Center Quest's name — and the fix once
       the real structure lands is deleting these two lines, not remembering
       to. Also kept out of sitemap.ts for the same reason. */
    robots: { index: false, follow: true },
  };
}

export default function TeamPage() {
  return <TeamExperience />;
}
