"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import type { Locale } from "@/i18n/config";

const COPY: Record<
  Locale,
  { group: string; share: string; linkedin: string; x: string; whatsapp: string; copy: string; copied: string }
> = {
  es: {
    group: "Compartir este artículo",
    share: "Compartir",
    linkedin: "Compartir en LinkedIn",
    x: "Compartir en X",
    whatsapp: "Compartir por WhatsApp",
    copy: "Copiar enlace",
    copied: "Enlace copiado",
  },
  en: {
    group: "Share this article",
    share: "Share",
    linkedin: "Share on LinkedIn",
    x: "Share on X",
    whatsapp: "Share on WhatsApp",
    copy: "Copy link",
    copied: "Link copied",
  },
};

// LinkedIn, X y WhatsApp: los canales reales de este negocio en RD, no las diez redes de siempre. La URL se arma en cliente con location.origin (NEXT_PUBLIC_SITE_URL no está garantizada en preview) detrás de un mounted para no desajustar la hidratación.
export default function ShareLinks({
  lang,
  title,
  path,
}: {
  lang: Locale;
  title: string;
  path: string;
}) {
  const copy = COPY[lang];
  const [copied, setCopied] = useState(false);

  // useSyncExternalStore y no useState+useEffect: el tercer argumento es la instantánea del servidor (cadena vacía), así que el HTML entregado y el hidratado coinciden.
  const origin = useSyncExternalStore(
    () => () => {},
    () => window.location.origin,
    () => "",
  );
  const url = origin ? `${origin}${path}` : "";

  // Sin el clearTimeout del cleanup, dos clics seguidos dejan dos relojes corriendo y el segundo apaga el aviso del primero antes de tiempo.
  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const onCopy = useCallback(async () => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      // Sin permiso de portapapeles no hay nada útil que decir: los otros botones siguen funcionando.
    }
  }, [url]);

  if (!url) return null;

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const links = [
    {
      label: copy.linkedin,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      icon: (
        <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm7 0h3.8v1.7h.05a4.2 4.2 0 0 1 3.75-2c4 0 4.4 2.6 4.4 6V21h-4v-5.4c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9V21h-4V9Z" />
      ),
    },
    {
      label: copy.x,
      href: `https://x.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      icon: <path d="M18.9 2H22l-7 8 8.2 12h-6.4l-5-7.3L5.9 22H2.8l7.5-8.6L2.4 2h6.6l4.5 6.6L18.9 2Z" />,
    },
    {
      label: copy.whatsapp,
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      icon: (
        <path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2Zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-1.7-.1a12 12 0 0 1-5.6-4.9c-.4-.7-.7-1.5-.7-2.2 0-.8.4-1.4.7-1.7.2-.2.4-.3.6-.3h.5c.2 0 .4 0 .6.4l.7 1.7c0 .2 0 .3-.1.5l-.4.5c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2 1.1 1 2 1.3 2.3 1.4.2.1.4.1.5-.1l.7-.8c.2-.2.3-.2.6-.1l1.6.8c.3.1.4.2.5.3v.8Z" />
      ),
    },
  ];

  const buttonClass =
    "inline-flex size-8 items-center justify-center rounded-full text-[var(--text-tertiary)] transition-colors hover:bg-[var(--surface-sunken)] hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground";

  return (
    // role="group" y no "navigation": son acciones sobre el artículo, no rutas del sitio.
    <span role="group" aria-label={copy.group} className="flex items-center gap-0.5">
      {links.map((link) => (
        <a
          key={link.label}
          href={link.href}
          target="_blank"
          // noopener impide que la página abierta manipule esta por window.opener.
          rel="noopener noreferrer"
          className={buttonClass}
          title={link.label}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            {link.icon}
          </svg>
          <span className="sr-only">{link.label}</span>
        </a>
      ))}

      <button type="button" onClick={onCopy} className={buttonClass} title={copy.copy}>
        {copied ? (
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        ) : (
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" />
            <path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" />
          </svg>
        )}
        <span className="sr-only">{copy.copy}</span>
      </button>

      {/* La confirmación se anuncia, no solo cambia el icono: quien no ve la pantalla necesita saber que el clic hizo algo. */}
      <span aria-live="polite" className="sr-only">
        {copied ? copy.copied : ""}
      </span>
    </span>
  );
}
