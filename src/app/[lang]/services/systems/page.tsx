import type { Metadata } from "next";
import SystemsDetail from "./SystemsDetail";
import type { Locale } from "@/i18n/config";
import { localeAlternates } from "@/i18n/alternates";
import { resolveLang } from "@/i18n/resolveLangParam";

const TITLE: Record<Locale, string> = {
  en: "Systems Development | Center Quest",
  es: "Desarrollo de Sistemas | Center Quest",
};

const DESCRIPTION: Record<Locale, string> = {
  en: "Custom software for operations: CRMs, dashboards, operations automation, and AI implementation shaped around how the client actually works.",
  es: "Software a la medida para operaciones: CRMs, dashboards, automatización de operaciones e implementación de IA, diseñados según cómo trabaja realmente el cliente.",
};

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const lang = await resolveLang(params);
  return {
    title: TITLE[lang],
    description: DESCRIPTION[lang],
    alternates: localeAlternates(lang, "/services/systems"),
  };
}

export default function SystemsPage() {
  return <SystemsDetail />;
}
