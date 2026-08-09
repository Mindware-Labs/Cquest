import { SERVICE_ICON, SERVICES, type ServiceIconName } from "@/components/services/data";
import type { Dictionary } from "@/i18n/dictionaries/types";
import type { Locale } from "@/i18n/config";

export type NavLink = {
  label: string;
  href: string;

  description?: string;
  icon?: ServiceIconName;
  children?: readonly NavLink[];
};

export const SERVICE_DETAIL_PAGES = [
  "/services/call-center",
  "/services/operations",
  "/services/systems",
] as const;

export const DARK_HERO_PAGES = [
  ...SERVICE_DETAIL_PAGES,
  "/team",
  "/partnerships/mindware-labs",

  "/location",
] as const;

/* Oscuras de arriba abajo, no solo en el hero. La distinción importa al bajar
   la barra: DARK_HERO_PAGES tienen contenido claro debajo y la hoja clara les
   da el contraste que necesitan, pero aquí debajo sigue habiendo fondo oscuro
   y virar a blanco parte la página en dos. */
export const DARK_PAGES = ["/location"] as const;

export const ACCENT_CTA_PAGES = ["/partnerships/mindware-labs"] as const;

export const NO_FOOTER_PAGES = ["/partnerships/mindware-labs"] as const;

export function getNavLinks(dict: Dictionary, lang: Locale): readonly NavLink[] {
  return [
    { label: dict.nav.aboutUs, href: "/#about" },
    {
      label: dict.nav.services,
      href: "/#services",
      children: SERVICES.map((service) => ({
        label: service.label[lang],
        href: service.href,
        description: service.strapline[lang],
        icon: SERVICE_ICON[service.id],
      })),
    },
    { label: dict.nav.sectors, href: "/#sectors" },
    { label: dict.nav.team, href: "/team" },
    { label: dict.nav.contact, href: "/quote" },
  ];
}

function getLegalNavLinks(dict: Dictionary, lang: Locale): readonly NavLink[] {
  return [
    { label: dict.nav.home, href: "/" },
    {
      label: dict.nav.services,
      href: "/#services",
      children: SERVICES.map((service) => ({
        label: service.label[lang],
        href: service.href,
        description: service.strapline[lang],
        icon: SERVICE_ICON[service.id],
      })),
    },

    { label: dict.hero.navLinks.team, href: "/team" },
    { label: dict.nav.sectors, href: "/#sectors" },
    { label: dict.hero.navLinks.partnerships, href: "/#partnerships" },
  ];
}

function getHomeNavLink(dict: Dictionary): NavLink {
  return {
    label: dict.nav.home,
    href: "/",
    children: [
      { label: dict.nav.overview, href: "/" },
      { label: dict.hero.navLinks.services, href: "/#services" },
      { label: dict.hero.navLinks.team, href: "/#metrics" },
      { label: dict.hero.navLinks.sectors, href: "/#sectors" },
      { label: dict.hero.navLinks.partnerships, href: "/#partnerships" },
    ],
  };
}

export function getServiceNavLinks(dict: Dictionary, lang: Locale): Record<string, readonly NavLink[]> {
  const home = getHomeNavLink(dict);
  return {
    "/services/call-center": [
      home,
      { label: dict.serviceSections.callCenter.capabilities, href: "#capabilities" },
      { label: dict.serviceSections.callCenter.process, href: "#method" },
      { label: dict.serviceSections.callCenter.results, href: "#metrics" },
      { label: dict.serviceSections.callCenter.clients, href: "#clients" },
    ],
    "/services/operations": [
      home,
      { label: dict.serviceSections.bpo.disciplines, href: "#capabilities" },
      { label: dict.serviceSections.bpo.method, href: "#method" },
      { label: dict.serviceSections.bpo.slas, href: "#slas" },
      { label: dict.serviceSections.bpo.facilities, href: "#facility" },
    ],
    "/services/systems": [
      home,
      { label: dict.serviceSections.systems.capabilities, href: "#capabilities" },
      { label: dict.serviceSections.systems.method, href: "#method" },
      { label: dict.serviceSections.systems.commitments, href: "#commitments" },
      { label: dict.serviceSections.systems.work, href: "#work" },
    ],

    "/team": [
      home,
      { label: dict.serviceSections.team.departments, href: "#departments" },
    ],

    "/partnerships/mindware-labs": [
      {
        label: dict.hero.navLinks.services,
        href: "/#services",
        children: SERVICES.map((service) => ({
          label: service.label[lang],
          href: service.href,
          description: service.strapline[lang],
          icon: SERVICE_ICON[service.id],
        })),
      },
      { label: dict.hero.navLinks.team, href: "/#metrics" },
      { label: dict.hero.navLinks.sectors, href: "/#sectors" },
    ],

    "/legal/terms": getLegalNavLinks(dict, lang),
    "/legal/privacy": getLegalNavLinks(dict, lang),

    "/location": [
      {
        label: dict.hero.navLinks.services,
        href: "/#services",
        children: SERVICES.map((service) => ({
          label: service.label[lang],
          href: service.href,
          description: service.strapline[lang],
          icon: SERVICE_ICON[service.id],
        })),
      },
      { label: dict.hero.navLinks.team, href: "/#metrics" },
      { label: dict.hero.navLinks.sectors, href: "/#sectors" },
      { label: dict.hero.navLinks.whyUs, href: "/#why-us" },
      { label: dict.hero.navLinks.partnerships, href: "/#partnerships" },
    ],
  };
}

export const NAV_EASE_OUT = [0.22, 1, 0.36, 1] as const;

export const NAV_HEIGHT_PX = 88;
