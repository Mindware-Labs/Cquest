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
  en: "Meet the six specialized departments behind Center Quest's customer experience, business operations, back office, technology, quality and human capital services.",
  es: "Conoce los seis departamentos especializados detrás de los servicios de experiencia del cliente, operaciones, back office, tecnología, calidad y capital humano de Center Quest.",
};

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const lang = await resolveLang(params);
  return {
    title: TITLE[lang],
    description: DESCRIPTION[lang],
    alternates: localeAlternates(lang, "/team"),
    openGraph: { title: TITLE[lang], description: DESCRIPTION[lang], type: "website" },
  };
}

export default function TeamPage() {
  return <TeamExperience />;
}
