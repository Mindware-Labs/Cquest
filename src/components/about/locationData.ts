import { CONTACT } from "@/components/footer/data";
import type { Locale } from "@/i18n/config";

export const HQ = {
  lat: 18.4768114,
  lng: -69.9109066,
  zoom: 17,
} as const;

export const MAP_STYLE_DARK = "mapbox://styles/mapbox/dark-v11";
export const MAP_STYLE_LIGHT = "mapbox://styles/mapbox/light-v11";

export function formatCoords(lat: number, lng: number) {
  return {
    lat: `${Math.abs(lat).toFixed(4)}° ${lat >= 0 ? "N" : "S"}`,
    lng: `${Math.abs(lng).toFixed(4)}° ${lng >= 0 ? "E" : "W"}`,
  };
}

export const DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${HQ.lat},${HQ.lng}`;

export const MAP_URL = `https://www.google.com/maps/search/?api=1&query=${HQ.lat},${HQ.lng}`;

export const LOCATION_COPY = {
  en: {
    eyebrow: "Location",
    heading: "We operate from Santo Domingo.",
    plotLabel: "CQ · Operations HQ",
    mapAriaLabel: "Map showing Center Quest's operations centre in Santo Domingo",
    addressLabel: "Address",
    cityLabel: "City",
    coordsLabel: "Coordinates",
    directions: "Get directions",
    fallbackTitle: "Map unavailable",
    fallbackBody: "Open the location in Google Maps instead.",
    fallbackAction: "Open in Google Maps",
  },
  es: {
    eyebrow: "Ubicación",
    heading: "Operamos desde Santo Domingo.",
    lead: "Un piso, un centro de operaciones, en el Ensanche Miraflores. Ven a ver la sala donde correrá tu campaña — recibimos visitas, agenda la tuya al solicitar tu cotización.",
    plotLabel: "CQ · Sede operativa",
    mapAriaLabel: "Mapa con el centro de operaciones de Center Quest en Santo Domingo",
    addressLabel: "Dirección",
    cityLabel: "Ciudad",
    coordsLabel: "Coordenadas",
    directions: "Cómo llegar",
    fallbackTitle: "Mapa no disponible",
    fallbackBody: "Abre la ubicación en Google Maps.",
    fallbackAction: "Abrir en Google Maps",
  },
} satisfies Record<Locale, Record<string, string>>;

export { CONTACT };
