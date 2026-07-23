"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import { useI18n } from "@/i18n/I18nProvider";
import { LocalizedLink } from "@/i18n/LocalizedLink";

const COPY = {
  en: {
    eyebrow: "Something broke",
    title: "That wasn't supposed to happen.",
    lead: "Something went wrong loading this page. You can try again, or head back home.",
    retry: "Try again",
    home: "Back to home",
  },
  es: {
    eyebrow: "Algo se rompió",
    title: "Eso no debía pasar.",
    lead: "Algo falló al cargar esta página. Puedes intentar de nuevo, o volver al inicio.",
    retry: "Intentar de nuevo",
    home: "Volver al inicio",
  },
};

// This segment's own layout.tsx (and the I18nProvider it mounts) sits above
// what error.js wraps, so it stays mounted here — useI18n is safe to call.
export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  const { lang } = useI18n();
  const t = COPY[lang];

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <>
      <Navbar />
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-32 text-center">
        <span className="font-mono text-sm uppercase tracking-[0.14em] text-petroleo">{t.eyebrow}</span>
        <h1 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">{t.title}</h1>
        <p className="max-w-md text-muted">{t.lead}</p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={unstable_retry}
            className="inline-flex items-center rounded-[2px] bg-petroleo px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            {t.retry}
          </button>
          <LocalizedLink
            href="/"
            className="inline-flex items-center rounded-[2px] border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-foreground/5"
          >
            {t.home}
          </LocalizedLink>
        </div>
      </div>
    </>
  );
}
