import type { Metadata } from "next";
import WorkCaseStudy from "./WorkCaseStudy";
import type { Locale } from "@/i18n/config";
import { localeAlternates } from "@/i18n/alternates";
import { resolveLang } from "@/i18n/resolveLangParam";

const TITLE: Record<Locale, string> = {
  en: "Contact-center operations platform · Case study | Center Quest",
  es: "Plataforma de contact center · Caso de éxito | Center Quest",
};

const DESCRIPTION: Record<Locale, string> = {
  en: "How we designed and built a custom platform that runs an entire call-center operation — automatic call capture, ticketing, real-time dashboards and per-site reporting.",
  es: "Cómo diseñamos y construimos una plataforma a la medida que gestiona toda una operación de call center — captura automática de llamadas, ticketing, dashboards en tiempo real y reportes por sede.",
};

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const lang = await resolveLang(params);
  return {
    title: TITLE[lang],
    description: DESCRIPTION[lang],
    alternates: localeAlternates(lang, "/services/systems/work"),
    openGraph: { title: TITLE[lang], description: DESCRIPTION[lang], type: "website" },
  };
}

export default function WorkCaseStudyPage() {
  return <WorkCaseStudy />;
}
