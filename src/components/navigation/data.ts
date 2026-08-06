import { SERVICE_ICON, SERVICES, type ServiceIconName } from "@/components/services/data";
import type { Dictionary } from "@/i18n/dictionaries/types";
import type { Locale } from "@/i18n/config";

export type NavLink = {
  label: string;
  href: string;
  // Set only on the "Services" children below — their presence is what
  // tells DesktopNav to render the mega-menu layout instead of a plain list.
  description?: string;
  icon?: ServiceIconName;
  children?: readonly NavLink[];
};

// Routes whose quote CTA deep-links into the wizard with that service already
// chosen (`/quote?servicio=<last path segment>`). ONLY service pages belong
// here — the segment is read as a service id.
export const SERVICE_DETAIL_PAGES = [
  "/services/call-center",
  "/services/operations",
  "/services/systems",
] as const;

// Routes that open on a dark, full-bleed hero with the navbar floating
// transparently on top of it, so its text needs the light/"inverse" treatment
// until the page scrolls past that hero.
//
// Split from SERVICE_DETAIL_PAGES above, which it used to be the same list as.
// The two only looked identical because every dark-hero page happened to be a
// service page: /team is the first that isn't, and adding it to the old shared
// constant would have deep-linked its quote CTA to `?servicio=team` — a
// service that does not exist. Adding a dark-hero page here is now free of
// that side effect.
export const DARK_HERO_PAGES = [
  ...SERVICE_DETAIL_PAGES,
  "/team",
  "/partnerships/mindware-labs",
] as const;

// Dark-hero pages whose CTA should carry that page's OWN accent instead of
// the brand celeste — currently just Mindware Labs, which runs its own
// purple identity rather than Center Quest's. The actual color has to be
// written as a literal Tailwind class in Navbar.tsx (arbitrary-value
// classes built from a runtime string here wouldn't be visible to
// Tailwind's static scanner), so this list only gates which branch applies.
export const ACCENT_CTA_PAGES = ["/partnerships/mindware-labs"] as const;

// Pages that skip the site-wide footer entirely — currently just Mindware
// Labs, whose page is meant to read as its own closed, self-contained
// surface rather than bottoming out on Center Quest's own closing statement.
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

// On a service detail page the logo is the only way back to the home page —
// this gives every such page an explicit nav item for it too, with a small
// dropdown to jump straight to a section of home instead of always landing
// back at the top. Mirrors getHeroNavLinks in hero/animation.ts, which lists
// what's actually on "/" today: reuse its labels rather than the coarser
// generic "About us" stub, and keep both lists in step as home's sections
// change.
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

// Service detail pages have their own in-page sections — on those routes the
// navbar should point at real anchors on the page instead of the generic
// sitewide stubs above. Keyed by the locale-less pathname (see
// useLocalizedPathname) so each service page can define its own list without
// the shared Navbar/DesktopNav/MobileNav needing to know anything about a
// specific page's structure.
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
    // /team isn't a SERVICE_DETAIL_PAGES entry (see the comment on
    // DARK_HERO_PAGES above — it has a dark hero but no quote-wizard
    // service to deep-link), but it's the same "own page, own anchors"
    // shape as the three above: a dark hero, then one real in-page section.
    "/team": [
      home,
      { label: dict.serviceSections.team.departments, href: "#departments" },
    ],
    // Mindware Labs runs its own visual identity end to end (see
    // ACCENT_CTA_PAGES/NO_FOOTER_PAGES) and reads as its own surface rather
    // than another Center Quest subpage — so unlike the pages above, it
    // skips the "Home ▾" wrapper and shows home's own top-level set
    // (getHeroNavLinks in components/hero/animation.ts) directly, just
    // without the Partnerships entry: linking back to the section that
    // lists this very page would be circular here.
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
  };
}

export const NAV_EASE_OUT = [0.22, 1, 0.36, 1] as const;

/* The fixed bar's height: a 3rem logo (h-12) inside 1.25rem of padding above
   and below (py-5). Everything that has to reason about clearing it — the
   dark-hero observer's rootMargin, the scroll-spy's reading line — measures
   from here instead of re-guessing, which is how the observer ended up on a
   80px margin against an 88px bar. */
export const NAV_HEIGHT_PX = 88;
