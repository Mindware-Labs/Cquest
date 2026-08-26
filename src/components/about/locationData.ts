import { CONTACT } from "@/components/footer/data";

export const HQ = {
  lat: 18.4768114,
  lng: -69.9109066,
  zoom: 17,
} as const;

export const MAP_INTRO = {
  startLngOffset: -88,

  handoffLngOffset: -46,
  spinZoom: 1.5,
  spinDuration: 2600,
  flyDuration: 4200,

  flyMinZoom: 1.5,
  holdBeforeSpin: 420,

  pinRevealZoom: 8,
} as const;

export const MAP_STYLE_DARK = "mapbox://styles/mapbox/dark-v11";
export const MAP_STYLE_LIGHT = "mapbox://styles/mapbox/light-v11";

export const DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${HQ.lat},${HQ.lng}`;

export const MAP_URL = `https://www.google.com/maps/search/?api=1&query=${HQ.lat},${HQ.lng}`;

export const LOCATION_COPY = {
  eyebrow: "Location",
  heading: "One floor. One operations centre.",
  lead: "Everything runs from a single control room, so nothing gets handed between sites. Come see the floor your campaign will run on — we host visits, book yours when you request your quote.",
  plotLabel: "CQ · Operations HQ",
  mapAriaLabel: "Map showing Center Quest's operations centre",
  hqLabel: "Operations HQ",
  regionLabel: "Region",
  region: "Caribbean · LATAM",
  timezoneLabel: "Time zone",
  timezone: "AST · UTC−4",
  directions: "Get directions",
  fallbackTitle: "Map unavailable",
  fallbackBody: "Open the location in Google Maps instead.",
  fallbackAction: "Open in Google Maps",
} satisfies Record<string, string>;

export { CONTACT };
