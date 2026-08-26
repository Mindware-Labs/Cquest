import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Que Node los cargue desde node_modules en vez de empaquetarlos: BlockNote
     expone su código fuente y el bundler puede resolverlo en lugar del compilado.
     sanitize-html se queda fuera de esta lista: su dependencia htmlparser2 es
     ESM puro y Node no puede hacerle require() nativo, así que necesita pasar
     por el bundler para que el interop CJS/ESM funcione. */
  serverExternalPackages: ["@blocknote/server-util", "@blocknote/core"],

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
