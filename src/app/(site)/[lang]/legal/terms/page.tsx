import type { Metadata } from "next";
import type { Locale } from "@/i18n/config";
import { localeAlternates } from "@/i18n/alternates";
import { resolveLang } from "@/i18n/resolveLangParam";
import LegalPage from "../LegalPage";
import { TERMS, UPDATED_ISO } from "../content";
import JsonLd from "@/components/JsonLd";
import { simplePageGraph } from "@/lib/schema";

const TITLE: Record<Locale, string> = {
  en: "Terms and Conditions | Center Quest",
  es: "Términos y Condiciones | Center Quest",
};

const DESCRIPTION: Record<Locale, string> = {
  en: "The terms that govern the use of the Center Quest website and its quote request form.",
  es: "Los términos que rigen el uso del sitio web de Center Quest y su formulario de solicitud de cotización.",
};

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const lang = await resolveLang(params);
  return {
    title: TITLE[lang],
    description: DESCRIPTION[lang],
    alternates: localeAlternates(lang, "/legal/terms"),
    openGraph: { title: TITLE[lang], description: DESCRIPTION[lang], type: "website" },
    twitter: { card: "summary_large_image", title: TITLE[lang], description: DESCRIPTION[lang] },
  };
}

export default async function TermsPage({ params }: { params: Promise<{ lang: string }> }) {
  const lang = await resolveLang(params);
  return (
    <>
      <JsonLd
        data={simplePageGraph("WebPage", lang, "/legal/terms", TITLE[lang], DESCRIPTION[lang], [
          { name: "Center Quest", path: "" },
          { name: TITLE[lang], path: "/legal/terms" },
        ], { dateModified: UPDATED_ISO })}
      />
      <LegalPage doc={TERMS} lang={lang} />
    </>
  );
}
