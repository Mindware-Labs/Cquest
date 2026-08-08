import type { Metadata } from "next";
import type { Locale } from "@/i18n/config";
import { localeAlternates } from "@/i18n/alternates";
import { resolveLang } from "@/i18n/resolveLangParam";
import LegalPage from "../LegalPage";
import { TERMS } from "../content";

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
  };
}

export default async function TermsPage({ params }: { params: Promise<{ lang: string }> }) {
  const lang = await resolveLang(params);
  return <LegalPage doc={TERMS} lang={lang} />;
}
