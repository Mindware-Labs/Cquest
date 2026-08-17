import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  experimental: {
    /* El formulario de empleos manda un CV por Server Action, y Next limita
       esos bodies a 1 MB por defecto. CV_MAX_BYTES (careers/data/application.ts)
       permite 5 MB, y multipart agrega boundaries y headers encima — 6mb deja
       ese margen sin convertir el endpoint en un sumidero de subidas. */
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
  images: {
    /* 92 es para la foto grupal de #metrics: es un retrato de grupo con caras
       pequeñas, y a 82 el JPEG de origen ya llega con artefactos propios que
       la recompresión amplifica en cuanto alguien hace zoom. */
    qualities: [75, 82, 92],
    formats: ["image/avif", "image/webp"],
    // Hero/brand photography is static and rarely changes — cache the
    // optimized output for a month instead of re-transforming every 4 hours.
    minimumCacheTTL: 2678400,
  },
  // No `experimental.viewTransition`. Route transitions are handled entirely
  // by RouteTransition's curtain; enabling the flag again lets a stray
  // <ViewTransition> paint route snapshots in the top layer, above the
  // curtain, which reintroduces the outgoing-page flash. See styles/base.css.
};

export default nextConfig;
