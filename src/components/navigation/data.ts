import { SERVICE_ICON, SERVICES, type ServiceIconName } from "@/components/services/data";
import { dict } from "@/lib/dictionary";

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

/* Árboles de rutas cuyas páginas abren todas con hero oscuro, comparados por
   prefijo en vez de por ruta exacta. */
const DARK_HERO_TREES: readonly string[] = [];

/* True en cualquier página que abra con hero oscuro a sangre completa. */
export function isDarkHeroPage(pathname: string): boolean {
  if ((DARK_HERO_PAGES as readonly string[]).includes(pathname)) return true;
  return DARK_HERO_TREES.some((prefix) => pathname.startsWith(prefix));
}

/* Oscuras de arriba abajo, no solo en el hero. La distinción importa al bajar
   la barra: DARK_HERO_PAGES tienen contenido claro debajo y la hoja clara les
   da el contraste que necesitan, pero aquí debajo sigue habiendo fondo oscuro
   y virar a blanco parte la página en dos. */
export const DARK_PAGES = ["/location"] as const;

export const ACCENT_CTA_PAGES = ["/partnerships/mindware-labs"] as const;

export const NO_FOOTER_PAGES = ["/partnerships/mindware-labs"] as const;

/* Los hijos del menú Servicios. Se declara en un solo sitio porque el mismo
   menú se arma en cinco lugares (nav general, hero, legal, location, hero de
   partnerships) y separarlos es garantizar que se desincronicen. */
export function getServiceChildren(): readonly NavLink[] {
  return SERVICES.map((service) => ({
    label: service.label,
    href: service.href,
    description: service.strapline,
    icon: SERVICE_ICON[service.id],
  }));
}

export function getNavLinks(): readonly NavLink[] {
  return [
    {
      label: dict.nav.services,
      href: "/#services",
      children: getServiceChildren(),
    },
    { label: dict.nav.team, href: "/team" },
    { label: dict.nav.sectors, href: "/#sectors" },
    /* Mismo orden y mismo destino que el nav del hero: "Nosotros" apunta a
       #why-us, no a #about, para que las dos barras lleven al mismo sitio. */
    { label: dict.hero.navLinks.whyUs, href: "/#why-us" },
    { label: dict.nav.blog, href: "/blog" },
    { label: dict.nav.joinUs, href: "/join-us" },
  ];
}

/* Nav completa con Inicio delante: páginas sin secciones propias que ancle. */
function getFullNavLinks(): readonly NavLink[] {
  return [
    { label: dict.nav.home, href: "/" },
    {
      label: dict.nav.services,
      href: "/#services",
      children: getServiceChildren(),
    },

    { label: dict.hero.navLinks.team, href: "/team" },
    { label: dict.nav.sectors, href: "/#sectors" },
    { label: dict.nav.blog, href: "/blog" },
    { label: dict.nav.joinUs, href: "/join-us" },
  ];
}

function getHomeNavLink(): NavLink {
  return {
    label: dict.nav.home,
    href: "/",
    children: [
      { label: dict.nav.overview, href: "/" },
      { label: dict.hero.navLinks.services, href: "/#services" },
      { label: dict.hero.navLinks.team, href: "/#metrics" },
      { label: dict.hero.navLinks.sectors, href: "/#sectors" },
      { label: dict.nav.blog, href: "/blog" },
    ],
  };
}

export function getServiceNavLinks(): Record<string, readonly NavLink[]> {
  const home = getHomeNavLink();
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

    /* La nav completa, no la reducida con solo "Departments": desde /team se
       puede llegar sin haber pasado por el inicio (ver MetricsSection "Meet
       the team" y el nav general), así que necesita el mismo camino de
       vuelta a Home que /join-us. Sin "Join us" en la lista: en esta página
       ese destino ya lo ofrece el CTA de la barra (ver getCtaOverride), y
       repetirlo en el menú es lo mismo dos veces. */
    "/team": getFullNavLinks().filter((link) => link.href !== "/join-us"),

    "/join-us": getFullNavLinks(),

    "/partnerships/mindware-labs": [
      {
        label: dict.hero.navLinks.services,
        href: "/#services",
        children: getServiceChildren(),
      },
      { label: dict.hero.navLinks.team, href: "/#metrics" },
      { label: dict.hero.navLinks.sectors, href: "/#sectors" },
    ],

    "/legal/terms": getFullNavLinks(),
    "/legal/privacy": getFullNavLinks(),

    "/location": [
      {
        label: dict.hero.navLinks.services,
        href: "/#services",
        children: getServiceChildren(),
      },
      { label: dict.hero.navLinks.team, href: "/#metrics" },
      { label: dict.hero.navLinks.sectors, href: "/#sectors" },
      { label: dict.hero.navLinks.whyUs, href: "/#why-us" },
      { label: dict.nav.blog, href: "/blog" },
    ],
  };
}

/* Ruta exacta primero; las páginas colgadas de /join-us (postulación) no
   tienen entrada propia y heredan la nav completa del listado. */
export function getNavLinksFor(pathname: string): readonly NavLink[] {
  const exact = getServiceNavLinks()[pathname];
  if (exact) return exact;
  if (pathname.startsWith("/join-us/")) return getFullNavLinks();
  return getNavLinks();
}

/* Casos puntuales donde el CTA persistente de la navbar no debe ser
   "Contact us" → /quote: en /team el cierre de la página ya ofrece hablar de
   negocio ("Discuss your operation" en OrgChart), así que arriba y en el
   hero conviene empujar hacia postularse en su lugar. */
export function getCtaOverride(pathname: string): { label: string; href: string } | null {
  if (pathname === "/team") return { label: dict.nav.joinUs, href: "/join-us" };
  return null;
}

export const NAV_EASE_OUT = [0.22, 1, 0.36, 1] as const;

export const NAV_HEIGHT_PX = 88;
