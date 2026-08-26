import type { Metadata } from "next";
import type { Locale } from "@/i18n/config";
import { localeAlternates } from "@/i18n/alternates";
import { resolveLang } from "@/i18n/resolveLangParam";
import CareersExperience from "./CareersExperience";

const TITLE: Record<Locale, string> = {
  en: "Careers | Center Quest",
  es: "Empleos | Center Quest",
};

const DESCRIPTION: Record<Locale, string> = {
  en: "Open positions at Center Quest in Santo Domingo: entry-level call center agents with paid training, plus specialist and leadership roles across the operation.",
  es: "Vacantes abiertas en Center Quest en Santo Domingo: agentes de call center de primer empleo con capacitación pagada, más roles especializados y de liderazgo dentro de la operación.",
};

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const lang = await resolveLang(params);
  return {
    title: TITLE[lang],
    description: DESCRIPTION[lang],
    alternates: localeAlternates(lang, "/careers"),
    openGraph: { title: TITLE[lang], description: DESCRIPTION[lang], type: "website" },
  };
}

export default function CareersPage() {
  return <CareersExperience />;
}
