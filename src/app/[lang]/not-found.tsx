"use client";

import Navbar from "@/components/Navbar";
import { useI18n } from "@/i18n/I18nProvider";
import { LocalizedLink } from "@/i18n/LocalizedLink";

const COPY = {
  en: {
    eyebrow: "404",
    title: "This page took a different route.",
    lead: "The page you're looking for doesn't exist, or it moved. Let's get you back on track.",
    cta: "Back to home",
  },
  es: {
    eyebrow: "404",
    title: "Esta página tomó otro camino.",
    lead: "La página que buscas no existe, o se movió. Volvamos a encaminarte.",
    cta: "Volver al inicio",
  },
};

export default function NotFound() {
  const { lang } = useI18n();
  const t = COPY[lang];

  return (
    <>
      <Navbar />
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-32 text-center">
        <span className="font-mono text-sm uppercase tracking-[0.14em] text-petroleo">{t.eyebrow}</span>
        <h1 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">{t.title}</h1>
        <p className="max-w-md text-muted">{t.lead}</p>
        <LocalizedLink
          href="/"
          className="mt-4 inline-flex items-center rounded-[2px] bg-petroleo px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          {t.cta}
        </LocalizedLink>
      </div>
    </>
  );
}
