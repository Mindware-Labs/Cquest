import type { MetadataRoute } from "next";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://centerquest.example").replace(/\/$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    /* `disallow` acompaña al enlace nuevo del pie hacia /admin.
       -----------------------------------------------------------------------
       No es una medida de seguridad y no hay que leerla como tal: robots.txt es
       una petición que sólo respetan los buscadores serios, y /admin es la
       primera URL que prueba cualquier robot que escanea un sitio. Lo que
       protege el panel es el guard de sesión, no esto.

       Lo que sí hace es evitar que Google gaste presupuesto de rastreo en
       pantallas que nunca va a indexar, y que /admin/login termine apareciendo
       en los resultados de una búsqueda de marca.

       Las previsualizaciones de artículos van por el mismo motivo: llevan
       `noindex` en su propia metadata, pero un enlace pegado en un ticket o un
       chat puede hacer que un rastreador las descubra igual. */
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api/", "/*/blog/*/preview"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
