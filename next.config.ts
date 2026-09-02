import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Que Node lo cargue desde node_modules en vez de empaquetarlo: BlockNote
     expone su código fuente y el bundler puede resolverlo en lugar del compilado.
     @blocknote/server-util salió de esta lista el 2026-08-27: ya no lo importa
     nada del lado del servidor (el HTML del blog lo arma el editor en el
     navegador, ver BlockEditor.tsx/getHtml). Ese paquete cargaba jsdom vía
     Node require() en runtime, y su árbol de dependencias (htmlparser2,
     parse5, css-calc...) rompía cada vez que algo tres niveles abajo publicaba
     una versión ESM-only — nunca hubo forma de fijarlo de una vez por todas. */
  serverExternalPackages: ["@blocknote/core"],

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
  /* No son señal de ranking, pero son gratis y refuerzan la confianza que
     Google sí mide indirectamente (HTTPS, ausencia de mixed content). */
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
      {
        /* El panel previsualiza el CV en un <iframe> same-origin
           (ApplicationDetail.tsx). DENY global bloquea ese frame aunque
           sea del mismo sitio, así que esta ruta necesita SAMEORIGIN. */
        source: "/api/admin/applications/:id/resume",
        headers: [{ key: "X-Frame-Options", value: "SAMEORIGIN" }],
      },
    ];
  },
  images: {
    /* 92 es para la foto grupal de #metrics: es un retrato de grupo con caras
       pequeñas, y a 82 el JPEG de origen ya llega con artefactos propios que
       la recompresión amplifica en cuanto alguien hace zoom. */
    qualities: [75, 82, 92],
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "**.public.blob.vercel-storage.com" },
    ],
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
