import type { Metadata } from "next";
import type { Locale } from "@/i18n/config";
import { localeAlternates } from "@/i18n/alternates";
import { resolveLang } from "@/i18n/resolveLangParam";
import LegalPage from "../LegalPage";
import { PRIVACY, UPDATED_ISO } from "../content";
import JsonLd from "@/components/JsonLd";
import { simplePageGraph } from "@/lib/schema";

const TITLE: Record<Locale, string> = {
  en: "Privacy Policy | Center Quest",
  es: "Política de Privacidad | Center Quest",
};

const DESCRIPTION: Record<Locale, string> = {
  en: "What personal data Center Quest collects through this site, how it's used, and how to exercise your rights over it.",
  es: "Qué datos personales recopila Center Quest a través de este sitio, cómo se usan y cómo ejercer tus derechos sobre ellos.",
};

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const lang = await resolveLang(params);
  return {
    title: TITLE[lang],
    description: DESCRIPTION[lang],
    alternates: localeAlternates(lang, "/legal/privacy"),
    openGraph: { title: TITLE[lang], description: DESCRIPTION[lang], type: "website" },
    twitter: { card: "summary_large_image", title: TITLE[lang], description: DESCRIPTION[lang] },
  };
}

export default async function PrivacyPage({ params }: { params: Promise<{ lang: string }> }) {
  const lang = await resolveLang(params);
  return (
    <>
      <JsonLd
        data={simplePageGraph("WebPage", lang, "/legal/privacy", TITLE[lang], DESCRIPTION[lang], [
          { name: "Center Quest", path: "" },
          { name: TITLE[lang], path: "/legal/privacy" },
        ], { dateModified: UPDATED_ISO })}
      />
      <LegalPage doc={PRIVACY} lang={lang} />
    </>
  );
}
