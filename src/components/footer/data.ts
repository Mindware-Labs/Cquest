import { SERVICES } from "@/components/services/data";
import type { Locale } from "@/i18n/config";

/* ── Footer content ───────────────────────────────────────
   Copy lives here as a local COPY table rather than in i18n/dictionaries,
   matching how every About section handles its own strings: the shared
   Dictionary carries chrome that multiple components read (nav labels, aria
   text), while a section's own prose stays next to the section.

   Service links are DERIVED from the same SERVICES file the nav and the
   carousel read — so a new business line appears in the footer without
   anyone remembering to add it here twice. */

/* The company's real contact details, kept in one place because they are
   read from more than one surface (this footer, and the Organization JSON-LD
   in app/[lang]/layout.tsx). `tel:` and `mailto:` are built from these, so a
   wrong value here is a dead contact channel, not merely wrong text. */
export const CONTACT = {
  /** Display form — how a Dominican reader expects to see it. */
  phone: "(809) 243 1209",
  /** E.164 — the only form `tel:` and wa.me accept reliably. */
  phoneHref: "+18092431209",
  email: "services@ccquest.do",
  /* Not localized: a street address is a proper noun and must stay verbatim
     in both languages — a "translated" address is an address that fails. Only
     the country suffix is rendered per-locale. */
  street: "Paseo de los Periodistas #03, Ens. Miraflores",
  city: "Santo Domingo",
  country: { en: "Dominican Republic", es: "República Dominicana" },
  countryCode: "DO",
} as const;

/* The one line a visitor should remember, split at the sentence break so the
   footer can set it as two deliberate display lines and lift each word from
   behind its own clip edge.

   Single source: app/[lang]/layout.tsx composes the OG title from it and
   opengraph-image reads it directly. It used to live only inside OG_TITLE
   with the brand name glued on the front, which is why the OG image had to
   strip that prefix back off with a regex. */
export const BRAND_LINE: Record<Locale, readonly [string, string]> = {
  en: ["We power operations.", "You drive growth."],
  es: ["Nosotros impulsamos las operaciones.", "Tú impulsas el crecimiento."],
};

/** The brand line as one sentence — for metadata, where it has no line breaks. */
export function brandLine(lang: Locale): string {
  return BRAND_LINE[lang].join(" ");
}

export type FooterLink = { label: string; href: string };

/* The closing row's navigation. Deliberately short: Services has its own
   block above it, and the five Sectors links this footer used to carry all
   resolved to the same /#sectors anchor — five labels for one destination is
   link-shaped decoration, not navigation. */
export function getBaseLinks(lang: Locale): FooterLink[] {
  const t = COPY[lang];
  return [
    { label: t.links.home, href: "/" },
    { label: t.links.about, href: "/#about" },
    { label: t.links.team, href: "/#team" },
    { label: t.links.quote, href: "/quote" },
  ];
}

/* Each row carries the same pairing the carousel gives a business line — the
   name, then the one-line promise under it — plus `accent`, the colour the
   row's hairline lights up in on hover.

   `glow`, not `color`: a service's `color` is tuned for the carousel's
   near-white sheet (#3f738d, #176c79) and would sit at roughly 2:1 on the
   footer's ink. `glow` is the light member of each pair and is what the
   dark field can actually carry. */
export function getServiceRows(lang: Locale) {
  return SERVICES.map((service) => ({
    id: service.id,
    label: service.label[lang],
    lead: service.shortLabel[lang],
    href: service.href,
    accent: service.glow,
  }));
}

export const COPY = {
  en: {
    headings: { services: "Services", contact: "Contact" },
    links: {
      home: "Home",
      about: "About us",
      team: "Our team",
      quote: "Request a quote",
    },
    cta: "Request a quote",
    navAriaLabel: "Footer",
    rights: "All rights reserved.",
    phoneLabel: "Phone / WhatsApp",
    emailLabel: "Email",
    locationLabel: "Location",
  },
  es: {
    headings: { services: "Servicios", contact: "Contacto" },
    links: {
      home: "Inicio",
      about: "Nosotros",
      team: "Nuestro equipo",
      quote: "Solicitar cotización",
    },
    cta: "Solicitar cotización",
    navAriaLabel: "Pie de página",
    rights: "Todos los derechos reservados.",
    phoneLabel: "Teléfono / WhatsApp",
    emailLabel: "Correo",
    locationLabel: "Ubicación",
  },
} as const;
