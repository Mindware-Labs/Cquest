import { getNavLinks } from "@/components/navigation/data";
import { SERVICES } from "@/components/services/data";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/types";

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

// About us and Contact are dropped from the footer's copy of the primary
// nav: both are already covered elsewhere on this same footer — About us by
// the closing statement/brand block, Contact by the dedicated Contact column
// (phone, email, address) right next to this row — so repeating them here
// was pure duplication.
const OMIT_FROM_FOOTER = ["/#about", "/quote"];

/* The closing row's navigation. SOURCED from the same getNavLinks the header
   Navbar reads (dropped down to just label/href — the footer is a flat list,
   it has no mega-menu to hang Services' children off), rather than a second,
   hand-kept list: two independent copies of "what the primary nav is" are
   two things that can quietly drift apart, and the footer having its own
   `/#team` while the header pointed at the real `/team` page was exactly
   that drift. One function, read from both surfaces, cannot disagree with
   itself. Terms/Privacy are appended after — they're real pages but not part
   of the primary nav, so they don't belong in getNavLinks itself. */
export function getBaseLinks(dict: Dictionary, lang: Locale): FooterLink[] {
  const t = COPY[lang];
  const navLinks = getNavLinks(dict, lang)
    .filter((link) => !OMIT_FROM_FOOTER.includes(link.href))
    .map(({ label, href }) => ({ label, href }));
  return [
    ...navLinks,
    { label: t.links.terms, href: "/legal/terms" },
    { label: t.links.privacy, href: "/legal/privacy" },
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
      terms: "Terms & conditions",
      privacy: "Privacy policy",
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
      terms: "Términos y condiciones",
      privacy: "Política de privacidad",
    },
    cta: "Solicitar cotización",
    navAriaLabel: "Pie de página",
    rights: "Todos los derechos reservados.",
    phoneLabel: "Teléfono / WhatsApp",
    emailLabel: "Correo",
    locationLabel: "Ubicación",
  },
} as const;
