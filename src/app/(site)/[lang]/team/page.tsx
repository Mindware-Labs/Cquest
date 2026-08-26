import type { Metadata } from "next";
import TeamExperience from "./TeamExperience";
import type { Locale } from "@/i18n/config";
import { localeAlternates } from "@/i18n/alternates";
import { resolveLang } from "@/i18n/resolveLangParam";
import JsonLd from "@/components/JsonLd";
import { simplePageGraph } from "@/lib/schema";

const TITLE: Record<Locale, string> = {
  en: "Our Team | Center Quest",
  es: "Nuestro Equipo | Center Quest",
};

const DESCRIPTION: Record<Locale, string> = {
  en: "Meet the six departments behind Center Quest: Customer Experience, Business Operations, Back Office Services, Technology & Innovation, Quality Assurance and Human Capital.",
  es: "Conoce los seis departamentos de Center Quest: Experiencia del Cliente, Operaciones de Negocio, Back Office, Tecnología, Calidad y Capital Humano.",
};

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const lang = await resolveLang(params);
  return {
    title: TITLE[lang],
    description: DESCRIPTION[lang],
    alternates: localeAlternates(lang, "/team"),
    openGraph: { title: TITLE[lang], description: DESCRIPTION[lang], type: "website" },
    twitter: { card: "summary_large_image", title: TITLE[lang], description: DESCRIPTION[lang] },
  };
}

export default async function TeamPage({ params }: { params: Promise<{ lang: string }> }) {
  const lang = await resolveLang(params);
  return (
    <>
      <JsonLd
        data={simplePageGraph("AboutPage", lang, "/team", TITLE[lang], DESCRIPTION[lang], [
          { name: "Center Quest", path: "" },
          { name: TITLE[lang], path: "/team" },
        ])}
      />
      <TeamExperience />
    </>
  );
}
