import { SERVICES } from "@/components/services/data";
import { ABOUT_SECTORS } from "@/components/about/data";
import type { Locale } from "@/i18n/config";

/* ── Footer content ───────────────────────────────────────
   Copy lives here as a local COPY table rather than in i18n/dictionaries,
   matching how every About section handles its own strings: the shared
   Dictionary carries chrome that multiple components read (nav labels, aria
   text), while a section's own prose stays next to the section.

   Link columns are DERIVED from the same data files the nav and About read
   (SERVICES, ABOUT_SECTORS) — so a new service appears in the footer without
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

export type FooterLink = { label: string; href: string };

export function getCompanyLinks(lang: Locale): FooterLink[] {
  const t = COPY[lang];
  return [
    { label: t.links.home, href: "/" },
    { label: t.links.about, href: "/#about" },
    { label: t.links.services, href: "/#services" },
    { label: t.links.team, href: "/#team" },
    { label: t.links.quote, href: "/quote" },
  ];
}

export function getServiceLinks(lang: Locale): FooterLink[] {
  return SERVICES.map((service) => ({ label: service.label[lang], href: service.href }));
}

/* Sectors point at About's #sectors block rather than at five separate
   routes: those pages do not exist. A footer that links five labels to one
   real destination is honest; five links to 404s is not. */
export function getSectorLinks(lang: Locale): FooterLink[] {
  return ABOUT_SECTORS.map((sector) => ({ label: sector.label[lang], href: "/#sectors" }));
}

export const COPY = {
  en: {
    columns: { company: "Company", services: "Services", sectors: "Sectors", contact: "Contact" },
    links: {
      home: "Home",
      about: "About us",
      services: "Services",
      team: "Our team",
      quote: "Request a quote",
    },
    cta: "Request a quote",
    ctaLead: "Contact us",
    rights: "All rights reserved.",
    phoneLabel: "Phone / WhatsApp",
    emailLabel: "Email",
    locationLabel: "Location",
  },
  es: {
    columns: { company: "Compañía", services: "Servicios", sectors: "Sectores", contact: "Contacto" },
    links: {
      home: "Inicio",
      about: "Nosotros",
      services: "Servicios",
      team: "Nuestro equipo",
      quote: "Solicitar cotización",
    },
    cta: "Solicitar cotización",
    ctaLead: "Contáctanos",
    rights: "Todos los derechos reservados.",
    phoneLabel: "Teléfono / WhatsApp",
    emailLabel: "Correo",
    locationLabel: "Ubicación",
  },
} as const;
